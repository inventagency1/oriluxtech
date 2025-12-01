-- =====================================================
-- MIGRACIÓN COMPLETA: SISTEMA DE GESTIÓN DE ROLES + APROBACIÓN DE JOYERÍAS
-- =====================================================

-- 1. AGREGAR COLUMNA account_status EN profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT 
CHECK (account_status IN ('pending', 'active', 'rejected', 'suspended')) 
DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- 2. CREAR TABLA role_change_requests
CREATE TABLE IF NOT EXISTS public.role_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prev_role app_role NOT NULL,
  requested_role app_role NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para role_change_requests
ALTER TABLE public.role_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON public.role_change_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create role requests"
  ON public.role_change_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND requested_role IN ('joyero', 'cliente')
    AND requested_role != prev_role
  );

CREATE POLICY "Admins can view all requests"
  ON public.role_change_requests FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update requests"
  ON public.role_change_requests FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Índices
CREATE INDEX IF NOT EXISTS idx_role_requests_user ON role_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_role_requests_status ON role_change_requests(status);

-- 3. ELIMINAR FUNCIÓN INSEGURA secure_role_change
DROP FUNCTION IF EXISTS public.secure_role_change;

-- 4. CREAR FUNCIÓN request_role_change (SEGURA)
CREATE OR REPLACE FUNCTION public.request_role_change(
  _requested_role app_role,
  _reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_prev_role app_role;
  request_id UUID;
BEGIN
  -- Obtener rol actual
  SELECT role INTO user_prev_role
  FROM public.user_roles
  WHERE user_id = auth.uid();
  
  -- CRÍTICO: NO permitir solicitudes para admin
  IF _requested_role = 'admin'::app_role THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'No puedes solicitar rol de administrador. Contacta a soporte.'
    );
  END IF;
  
  -- No permitir solicitar el mismo rol
  IF user_prev_role = _requested_role THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Ya tienes este rol'
    );
  END IF;
  
  -- Verificar si ya hay solicitud pendiente
  IF EXISTS (
    SELECT 1 FROM public.role_change_requests
    WHERE user_id = auth.uid() AND status = 'pending'
  ) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Ya tienes una solicitud pendiente'
    );
  END IF;
  
  -- Crear solicitud
  INSERT INTO public.role_change_requests (
    user_id, 
    prev_role, 
    requested_role, 
    reason
  )
  VALUES (
    auth.uid(),
    user_prev_role,
    _requested_role,
    _reason
  )
  RETURNING id INTO request_id;
  
  -- Log de auditoría
  PERFORM log_audit_action(
    'role_change_requested',
    'role_change_request',
    request_id::TEXT,
    json_build_object(
      'prev_role', user_prev_role,
      'requested_role', _requested_role,
      'reason', _reason
    )
  );
  
  RETURN json_build_object(
    'success', true, 
    'request_id', request_id,
    'message', 'Solicitud enviada. Un administrador la revisará pronto.'
  );
END;
$$;

-- 5. REEMPLAZAR admin_change_user_role
DROP FUNCTION IF EXISTS public.admin_change_user_role(uuid, app_role);

CREATE OR REPLACE FUNCTION public.admin_change_user_role(
  _target_user_id UUID,
  _new_role app_role,
  _request_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_role app_role;
BEGIN
  -- Verificar que quien ejecuta es admin
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Solo administradores pueden cambiar roles'
    );
  END IF;
  
  -- Obtener rol actual
  SELECT role INTO old_role
  FROM public.user_roles
  WHERE user_id = _target_user_id;
  
  -- Actualizar rol
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    created_at = NOW();
  
  -- Si viene de una solicitud, aprobarla
  IF _request_id IS NOT NULL THEN
    UPDATE public.role_change_requests
    SET 
      status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
    WHERE id = _request_id;
  END IF;
  
  -- Log detallado
  PERFORM log_audit_action(
    'admin_role_change',
    'user',
    _target_user_id::TEXT,
    json_build_object(
      'admin_id', auth.uid(),
      'old_role', old_role,
      'new_role', _new_role,
      'request_id', _request_id,
      'changed_at', NOW()
    )
  );
  
  RETURN json_build_object(
    'success', true, 
    'new_role', _new_role,
    'old_role', old_role
  );
END;
$$;

-- 6. FUNCIÓN reject_role_change_request
CREATE OR REPLACE FUNCTION public.reject_role_change_request(
  _request_id UUID,
  _rejection_reason TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que quien ejecuta es admin
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Solo administradores pueden rechazar solicitudes'
    );
  END IF;
  
  -- Actualizar solicitud
  UPDATE public.role_change_requests
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    rejection_reason = _rejection_reason
  WHERE id = _request_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- 7. FUNCIÓN approve_jewelry_account
CREATE OR REPLACE FUNCTION public.approve_jewelry_account(
  _user_id UUID,
  _notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que quien ejecuta es admin
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Solo administradores pueden aprobar cuentas'
    );
  END IF;
  
  -- Actualizar estado de cuenta
  UPDATE public.profiles
  SET account_status = 'active'
  WHERE user_id = _user_id;
  
  -- Log de auditoría
  PERFORM log_audit_action(
    'account_approved',
    'profile',
    _user_id::TEXT,
    json_build_object(
      'admin_id', auth.uid(),
      'notes', _notes,
      'approved_at', NOW()
    )
  );
  
  RETURN json_build_object('success', true, 'message', 'Cuenta aprobada exitosamente');
END;
$$;

-- 8. FUNCIÓN reject_jewelry_account
CREATE OR REPLACE FUNCTION public.reject_jewelry_account(
  _user_id UUID,
  _rejection_reason TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que quien ejecuta es admin
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Solo administradores pueden rechazar cuentas'
    );
  END IF;
  
  -- Actualizar estado de cuenta
  UPDATE public.profiles
  SET account_status = 'rejected'
  WHERE user_id = _user_id;
  
  -- Log de auditoría
  PERFORM log_audit_action(
    'account_rejected',
    'profile',
    _user_id::TEXT,
    json_build_object(
      'admin_id', auth.uid(),
      'rejection_reason', _rejection_reason,
      'rejected_at', NOW()
    )
  );
  
  RETURN json_build_object('success', true, 'message', 'Cuenta rechazada');
END;
$$;

-- 9. TRIGGER para updated_at en role_change_requests
CREATE OR REPLACE FUNCTION update_role_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_role_change_requests_updated_at
  BEFORE UPDATE ON public.role_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_role_requests_updated_at();

-- 10. SOFT DELETE para marketplace_listings (cambiar a 'deleted')
ALTER TABLE public.marketplace_listings 
DROP CONSTRAINT IF EXISTS marketplace_listings_status_check;

ALTER TABLE public.marketplace_listings 
ADD CONSTRAINT marketplace_listings_status_check 
CHECK (status IN ('active', 'sold', 'inactive', 'deleted'));