-- ============================================
-- ADMIN CERTIFICATE ASSIGNMENTS & INCOME TRACKING
-- Fecha: 2025-11-29
-- ============================================
-- Sistema para que admins asignen paquetes de certificados
-- con registro de ingresos por pagos externos

-- TABLA: Registro de asignaciones de certificados por admin
CREATE TABLE IF NOT EXISTS public.admin_certificate_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuario que recibe los certificados
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_email TEXT NOT NULL,
  
  -- Admin que hace la asignación
  assigned_by_admin_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_by_admin_email TEXT NOT NULL,
  
  -- Detalles del paquete
  package_name TEXT NOT NULL DEFAULT 'Paquete de Prueba',
  certificates_count INTEGER NOT NULL CHECK (certificates_count > 0),
  
  -- Información de pago/facturación
  payment_type TEXT NOT NULL DEFAULT 'external' CHECK (payment_type IN ('external', 'free_trial', 'promotional', 'compensation')),
  payment_reference TEXT, -- Referencia de pago externo (transferencia, efectivo, etc)
  payment_method TEXT, -- 'transfer', 'cash', 'check', 'other'
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'COP',
  
  -- Notas y metadata
  notes TEXT,
  invoice_number TEXT, -- Número de factura si aplica
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Para reportes
  is_income BOOLEAN DEFAULT TRUE -- Si debe contarse como ingreso
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_assignments_target ON admin_certificate_assignments(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_admin ON admin_certificate_assignments(assigned_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_created ON admin_certificate_assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_payment_type ON admin_certificate_assignments(payment_type);

-- RLS
ALTER TABLE admin_certificate_assignments ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver asignaciones
CREATE POLICY "Admins can view all assignments"
  ON admin_certificate_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admins pueden crear asignaciones
CREATE POLICY "Admins can create assignments"
  ON admin_certificate_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCIÓN: Asignar certificados a usuario
-- ============================================
CREATE OR REPLACE FUNCTION admin_assign_certificates(
  p_target_email TEXT,
  p_certificates_count INTEGER,
  p_package_name TEXT DEFAULT 'Paquete de Prueba',
  p_payment_type TEXT DEFAULT 'external',
  p_payment_reference TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_amount_paid DECIMAL DEFAULT 0,
  p_currency TEXT DEFAULT 'COP',
  p_notes TEXT DEFAULT NULL,
  p_invoice_number TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_admin_email TEXT;
  v_target_user RECORD;
  v_purchase_id UUID;
  v_assignment_id UUID;
BEGIN
  -- Verificar que el usuario actual es admin
  v_admin_id := auth.uid();
  
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Solo los administradores pueden asignar certificados'
    );
  END IF;
  
  -- Obtener email del admin
  SELECT email INTO v_admin_email
  FROM auth.users WHERE id = v_admin_id;
  
  -- Buscar usuario destino por email
  SELECT id, email INTO v_target_user
  FROM auth.users 
  WHERE LOWER(email) = LOWER(p_target_email);
  
  IF v_target_user.id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Usuario no encontrado con el email: ' || p_target_email
    );
  END IF;
  
  -- Validar cantidad de certificados
  IF p_certificates_count <= 0 OR p_certificates_count > 10000 THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'La cantidad de certificados debe estar entre 1 y 10,000'
    );
  END IF;
  
  -- Crear el registro de compra de certificados
  INSERT INTO certificate_purchases (
    user_id,
    package_type,
    package_name,
    certificates_purchased,
    certificates_used,
    certificates_remaining,
    amount_paid,
    currency,
    payment_status,
    payment_method,
    payment_reference,
    purchased_at,
    metadata
  ) VALUES (
    v_target_user.id,
    'pack_' || p_certificates_count::TEXT,
    p_package_name,
    p_certificates_count,
    0,
    p_certificates_count,
    p_amount_paid,
    p_currency,
    'completed',
    COALESCE(p_payment_method, 'admin_assignment'),
    p_payment_reference,
    NOW(),
    jsonb_build_object(
      'assigned_by_admin', v_admin_id,
      'admin_email', v_admin_email,
      'assignment_type', p_payment_type,
      'notes', p_notes,
      'invoice_number', p_invoice_number,
      'is_admin_assignment', true
    )
  )
  RETURNING id INTO v_purchase_id;
  
  -- Registrar la asignación para auditoría e ingresos
  INSERT INTO admin_certificate_assignments (
    target_user_id,
    target_user_email,
    assigned_by_admin_id,
    assigned_by_admin_email,
    package_name,
    certificates_count,
    payment_type,
    payment_reference,
    payment_method,
    amount_paid,
    currency,
    notes,
    invoice_number,
    is_income
  ) VALUES (
    v_target_user.id,
    v_target_user.email,
    v_admin_id,
    v_admin_email,
    p_package_name,
    p_certificates_count,
    p_payment_type,
    p_payment_reference,
    p_payment_method,
    p_amount_paid,
    p_currency,
    p_notes,
    p_invoice_number,
    p_amount_paid > 0 -- Es ingreso solo si hay monto pagado
  )
  RETURNING id INTO v_assignment_id;
  
  -- Log de auditoría
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    v_admin_id,
    'admin_certificate_assignment',
    'certificate_purchase',
    v_purchase_id::TEXT,
    jsonb_build_object(
      'target_user_email', v_target_user.email,
      'certificates_count', p_certificates_count,
      'payment_type', p_payment_type,
      'amount_paid', p_amount_paid,
      'assignment_id', v_assignment_id
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Certificados asignados exitosamente',
    'data', json_build_object(
      'purchase_id', v_purchase_id,
      'assignment_id', v_assignment_id,
      'target_email', v_target_user.email,
      'certificates_count', p_certificates_count,
      'amount_paid', p_amount_paid
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Error al asignar certificados: ' || SQLERRM
    );
END;
$$;

-- ============================================
-- FUNCIÓN: Obtener resumen de ingresos por asignaciones
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_income_summary(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Acceso denegado');
  END IF;
  
  SELECT json_build_object(
    'success', true,
    'summary', json_build_object(
      'total_income', COALESCE(SUM(amount_paid) FILTER (WHERE is_income = true), 0),
      'total_assignments', COUNT(*),
      'total_certificates_assigned', COALESCE(SUM(certificates_count), 0),
      'by_payment_type', (
        SELECT json_object_agg(payment_type, cnt)
        FROM (
          SELECT payment_type, COUNT(*) as cnt
          FROM admin_certificate_assignments
          WHERE (p_start_date IS NULL OR created_at >= p_start_date)
            AND (p_end_date IS NULL OR created_at <= p_end_date)
          GROUP BY payment_type
        ) sub
      ),
      'by_month', (
        SELECT json_agg(row_to_json(monthly))
        FROM (
          SELECT 
            TO_CHAR(created_at, 'YYYY-MM') as month,
            SUM(amount_paid) as income,
            COUNT(*) as assignments,
            SUM(certificates_count) as certificates
          FROM admin_certificate_assignments
          WHERE (p_start_date IS NULL OR created_at >= p_start_date)
            AND (p_end_date IS NULL OR created_at <= p_end_date)
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY month DESC
          LIMIT 12
        ) monthly
      )
    )
  ) INTO v_result
  FROM admin_certificate_assignments
  WHERE (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
  
  RETURN v_result;
END;
$$;

-- ============================================
-- FUNCIÓN: Listar asignaciones recientes
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_assignments(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Acceso denegado');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'assignments', (
      SELECT json_agg(row_to_json(a))
      FROM (
        SELECT 
          id,
          target_user_email,
          assigned_by_admin_email,
          package_name,
          certificates_count,
          payment_type,
          payment_reference,
          payment_method,
          amount_paid,
          currency,
          notes,
          invoice_number,
          is_income,
          created_at
        FROM admin_certificate_assignments
        ORDER BY created_at DESC
        LIMIT p_limit OFFSET p_offset
      ) a
    ),
    'total', (SELECT COUNT(*) FROM admin_certificate_assignments)
  );
END;
$$;

-- Comentarios
COMMENT ON TABLE admin_certificate_assignments IS 'Registro de asignaciones de certificados hechas por administradores, incluyendo pagos externos';
COMMENT ON FUNCTION admin_assign_certificates IS 'Permite a admins asignar paquetes de certificados a usuarios con registro de pago';
COMMENT ON FUNCTION get_admin_income_summary IS 'Obtiene resumen de ingresos por asignaciones de certificados';
