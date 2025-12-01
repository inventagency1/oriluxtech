-- ============================================
-- AGREGAR ADMIN: inventagency20@gmail.com
-- Fecha: 2025-11-29
-- ============================================
-- Ejecutar en Supabase SQL Editor

-- Asignar rol admin al usuario inventagency20@gmail.com
DO $$
DECLARE
    user_record RECORD;
    target_email TEXT := 'inventagency20@gmail.com';
BEGIN
    -- Buscar usuario por email
    SELECT id INTO user_record 
    FROM auth.users 
    WHERE LOWER(email) = LOWER(target_email);
    
    IF user_record.id IS NOT NULL THEN
        -- Insertar o actualizar rol a admin
        INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
        VALUES (user_record.id, 'admin', NOW(), NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'admin', updated_at = NOW();
        
        RAISE NOTICE '✅ Usuario % configurado como ADMIN', target_email;
    ELSE
        RAISE NOTICE '❌ Usuario % NO encontrado - debe registrarse primero', target_email;
    END IF;
END $$;

-- Verificar que se aplicó correctamente
SELECT 
    u.email,
    ur.role,
    ur.updated_at as "fecha_actualizacion"
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE LOWER(u.email) = 'inventagency20@gmail.com';
