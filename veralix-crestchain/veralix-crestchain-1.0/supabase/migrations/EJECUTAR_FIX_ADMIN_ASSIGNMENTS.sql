-- ============================================
-- FIX: ADMIN CERTIFICATE ASSIGNMENTS
-- Ejecutar en Supabase SQL Editor
-- Fecha: 2025-11-29
-- ============================================

-- PASO 1: Eliminar función anterior si existe
DROP FUNCTION IF EXISTS admin_assign_certificates(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, DECIMAL, TEXT, TEXT, TEXT);

-- PASO 2: Crear función corregida (sin payment_method y payment_reference)
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
  v_package_type TEXT;
BEGIN
  v_admin_id := auth.uid();
  
  -- Verificar admin
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_admin_id AND role = 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Solo los administradores pueden asignar certificados');
  END IF;
  
  -- Obtener email del admin
  SELECT email INTO v_admin_email FROM auth.users WHERE id = v_admin_id;
  
  -- Buscar usuario destino
  SELECT id, email INTO v_target_user FROM auth.users WHERE LOWER(email) = LOWER(p_target_email);
  
  IF v_target_user.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no encontrado: ' || p_target_email);
  END IF;
  
  -- Validar cantidad
  IF p_certificates_count <= 0 OR p_certificates_count > 10000 THEN
    RETURN json_build_object('success', false, 'error', 'Cantidad debe estar entre 1 y 10,000');
  END IF;
  
  -- Determinar package_type válido
  v_package_type := CASE 
    WHEN p_certificates_count <= 10 THEN 'pack_10'
    WHEN p_certificates_count <= 50 THEN 'pack_50'
    WHEN p_certificates_count <= 100 THEN 'pack_100'
    ELSE 'unlimited'
  END;
  
  -- Crear compra de certificados (SIN payment_method y payment_reference)
  INSERT INTO certificate_purchases (
    user_id, 
    package_type, 
    package_name, 
    certificates_purchased, 
    certificates_used,
    amount_paid, 
    currency, 
    payment_status, 
    payment_provider,
    purchased_at, 
    metadata
  ) VALUES (
    v_target_user.id,
    v_package_type,
    p_package_name,
    p_certificates_count,
    0,
    p_amount_paid,
    p_currency,
    'completed',
    'admin_assignment',
    NOW(),
    jsonb_build_object(
      'assigned_by_admin', v_admin_id,
      'admin_email', v_admin_email,
      'assignment_type', p_payment_type,
      'payment_method', p_payment_method,
      'payment_reference', p_payment_reference,
      'notes', p_notes,
      'invoice_number', p_invoice_number,
      'is_admin_assignment', true
    )
  )
  RETURNING id INTO v_purchase_id;
  
  -- Registrar asignación
  INSERT INTO admin_certificate_assignments (
    target_user_id, target_user_email, assigned_by_admin_id, assigned_by_admin_email,
    package_name, certificates_count, payment_type, payment_reference, payment_method,
    amount_paid, currency, notes, invoice_number, is_income
  ) VALUES (
    v_target_user.id, v_target_user.email, v_admin_id, v_admin_email,
    p_package_name, p_certificates_count, p_payment_type, p_payment_reference,
    p_payment_method, p_amount_paid, p_currency, p_notes, p_invoice_number,
    p_amount_paid > 0
  )
  RETURNING id INTO v_assignment_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Certificados asignados exitosamente',
    'data', json_build_object(
      'purchase_id', v_purchase_id,
      'assignment_id', v_assignment_id,
      'target_email', v_target_user.email,
      'certificates_count', p_certificates_count
    )
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', 'Error: ' || SQLERRM);
END;
$$;

-- ============================================
-- ¡LISTO! Ejecuta este script en Supabase
-- ============================================
