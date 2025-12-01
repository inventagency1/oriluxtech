-- Crear función para notificar al admin cuando se crea una joya
CREATE OR REPLACE FUNCTION notify_admin_jewelry_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_joyero_name TEXT;
  v_joyero_email TEXT;
  v_admin_email TEXT;
  v_jewelry_type_display TEXT;
BEGIN
  -- Obtener información del joyero
  SELECT 
    COALESCE(p.full_name, p.business_name, 'Usuario sin nombre'),
    COALESCE(p.email, u.email)
  INTO v_joyero_name, v_joyero_email
  FROM auth.users u
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE u.id = NEW.user_id;

  -- Obtener email del administrador desde configuración del sistema
  -- Por defecto usaremos un email configurado en secrets
  v_admin_email := current_setting('app.admin_email', true);
  
  -- Si no hay admin email configurado, no enviar
  IF v_admin_email IS NULL OR v_admin_email = '' THEN
    RAISE NOTICE 'No admin email configured, skipping notification';
    RETURN NEW;
  END IF;

  -- Convertir tipo de joya a formato display
  v_jewelry_type_display := CASE NEW.type
    WHEN 'anillo' THEN 'Anillo'
    WHEN 'collar' THEN 'Collar'
    WHEN 'pulsera' THEN 'Pulsera'
    WHEN 'pendientes' THEN 'Pendientes'
    WHEN 'broche' THEN 'Broche'
    WHEN 'reloj' THEN 'Reloj'
    WHEN 'cadena' THEN 'Cadena'
    WHEN 'dije' THEN 'Dije'
    WHEN 'gemelos' THEN 'Gemelos'
    WHEN 'tiara' THEN 'Tiara'
    ELSE 'Otro'
  END;

  -- Llamar a la función de envío de email
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url', false) || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', false)
      ),
      body := jsonb_build_object(
        'type', 'admin-jewelry-created',
        'to', v_admin_email,
        'data', jsonb_build_object(
          'jewelryName', NEW.name,
          'jewelryType', v_jewelry_type_display,
          'joyeroName', v_joyero_name,
          'joyeroEmail', v_joyero_email,
          'materials', COALESCE(NEW.materials, ARRAY[]::text[]),
          'salePrice', COALESCE(NEW.sale_price, 0),
          'currency', COALESCE(NEW.currency, 'COP'),
          'jewelryId', NEW.id,
          'createdAt', NEW.created_at
        )
      )::text
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error pero no fallar la transacción
    RAISE NOTICE 'Error sending admin notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Crear trigger para llamar a la función cuando se inserta una nueva joya
DROP TRIGGER IF EXISTS trigger_notify_admin_jewelry_created ON jewelry_items;
CREATE TRIGGER trigger_notify_admin_jewelry_created
  AFTER INSERT ON jewelry_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_jewelry_created();

-- Comentario explicativo
COMMENT ON FUNCTION notify_admin_jewelry_created() IS 
'Envía un email al administrador cuando un joyero crea una nueva joya. 
Requiere configurar app.admin_email en los settings de Supabase.';
