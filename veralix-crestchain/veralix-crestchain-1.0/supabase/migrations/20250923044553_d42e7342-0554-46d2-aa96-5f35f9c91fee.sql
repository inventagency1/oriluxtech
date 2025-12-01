-- Create airdrops table for token distribution management
CREATE TABLE public.airdrops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  token_amount NUMERIC NOT NULL DEFAULT 0,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  distributed_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  eligibility_criteria JSONB DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  frequency_hours INTEGER DEFAULT 24, -- Frequency in hours between airdrops
  last_distribution_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create airdrop_claims table to track who received tokens
CREATE TABLE public.airdrop_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  airdrop_id UUID NOT NULL REFERENCES public.airdrops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  token_amount NUMERIC NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  transaction_hash TEXT,
  UNIQUE(airdrop_id, user_id)
);

-- Create user_tokens table to track user token balances
CREATE TABLE public.user_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  token_balance NUMERIC NOT NULL DEFAULT 0,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.airdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airdrop_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for airdrops
CREATE POLICY "Admins can manage all airdrops" 
ON public.airdrops 
FOR ALL 
USING (has_role(auth.uid(), 'joyero'::app_role));

CREATE POLICY "Users can view active airdrops" 
ON public.airdrops 
FOR SELECT 
USING (status = 'active' AND start_date <= now() AND (end_date IS NULL OR end_date >= now()));

-- RLS Policies for airdrop_claims
CREATE POLICY "Users can view their own claims" 
ON public.airdrop_claims 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims" 
ON public.airdrop_claims 
FOR SELECT 
USING (has_role(auth.uid(), 'joyero'::app_role));

CREATE POLICY "System can create claims" 
ON public.airdrop_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'joyero'::app_role));

-- RLS Policies for user_tokens
CREATE POLICY "Users can view their own tokens" 
ON public.user_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tokens" 
ON public.user_tokens 
FOR SELECT 
USING (has_role(auth.uid(), 'joyero'::app_role));

CREATE POLICY "Users can create their own token record" 
ON public.user_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update token balances" 
ON public.user_tokens 
FOR UPDATE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'joyero'::app_role));

-- Function to distribute airdrop tokens
CREATE OR REPLACE FUNCTION public.distribute_airdrop_tokens(_airdrop_id UUID, _recipient_user_ids UUID[])
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  airdrop_record record;
  recipient_id UUID;
  claim_count INTEGER;
BEGIN
  -- Check if user has admin role
  IF NOT has_role(auth.uid(), 'joyero'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Get airdrop details
  SELECT * INTO airdrop_record FROM public.airdrops WHERE id = _airdrop_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Airdrop not found');
  END IF;
  
  IF airdrop_record.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Airdrop is not active');
  END IF;
  
  claim_count := 0;
  
  -- Process each recipient
  FOREACH recipient_id IN ARRAY _recipient_user_ids LOOP
    -- Check if user already claimed this airdrop
    IF NOT EXISTS (SELECT 1 FROM public.airdrop_claims WHERE airdrop_id = _airdrop_id AND user_id = recipient_id) THEN
      -- Create claim record
      INSERT INTO public.airdrop_claims (airdrop_id, user_id, token_amount)
      VALUES (_airdrop_id, recipient_id, airdrop_record.token_amount);
      
      -- Update or create user token balance
      INSERT INTO public.user_tokens (user_id, token_balance, total_earned)
      VALUES (recipient_id, airdrop_record.token_amount, airdrop_record.token_amount)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        token_balance = user_tokens.token_balance + EXCLUDED.token_balance,
        total_earned = user_tokens.total_earned + EXCLUDED.total_earned,
        last_updated = now();
      
      claim_count := claim_count + 1;
    END IF;
  END LOOP;
  
  -- Update airdrop statistics
  UPDATE public.airdrops 
  SET 
    distributed_count = distributed_count + claim_count,
    last_distribution_at = now(),
    updated_at = now()
  WHERE id = _airdrop_id;
  
  RETURN json_build_object('success', true, 'claims_created', claim_count);
END;
$$;

-- Function to check if enough time has passed for next airdrop
CREATE OR REPLACE FUNCTION public.can_distribute_airdrop(_airdrop_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN last_distribution_at IS NULL THEN true
    WHEN last_distribution_at + (frequency_hours * INTERVAL '1 hour') <= now() THEN true
    ELSE false
  END
  FROM public.airdrops 
  WHERE id = _airdrop_id AND status = 'active';
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_airdrops_updated_at
BEFORE UPDATE ON public.airdrops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tokens_updated_at
BEFORE UPDATE ON public.user_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();