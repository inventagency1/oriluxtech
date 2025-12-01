-- Promover megastoresco@gmail.com a admin
-- User ID: 437ec4f6-d647-417f-8edc-35ff4bc1bf3f

-- Actualizar rol de joyero a admin
UPDATE public.user_roles 
SET 
  role = 'admin'::app_role,
  created_at = now()
WHERE user_id = '437ec4f6-d647-417f-8edc-35ff4bc1bf3f';

-- Registrar el cambio en audit_logs
INSERT INTO public.audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  '437ec4f6-d647-417f-8edc-35ff4bc1bf3f',
  'role_change',
  'user',
  '437ec4f6-d647-417f-8edc-35ff4bc1bf3f',
  jsonb_build_object(
    'old_role', 'joyero',
    'new_role', 'admin',
    'reason', 'Admin promotion via migration',
    'promoted_by', 'system_admin',
    'timestamp', now()
  )
);