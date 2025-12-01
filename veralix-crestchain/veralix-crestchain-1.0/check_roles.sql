-- Verificar usuarios y sus roles actuales
SELECT 
    u.email,
    u.id as user_id,
    ur.role,
    ur.created_at as role_assigned_at,
    u.created_at as user_created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
