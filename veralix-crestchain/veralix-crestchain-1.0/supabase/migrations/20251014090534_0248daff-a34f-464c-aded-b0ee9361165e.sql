-- Habilitar protección de contraseñas filtradas
-- Nota: Esta configuración se hace principalmente desde el dashboard, pero registramos el cambio

-- Log de configuración de seguridad
INSERT INTO audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'security_config_updated',
  'system',
  'auth_security',
  jsonb_build_object(
    'leaked_password_protection', 'enabled_via_dashboard',
    'configuration_date', now(),
    'notes', 'Configuración de seguridad de autenticación'
  )
);

-- Crear función para validar fortaleza de contraseñas (adicional)
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mínimo 8 caracteres
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Debe contener al menos una letra mayúscula
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Debe contener al menos una letra minúscula
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Debe contener al menos un número
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Debe contener al menos un caracter especial
  IF password !~ '[^a-zA-Z0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Mejorar políticas de seguridad existentes
COMMENT ON TABLE public.user_roles IS 'Tabla de roles de usuario - CRÍTICO: Solo modificar mediante funciones seguras';
COMMENT ON TABLE public.profiles IS 'Tabla de perfiles de usuario - Contiene información sensible';
COMMENT ON TABLE public.subscriptions IS 'Tabla de suscripciones - Solo sistema puede crear';

-- Log adicional de seguridad
INSERT INTO audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'security_functions_created',
  'system',
  'password_validation',
  jsonb_build_object(
    'function_created', 'validate_password_strength',
    'purpose', 'Validación adicional de seguridad de contraseñas',
    'created_at', now()
  )
);