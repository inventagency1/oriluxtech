-- Asignar rol de joyero y 5 certificados a usuarios específicos
-- jonathanjtp@gmail.com -> joyero + 5 certificados
-- Edwardtorresoficial@gmail.com -> joyero + 5 certificados

-- Para jonathanjtp@gmail.com -> joyero + 5 certificados
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE LOWER(email) = LOWER('jonathanjtp@gmail.com');
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuario jonathanjtp@gmail.com no encontrado';
  ELSE
    -- Asignar rol de joyero
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (v_user_id, 'joyero'::app_role, now());
    
    -- Agregar 5 certificados de cortesía
    INSERT INTO public.certificate_purchases (
      user_id,
      package_type,
      package_name,
      certificates_purchased,
      certificates_used,
      amount_paid,
      currency,
      payment_provider,
      payment_status,
      metadata
    ) VALUES (
      v_user_id,
      'pack_10',
      'Certificados de Bienvenida',
      5,
      0,
      0,
      'COP',
      'admin_grant',
      'completed',
      '{"reason": "Certificados de bienvenida otorgados por administrador", "granted_by": "system_admin"}'::jsonb
    );
    
    RAISE NOTICE 'Usuario jonathanjtp@gmail.com: joyero + 5 certificados (ID: %)', v_user_id;
  END IF;
END $$;

-- Para Edwardtorresoficial@gmail.com -> joyero + 5 certificados
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE LOWER(email) = LOWER('Edwardtorresoficial@gmail.com');
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuario Edwardtorresoficial@gmail.com no encontrado';
  ELSE
    -- Asignar rol de joyero
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (v_user_id, 'joyero'::app_role, now());
    
    -- Agregar 5 certificados de cortesía
    INSERT INTO public.certificate_purchases (
      user_id,
      package_type,
      package_name,
      certificates_purchased,
      certificates_used,
      amount_paid,
      currency,
      payment_provider,
      payment_status,
      metadata
    ) VALUES (
      v_user_id,
      'pack_10',
      'Certificados de Bienvenida',
      5,
      0,
      0,
      'COP',
      'admin_grant',
      'completed',
      '{"reason": "Certificados de bienvenida otorgados por administrador", "granted_by": "system_admin"}'::jsonb
    );
    
    RAISE NOTICE 'Usuario Edwardtorresoficial@gmail.com: joyero + 5 certificados (ID: %)', v_user_id;
  END IF;
END $$;
