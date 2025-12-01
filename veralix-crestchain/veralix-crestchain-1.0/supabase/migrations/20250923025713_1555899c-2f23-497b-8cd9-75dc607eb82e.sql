-- Create enum types for better data consistency
CREATE TYPE public.jewelry_type AS ENUM (
  'anillo', 'collar', 'pulsera', 'pendientes', 'broche', 
  'reloj', 'cadena', 'dije', 'gemelos', 'tiara', 'otro'
);

CREATE TYPE public.jewelry_status AS ENUM (
  'draft', 'pending', 'certificated', 'failed'
);

CREATE TYPE public.subscription_status AS ENUM (
  'active', 'canceled', 'past_due', 'unpaid', 'trialing'
);

CREATE TYPE public.subscription_plan AS ENUM (
  'starter', 'professional', 'enterprise'
);

CREATE TYPE public.blockchain_network AS ENUM (
  'ethereum', 'solana', 'polygon'
);

-- Jewelry Items Table
CREATE TABLE public.jewelry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type jewelry_type NOT NULL,
  description TEXT,
  materials TEXT[] DEFAULT '{}',
  weight DECIMAL(10,3), -- in grams
  dimensions TEXT,
  origin TEXT,
  craftsman TEXT,
  serial_number TEXT,
  certification_info TEXT,
  sale_price DECIMAL(12,2),
  currency TEXT DEFAULT 'COP',
  purchase_date DATE,
  status jewelry_status DEFAULT 'draft',
  images_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- NFT Certificates Table
CREATE TABLE public.nft_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jewelry_item_id UUID NOT NULL REFERENCES public.jewelry_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id TEXT NOT NULL UNIQUE, -- Format: VRX-001, VRX-002, etc.
  blockchain_network blockchain_network NOT NULL DEFAULT 'ethereum',
  contract_address TEXT,
  token_id TEXT,
  transaction_hash TEXT,
  block_number TEXT,
  metadata_uri TEXT, -- IPFS URI
  verification_url TEXT,
  qr_code_url TEXT,
  certificate_pdf_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'trialing',
  price_per_month DECIMAL(10,2) NOT NULL,
  certificates_limit INTEGER NOT NULL,
  certificates_used INTEGER DEFAULT 0,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions/Usage History Table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jewelry_item_id UUID REFERENCES public.jewelry_items(id) ON DELETE SET NULL,
  nft_certificate_id UUID REFERENCES public.nft_certificates(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'certificate_creation', 'verification', 'plan_upgrade', etc.
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'COP',
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_jewelry_items_user_id ON public.jewelry_items(user_id);
CREATE INDEX idx_jewelry_items_status ON public.jewelry_items(status);
CREATE INDEX idx_jewelry_items_type ON public.jewelry_items(type);
CREATE INDEX idx_jewelry_items_created_at ON public.jewelry_items(created_at DESC);

CREATE INDEX idx_nft_certificates_user_id ON public.nft_certificates(user_id);
CREATE INDEX idx_nft_certificates_jewelry_item_id ON public.nft_certificates(jewelry_item_id);
CREATE INDEX idx_nft_certificates_certificate_id ON public.nft_certificates(certificate_id);
CREATE INDEX idx_nft_certificates_blockchain ON public.nft_certificates(blockchain_network);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE public.jewelry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jewelry_items
CREATE POLICY "Users can view their own jewelry items" 
ON public.jewelry_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jewelry items" 
ON public.jewelry_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jewelry items" 
ON public.jewelry_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jewelry items" 
ON public.jewelry_items FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for nft_certificates
CREATE POLICY "Users can view their own certificates" 
ON public.nft_certificates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create certificates for their jewelry" 
ON public.nft_certificates FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificates" 
ON public.nft_certificates FOR UPDATE 
USING (auth.uid() = user_id);

-- Public read access for certificate verification (anyone can verify)
CREATE POLICY "Anyone can verify certificates by certificate_id" 
ON public.nft_certificates FOR SELECT 
USING (certificate_id IS NOT NULL);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add update triggers for timestamps
CREATE TRIGGER update_jewelry_items_updated_at
  BEFORE UPDATE ON public.jewelry_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nft_certificates_updated_at
  BEFORE UPDATE ON public.nft_certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique certificate IDs
CREATE OR REPLACE FUNCTION public.generate_certificate_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INTEGER;
BEGIN
  -- Get the next sequential number
  SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_id FROM 5) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.nft_certificates
  WHERE certificate_id ~ '^VRX-[0-9]+$';
  
  -- Format as VRX-001, VRX-002, etc.
  new_id := 'VRX-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;