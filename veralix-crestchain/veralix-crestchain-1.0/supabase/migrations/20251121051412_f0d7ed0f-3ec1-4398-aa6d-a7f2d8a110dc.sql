-- Modificar log_audit_action para aceptar json en lugar de jsonb
-- Esto resuelve problemas de compatibilidad con el cliente de Supabase
CREATE OR REPLACE FUNCTION public.log_audit_action(
  _action text,
  _resource_type text,
  _resource_id text DEFAULT NULL,
  _details json DEFAULT '{}',
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    _action,
    _resource_type,
    _resource_id,
    _details::jsonb,
    _ip_address,
    _user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;