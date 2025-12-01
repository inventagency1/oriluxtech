-- Migración de setup inicial de roles
-- JUSTIFICACIÓN: Setup inicial del sistema - se requiere bypass temporal de seguridad
-- para asignar el primer admin. Después de esto, todos los cambios de roles
-- deben hacerse a través de la función admin_change_user_role

-- 1. Actualizar inventagency@outlook.com a ADMIN (usuario principal)
UPDATE public.user_roles
SET role = 'admin'::app_role,
    created_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'inventagency@outlook.com');

-- Log del cambio a admin
INSERT INTO public.audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'inventagency@outlook.com'),
  'role_change',
  'user_roles',
  (SELECT id FROM auth.users WHERE email = 'inventagency@outlook.com')::text,
  jsonb_build_object(
    'old_role', 'cliente',
    'new_role', 'admin',
    'reason', 'Initial admin setup',
    'performed_by', 'system_migration',
    'timestamp', now()
  )
);

-- 2. Asignar rol joyero al usuario sin rol
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'edwardtorredoficial@gmail.com'),
  'joyero'::app_role
)
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'joyero'::app_role,
  created_at = now();

-- Log del nuevo rol asignado
INSERT INTO public.audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'edwardtorredoficial@gmail.com'),
  'role_assigned',
  'user_roles',
  (SELECT id FROM auth.users WHERE email = 'edwardtorredoficial@gmail.com')::text,
  jsonb_build_object(
    'new_role', 'joyero',
    'reason', 'Missing role assignment',
    'performed_by', 'system_migration',
    'timestamp', now()
  )
);