-- Eliminar la versión antigua de log_audit_action que acepta jsonb
-- Esto resuelve el conflicto de sobrecarga de funciones
DROP FUNCTION IF EXISTS public.log_audit_action(text, text, text, jsonb, inet, text);

-- La versión con json ya existe de la migración anterior, 
-- así que no necesitamos recrearla