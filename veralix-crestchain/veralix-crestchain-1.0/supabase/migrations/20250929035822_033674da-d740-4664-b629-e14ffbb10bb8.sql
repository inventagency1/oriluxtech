-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::app_role
  )
$$;

-- Create admin management function for user roles
CREATE OR REPLACE FUNCTION public.admin_change_user_role(_target_user_id uuid, _new_role app_role)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the current user is admin
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Only admins can change user roles');
  END IF;
  
  -- Log the admin role change attempt
  PERFORM log_audit_action(
    'admin_role_change',
    'user',
    _target_user_id::text,
    json_build_object(
      'admin_user_id', auth.uid(),
      'new_role', _new_role,
      'message', 'Admin changed user role to ' || _new_role
    )
  );

  -- Use UPSERT to change the target user's role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    created_at = now();
  
  RETURN json_build_object('success', true, 'new_role', _new_role);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;