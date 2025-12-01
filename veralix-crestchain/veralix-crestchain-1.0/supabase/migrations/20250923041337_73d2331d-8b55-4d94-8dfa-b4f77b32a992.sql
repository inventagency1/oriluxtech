-- Add owner tracking to certificates
ALTER TABLE public.nft_certificates ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE public.nft_certificates ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.nft_certificates ADD COLUMN IF NOT EXISTS transfer_notes TEXT;

-- Update existing certificates to have owner_id = user_id (creator owns initially)
UPDATE public.nft_certificates SET owner_id = user_id WHERE owner_id IS NULL;

-- Make owner_id not null after setting initial values  
ALTER TABLE public.nft_certificates ALTER COLUMN owner_id SET NOT NULL;

-- Create transfers history table
CREATE TABLE public.certificate_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id UUID REFERENCES public.nft_certificates(id) ON DELETE CASCADE NOT NULL,
    from_user_id UUID REFERENCES auth.users(id) NOT NULL,
    to_user_id UUID REFERENCES auth.users(id) NOT NULL,
    transfer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transfers
ALTER TABLE public.certificate_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for transfers
CREATE POLICY "Users can view transfers involving them"
ON public.certificate_transfers
FOR SELECT
USING (
    auth.uid()::uuid = from_user_id OR 
    auth.uid()::uuid = to_user_id
);

CREATE POLICY "Certificate creators can create transfers"
ON public.certificate_transfers
FOR INSERT
WITH CHECK (
    auth.uid()::uuid = from_user_id AND
    EXISTS (
        SELECT 1 FROM public.nft_certificates 
        WHERE id = certificate_id 
        AND user_id = auth.uid()::uuid
        AND owner_id = auth.uid()::uuid
    )
);

-- Update certificate RLS policies to consider ownership
DROP POLICY IF EXISTS "Users can view certificates they own" ON public.nft_certificates;
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.nft_certificates;

-- New policies considering creator vs owner
CREATE POLICY "Certificate creators can view their created certificates"
ON public.nft_certificates
FOR SELECT
USING (auth.uid()::uuid = user_id);

CREATE POLICY "Certificate owners can view their owned certificates"
ON public.nft_certificates
FOR SELECT
USING (auth.uid()::uuid = owner_id);

CREATE POLICY "Certificate owners can update certificates they own"
ON public.nft_certificates
FOR UPDATE
USING (auth.uid()::uuid = owner_id);