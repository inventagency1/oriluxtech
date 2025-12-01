-- Función especial solo para testing que permite cambiar roles sin restricciones
-- ADVERTENCIA: Esta función debe ser removida en producción
CREATE OR REPLACE FUNCTION public.testing_change_role(
  _user_id uuid,
  _new_role app_role
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_role app_role;
BEGIN
  -- NOTA: Esta función bypasea todas las restricciones de seguridad
  -- Solo debe usarse en entornos de desarrollo/testing
  
  -- Obtener rol actual
  SELECT role INTO old_role
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- Actualizar o insertar rol
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    created_at = NOW();
  
  -- Log de auditoría
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    _user_id,
    'testing_role_change',
    'user',
    _user_id::TEXT,
    json_build_object(
      'old_role', old_role,
      'new_role', _new_role,
      'changed_at', NOW(),
      'warning', 'Changed via testing function - bypassed security'
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'old_role', old_role,
    'new_role', _new_role
  );
END;
$$;