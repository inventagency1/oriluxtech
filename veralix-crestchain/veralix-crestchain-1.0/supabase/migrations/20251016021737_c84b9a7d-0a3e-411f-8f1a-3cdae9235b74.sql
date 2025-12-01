-- ============================================
-- MODIFICAR CONSTRAINT DE package_type
-- ============================================

ALTER TABLE certificate_purchases 
DROP CONSTRAINT IF EXISTS certificate_purchases_package_type_check;

ALTER TABLE certificate_purchases 
ADD CONSTRAINT certificate_purchases_package_type_check 
CHECK (package_type = ANY (ARRAY['pack_10'::text, 'pack_50'::text, 'pack_100'::text, 'unlimited'::text]));

-- ============================================
-- FASE 1: Actualizar Roles a Admin
-- ============================================

-- 1.1: Actualizar rol de Edward Torres a admin
UPDATE user_roles
SET role = 'admin', created_at = now()
WHERE user_id = '0693ffc9-acc8-43f4-8006-df7b40518346';

-- 1.2: Actualizar rol de Jonathan Torres a admin  
UPDATE user_roles
SET role = 'admin', created_at = now()
WHERE user_id = '28d388ac-af40-4141-aff3-6fad9829ecf8';

-- 1.3: Registrar cambios en audit_logs
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
VALUES 
  (
    '0693ffc9-acc8-43f4-8006-df7b40518346',
    'role_change',
    'user',
    '0693ffc9-acc8-43f4-8006-df7b40518346',
    jsonb_build_object(
      'old_role', 'joyero',
      'new_role', 'admin',
      'changed_by', 'system_migration',
      'reason', 'Manual admin assignment with unlimited certificates'
    )
  ),
  (
    '28d388ac-af40-4141-aff3-6fad9829ecf8',
    'role_change',
    'user',
    '28d388ac-af40-4141-aff3-6fad9829ecf8',
    jsonb_build_object(
      'old_role', 'cliente',
      'new_role', 'admin',
      'changed_by', 'system_migration',
      'reason', 'Manual admin assignment with unlimited certificates'
    )
  );

-- ============================================
-- FASE 2: Crear Paquetes Ilimitados de Certificados
-- ============================================

-- 2.1: Crear paquete ilimitado para Edward Torres
INSERT INTO certificate_purchases (
  user_id,
  package_type,
  package_name,
  certificates_purchased,
  certificates_used,
  amount_paid,
  currency,
  payment_provider,
  payment_status,
  transaction_id,
  metadata
) VALUES (
  '0693ffc9-acc8-43f4-8006-df7b40518346',
  'unlimited',
  'Paquete Admin Ilimitado',
  999999,
  1,
  0,
  'COP',
  'internal',
  'completed',
  'ADMIN_GRANT_' || gen_random_uuid()::text,
  jsonb_build_object(
    'grant_type', 'admin_unlimited',
    'granted_by', 'system',
    'granted_at', now(),
    'notes', 'Paquete ilimitado para administrador del sistema'
  )
);

-- 2.2: Crear paquete ilimitado para Jonathan Torres
INSERT INTO certificate_purchases (
  user_id,
  package_type,
  package_name,
  certificates_purchased,
  certificates_used,
  amount_paid,
  currency,
  payment_provider,
  payment_status,
  transaction_id,
  metadata
) VALUES (
  '28d388ac-af40-4141-aff3-6fad9829ecf8',
  'unlimited',
  'Paquete Admin Ilimitado',
  999999,
  0,
  0,
  'COP',
  'internal',
  'completed',
  'ADMIN_GRANT_' || gen_random_uuid()::text,
  jsonb_build_object(
    'grant_type', 'admin_unlimited',
    'granted_by', 'system',
    'granted_at', now(),
    'notes', 'Paquete ilimitado para administrador del sistema'
  )
);

-- 2.3: Log de auditoría para paquetes ilimitados
INSERT INTO audit_logs (user_id, action, resource_type, details)
VALUES 
  (
    '0693ffc9-acc8-43f4-8006-df7b40518346',
    'certificate_package_granted',
    'certificate_purchase',
    jsonb_build_object(
      'package_type', 'unlimited',
      'certificates', 999999,
      'reason', 'Admin unlimited package grant'
    )
  ),
  (
    '28d388ac-af40-4141-aff3-6fad9829ecf8',
    'certificate_package_granted',
    'certificate_purchase',
    jsonb_build_object(
      'package_type', 'unlimited',
      'certificates', 999999,
      'reason', 'Admin unlimited package grant'
    )
  );

-- ============================================
-- FASE 3: Crear Notificaciones para los Usuarios
-- ============================================

-- 3.1: Notificación para Edward Torres
INSERT INTO notifications (user_id, type, title, message, action_url)
VALUES (
  '0693ffc9-acc8-43f4-8006-df7b40518346',
  'system',
  '🛡️ Ahora eres Administrador',
  'Tu cuenta ha sido actualizada con permisos de administrador y certificados ilimitados. Puedes generar certificados NFT sin límite.',
  '/admin/settings'
);

-- 3.2: Notificación para Jonathan Torres
INSERT INTO notifications (user_id, type, title, message, action_url)
VALUES (
  '28d388ac-af40-4141-aff3-6fad9829ecf8',
  'system',
  '🛡️ Ahora eres Administrador',
  'Tu cuenta ha sido actualizada con permisos de administrador y certificados ilimitados. Puedes generar certificados NFT sin límite.',
  '/admin/settings'
);