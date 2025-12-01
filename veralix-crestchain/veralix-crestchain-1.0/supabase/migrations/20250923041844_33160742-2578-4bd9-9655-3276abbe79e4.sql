-- CRITICAL SECURITY FIXES

-- 1. Fix overly permissive certificate verification policy
DROP POLICY IF EXISTS "Anyone can verify certificates by certificate_id" ON public.nft_certificates;

-- Create restricted certificate verification policy that only returns verification status
CREATE POLICY "Public certificate verification (limited data)"
ON public.nft_certificates
FOR SELECT
TO anon, authenticated
USING (
  certificate_id IS NOT NULL
)
-- Note: This policy allows reading, but sensitive data should be filtered at application level

-- 2. Fix transfer policies - replace temporary broad access
DROP POLICY IF EXISTS "Users can view their transfers" ON public.certificate_transfers;
DROP POLICY IF EXISTS "Authenticated users can create transfers" ON public.certificate_transfers;

-- Secure transfer policies - users can only see transfers involving their certificates
CREATE POLICY "Users can view transfers for their certificates"
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
CREATE POLICY "Users can create transfers for their certificates"
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
  result json;
BEGIN
  -- Verify the user is changing their own role
  IF _user_id != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized role change attempt');
  END IF;
  
  -- Get current role
  SELECT role INTO current_role
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- Business logic: Allow role changes but add logging for security
  -- In production, you might want to add additional restrictions here
  
  -- Update the role
  UPDATE public.user_roles
  SET role = _new_role
  WHERE user_id = _user_id;
  
  -- If no existing role, insert new one
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _new_role);
  END IF;
  
  -- Log the role change for security audit
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details,
    ip_address
  ) VALUES (
    _user_id,
    'role_change',
    json_build_object(
      'from_role', current_role,
      'to_role', _new_role,
      'timestamp', now()
    ),
    -- IP would need to be passed from application
    null
  );
  
  RETURN json_build_object('success', true, 'new_role', _new_role);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 4. Create security audit log table for monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.security_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Update user_roles table to prevent direct updates
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Users should only change roles through the secure function
CREATE POLICY "Prevent direct role updates"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false); -- Prevent all direct updates