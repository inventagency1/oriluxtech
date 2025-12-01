-- ============================================
-- SETUP ADMIN USERS - VERALIX PRODUCTION
-- Fecha: 2025-11-27
-- ============================================
-- Ejecutar DESPUÉS de que los usuarios se hayan registrado

-- Asignar rol admin a los usuarios especificados
-- (los admins tendrán acceso a todas las funciones de joyero también)

DO $$
DECLARE
    admin_emails TEXT[] := ARRAY[
        'inventagency@outlook.com',
        'inventagency20@gmail.com',
        'jonathanjtp@gmail.com',
        'edwardtorresoficial@gmail.com'
    ];
    email_item TEXT;
    user_record RECORD;
BEGIN
    FOREACH email_item IN ARRAY admin_emails
    LOOP
        -- Buscar usuario por email (case insensitive)
        SELECT id INTO user_record 
        FROM auth.users 
        WHERE LOWER(email) = LOWER(email_item);
        
        IF user_record.id IS NOT NULL THEN
            -- Insertar o actualizar rol
            INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
            VALUES (user_record.id, 'admin', NOW(), NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET role = 'admin', updated_at = NOW();
            
            RAISE NOTICE 'Usuario % configurado como admin', email_item;
        ELSE
            RAISE NOTICE 'Usuario % no encontrado - debe registrarse primero', email_item;
        END IF;
    END LOOP;
END $$;

-- Verificar usuarios configurados
SELECT 
    u.email,
    ur.role,
    ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE LOWER(u.email) IN (
    'inventagency@outlook.com',
    'inventagency20@gmail.com',
    'jonathanjtp@gmail.com',
    'edwardtorresoficial@gmail.com'
);
