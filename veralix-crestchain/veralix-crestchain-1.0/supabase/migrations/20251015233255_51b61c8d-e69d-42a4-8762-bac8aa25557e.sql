-- PARTE 1: Corregir rol de Carmen Emilce de admin a joyero
UPDATE user_roles
SET role = 'joyero'::app_role
WHERE user_id = 'c2da7c5e-343a-43cf-8164-51041814dc80';

-- Auditar el cambio de rol
INSERT INTO audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  'c2da7c5e-343a-43cf-8164-51041814dc80',
  'role_corrected',
  'user_roles',
  'c2da7c5e-343a-43cf-8164-51041814dc80',
  '{"old_role": "admin", "new_role": "joyero", "reason": "role_correction", "corrected_by": "system"}'::jsonb
);

-- PARTE 2: Otorgar 10,000 certificados a Sebastian Martinez (admin actual)
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
  metadata
) VALUES (
  '437ec4f6-d647-417f-8edc-35ff4bc1bf3f',
  'pack_100',
  'Paquete Administrador Ilimitado (10,000 certificados)',
  10000,
  0,
  0.00,
  'COP',
  'completed',
  'admin_grant',
  '{"granted_by": "system", "reason": "admin_unlimited_access", "granted_at": "2025-10-15T23:30:00Z"}'::jsonb
);