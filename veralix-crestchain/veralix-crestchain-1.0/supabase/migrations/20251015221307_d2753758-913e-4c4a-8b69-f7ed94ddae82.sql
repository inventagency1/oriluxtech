-- FASE 1: Eliminar trigger existente y crear función actualizada
DROP TRIGGER IF EXISTS decrement_certificate_on_creation ON nft_certificates;

CREATE OR REPLACE FUNCTION public.use_certificate_from_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  purchase_id UUID;
BEGIN
  -- Buscar la compra más antigua con certificados disponibles
  SELECT id INTO purchase_id
  FROM certificate_purchases
  WHERE user_id = NEW.user_id
    AND certificates_remaining > 0
    AND payment_status = 'completed'
  ORDER BY purchased_at ASC
  LIMIT 1;
  
  -- Si se encontró un paquete con certificados disponibles
  IF purchase_id IS NOT NULL THEN
    -- Incrementar certificados usados
    UPDATE certificate_purchases
    SET certificates_used = certificates_used + 1
    WHERE id = purchase_id;
    
    -- Log de auditoría
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      NEW.user_id,
      'certificate_used',
      'certificate_purchase',
      purchase_id::text,
      jsonb_build_object(
        'certificate_id', NEW.certificate_id,
        'jewelry_item_id', NEW.jewelry_item_id,
        'timestamp', now()
      )
    );
    
    RETURN NEW;
  ELSE
    -- No hay certificados disponibles, rechazar la operación
    RAISE EXCEPTION 'No hay certificados disponibles. Por favor compra un paquete de certificados.';
  END IF;
END;
$$;

-- FASE 2: Crear trigger automático
CREATE TRIGGER decrement_certificate_on_creation
  AFTER INSERT ON nft_certificates
  FOR EACH ROW
  EXECUTE FUNCTION use_certificate_from_purchase();

-- FASE 3: Otorgar pack de 50 certificados al usuario de prueba (solo si no existe ya)
INSERT INTO certificate_purchases (
  user_id,
  package_type,
  package_name,
  certificates_purchased,
  certificates_used,
  amount_paid,
  currency,
  payment_status,
  purchased_at,
  transaction_id,
  payment_provider,
  metadata
)
SELECT
  'bee4051f-7e73-4c5b-89e6-5287f22710c9', -- ciriacocraig7@gmail.com
  'pack_50',
  'Pack de 50 Certificados (Prueba)',
  50,
  0,
  0, -- Gratis para pruebas
  'COP',
  'completed',
  now(),
  'TEST-GRANT-' || gen_random_uuid()::text,
  'manual_grant',
  jsonb_build_object(
    'granted_by', 'admin',
    'reason', 'Pruebas de descuento automático',
    'is_test_package', true,
    'granted_at', now()
  )
WHERE NOT EXISTS (
  SELECT 1 FROM certificate_purchases
  WHERE user_id = 'bee4051f-7e73-4c5b-89e6-5287f22710c9'
    AND package_type = 'pack_50'
    AND metadata->>'is_test_package' = 'true'
);