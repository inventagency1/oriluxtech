-- Arreglar trigger de mantenimiento para que funcione sin usuario autenticado
CREATE OR REPLACE FUNCTION public.log_maintenance_mode_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.key = 'maintenance_mode' THEN
    -- Solo insertar en audit_logs si hay un usuario autenticado
    IF auth.uid() IS NOT NULL OR NEW.updated_by IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details
      ) VALUES (
        COALESCE(auth.uid(), NEW.updated_by),
        'maintenance_mode_changed',
        'system_settings',
        NEW.id::text,
        jsonb_build_object(
          'old_value', OLD.value,
          'new_value', NEW.value,
          'changed_at', NOW()
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Ahora desactivar el modo mantenimiento
UPDATE system_settings 
SET value = jsonb_build_object(
  'enabled', false,
  'message', 'Estamos realizando mejoras en Veralix. Vuelve pronto.',
  'estimated_end', null
),
updated_at = now()
WHERE key = 'maintenance_mode';