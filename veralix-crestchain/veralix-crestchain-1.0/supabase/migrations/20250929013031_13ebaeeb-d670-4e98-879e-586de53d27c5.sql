-- Create function to increment certificate usage in subscription
CREATE OR REPLACE FUNCTION public.increment_certificate_usage(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions 
  SET 
    certificates_used = certificates_used + 1,
    updated_at = now()
  WHERE user_id = user_uuid 
    AND status = 'active';
END;
$$;

-- Add new jewelry status for certified items
ALTER TYPE jewelry_status ADD VALUE IF NOT EXISTS 'certified';

-- Create index on certificate_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_nft_certificates_certificate_id ON public.nft_certificates(certificate_id);

-- Create index on jewelry_item_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_nft_certificates_jewelry_item_id ON public.nft_certificates(jewelry_item_id);