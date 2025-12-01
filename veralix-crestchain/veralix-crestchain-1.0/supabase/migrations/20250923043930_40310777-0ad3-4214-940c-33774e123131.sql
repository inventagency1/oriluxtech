-- Fix duplicate user roles issue
-- First, remove duplicate roles, keeping only the most recent one
WITH duplicates AS (
  SELECT user_id, role, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM public.user_roles
)
DELETE FROM public.user_roles 
WHERE id IN (
  SELECT ur.id 
  FROM public.user_roles ur
  JOIN duplicates d ON ur.user_id = d.user_id AND ur.created_at = d.created_at
  WHERE d.rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_role UNIQUE (user_id);

-- Update the secure_role_change function to handle upserts properly
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
  
  -- Use UPSERT (INSERT ... ON CONFLICT DO UPDATE) to avoid duplicates
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _new_role)
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