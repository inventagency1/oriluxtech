
-- Agregar 'marketplace_order' a los tipos permitidos en payment_type
ALTER TABLE pending_payments 
DROP CONSTRAINT IF EXISTS pending_payments_payment_type_check;

ALTER TABLE pending_payments 
ADD CONSTRAINT pending_payments_payment_type_check 
CHECK (payment_type = ANY (ARRAY[
  'certificate_package'::text, 
  'certificate_individual'::text, 
  'subscription'::text,
  'marketplace_order'::text
]));
