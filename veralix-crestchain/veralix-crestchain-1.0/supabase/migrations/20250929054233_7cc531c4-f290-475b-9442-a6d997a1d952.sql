-- 1. Verificar que el enum app_role está bien definido
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role as enum ('admin', 'joyero', 'cliente');
    END IF;
END $$;

-- 2. Recrear la función handle_new_user para GARANTIZAR seguridad
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  
  -- CRÍTICO: SIEMPRE asignar rol 'cliente' por defecto
  -- NUNCA admin o joyero automáticamente
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente'::app_role);
  
  -- Log de seguridad
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    resource_type, 
    details
  ) VALUES (
    NEW.id,
    'user_registered',
    'user_roles',
    json_build_object(
      'default_role_assigned', 'cliente',
      'email', NEW.email,
      'registration_time', now()
    )
  );
  
  RETURN NEW;
END;
$$;

-- 3. Verificar que el trigger está activo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();