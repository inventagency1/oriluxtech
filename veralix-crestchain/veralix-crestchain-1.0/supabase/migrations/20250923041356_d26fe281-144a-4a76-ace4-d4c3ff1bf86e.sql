-- First, just add the columns
ALTER TABLE public.nft_certificates ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE public.nft_certificates ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.nft_certificates ADD COLUMN IF NOT EXISTS transfer_notes TEXT;

-- Update existing certificates to have owner_id = user_id (creator owns initially)
UPDATE public.nft_certificates SET owner_id = user_id WHERE owner_id IS NULL;