-- Agregar configuración de blockchain network para certificados
-- Permite cambiar entre CRESTCHAIN y ORILUXCHAIN desde el admin

INSERT INTO public.system_settings (key, value, description) 
VALUES (
  'blockchain_network', 
  '{"active": "CRESTCHAIN", "networks": {"CRESTCHAIN": {"name": "CrestChain", "rpc_url": "https://rpc.crestchain.pro", "explorer": "https://scan.crestchain.pro", "enabled": true}, "ORILUXCHAIN": {"name": "OriluxChain", "rpc_url": "http://localhost:5000", "explorer": "http://localhost:5000/explorer", "enabled": true}}}'::jsonb,
  'Configuración de la red blockchain activa para generación de certificados'
)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Función para obtener la red blockchain activa
CREATE OR REPLACE FUNCTION public.get_active_blockchain()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value->>'active'
  FROM public.system_settings
  WHERE key = 'blockchain_network'
  LIMIT 1
$$;

-- Función para cambiar la red blockchain activa (solo admins)
CREATE OR REPLACE FUNCTION public.set_active_blockchain(_network TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_value JSONB;
  v_networks JSONB;
BEGIN
  -- Verificar que quien ejecuta es admin
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Solo administradores pueden cambiar la red blockchain'
    );
  END IF;
  
  -- Validar que la red es válida
  IF _network NOT IN ('CRESTCHAIN', 'ORILUXCHAIN') THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Red no válida. Use CRESTCHAIN o ORILUXCHAIN'
    );
  END IF;
  
  -- Obtener configuración actual
  SELECT value INTO v_current_value
  FROM public.system_settings
  WHERE key = 'blockchain_network';
  
  -- Verificar que la red está habilitada
  v_networks := v_current_value->'networks';
  IF NOT (v_networks->_network->>'enabled')::boolean THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Esta red no está habilitada'
    );
  END IF;
  
  -- Actualizar la red activa
  UPDATE public.system_settings
  SET 
    value = jsonb_set(value, '{active}', to_jsonb(_network)),
    updated_at = NOW()
  WHERE key = 'blockchain_network';
  
  -- Log de auditoría
  PERFORM log_audit_action(
    'blockchain_network_changed',
    'system',
    'blockchain_network',
    json_build_object(
      'admin_id', auth.uid(),
      'old_network', v_current_value->>'active',
      'new_network', _network,
      'timestamp', NOW()
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Red blockchain cambiada a ' || _network,
    'active_network', _network
  );
END;
$$;
