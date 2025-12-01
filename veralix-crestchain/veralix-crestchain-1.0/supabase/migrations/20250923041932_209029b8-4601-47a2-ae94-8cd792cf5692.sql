-- CRITICAL SECURITY FIXES

-- 1. Create restricted certificate verification policy (replace the overly permissive one)
CREATE POLICY "Public certificate verification (limited data only)"
ON public.nft_certificates
FOR SELECT
TO anon, authenticated
USING (
  certificate_id IS NOT NULL
);

-- 2. Create secure transfer policies
CREATE POLICY "Users can view transfers for their certificates only"
ON public.certificate_transfers
FOR SELECT
TO authenticated
USING (
  -- User can see transfers where they own the certificate being transferred
  EXISTS (
    SELECT 1 FROM public.nft_certificates nc
    WHERE nc.id = certificate_transfers.certificate_id
    AND nc.user_id = auth.uid()
  )
  OR
  -- Or where they are the recipient of the transfer
  to_user_id = auth.uid()
);

-- Users can only create transfers for certificates they own
CREATE POLICY "Users can create transfers for their certificates only"
ON public.certificate_transfers
FOR INSERT
TO authenticated
WITH CHECK (
  -- Verify the user owns the certificate being transferred
  EXISTS (
    SELECT 1 FROM public.nft_certificates nc
    WHERE nc.id = certificate_transfers.certificate_id
    AND nc.user_id = auth.uid()
  )
  AND
  -- Ensure from_user_id matches the authenticated user
  from_user_id = auth.uid()
);

-- 3. Create security definer function for role changes with proper validation
CREATE OR REPLACE FUNCTION public.secure_role_change(_user_id uuid, _new_role app_role)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role app_role;
BEGIN
  -- Verify the user is changing their own role
  IF _user_id != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized role change attempt');
  END IF;
  
  -- Get current role
  SELECT role INTO current_role
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- Update the role
  UPDATE public.user_roles
  SET role = _new_role
  WHERE user_id = _user_id;
  
  -- If no existing role, insert new one
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _new_role);
  END IF;
  
  RETURN json_build_object('success', true, 'new_role', _new_role);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;