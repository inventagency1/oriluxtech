-- Remove old overly permissive policies
DROP POLICY IF EXISTS "Anyone can verify certificates by certificate_id" ON public.nft_certificates;
DROP POLICY IF EXISTS "Users can view their transfers" ON public.certificate_transfers;
DROP POLICY IF EXISTS "Authenticated users can create transfers" ON public.certificate_transfers;

-- Prevent direct role updates by removing the old update policy
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Create a restrictive policy that prevents all direct updates to user_roles
CREATE POLICY "Prevent direct role updates - use secure function"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false);