-- Actualizar el rol de Sebastian a admin
UPDATE public.user_roles 
SET role = 'admin'::app_role,
    created_at = now()
WHERE user_id = '437ec4f6-d647-417f-8edc-35ff4bc1bf3f';

-- Verificar el cambio
SELECT 
  ur.user_id,
  ur.role,
  ur.created_at,
  p.email,
  p.full_name,
  p.business_name
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.user_id = '437ec4f6-d647-417f-8edc-35ff4bc1bf3f';