-- Fix RLS policies for nft_certificates to ensure proper access

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.nft_certificates;
DROP POLICY IF EXISTS "Certificate creators can view their created certificates" ON public.nft_certificates;
DROP POLICY IF EXISTS "Certificate owners can view their owned certificates" ON public.nft_certificates;
DROP POLICY IF EXISTS "Anyone can verify certificates by certificate_id" ON public.nft_certificates;

-- Create unified policy for viewing certificates
-- Users can view certificates they created OR own
CREATE POLICY "Users can view their certificates"
ON public.nft_certificates
FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.uid() = owner_id OR
  certificate_id IS NOT NULL  -- Allow public verification by certificate_id
);

-- Ensure service role can always access (for Edge Functions)
CREATE POLICY "Service role full access"
ON public.nft_certificates
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Joyeros can create certificates
DROP POLICY IF EXISTS "Joyeros can create certificates for their jewelry" ON public.nft_certificates;
CREATE POLICY "Joyeros can create certificates"
ON public.nft_certificates
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.jewelry_items 
    WHERE id = jewelry_item_id 
    AND user_id = auth.uid()
  )
);

-- Owners can update their certificates
DROP POLICY IF EXISTS "Certificate owners can update certificates they own" ON public.nft_certificates;
DROP POLICY IF EXISTS "Certificate owners can update certificates" ON public.nft_certificates;
CREATE POLICY "Owners can update certificates"
ON public.nft_certificates
FOR UPDATE
USING (auth.uid() = owner_id OR auth.uid() = user_id);

-- Add index for owner_id if not exists
CREATE INDEX IF NOT EXISTS idx_nft_certificates_owner_id ON public.nft_certificates(owner_id);

-- Ensure all certificates have owner_id set
UPDATE public.nft_certificates 
SET owner_id = user_id 
WHERE owner_id IS NULL;
