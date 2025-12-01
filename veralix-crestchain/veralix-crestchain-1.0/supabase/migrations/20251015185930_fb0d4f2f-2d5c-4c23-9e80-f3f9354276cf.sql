-- Crear tabla dedicada para compras de paquetes de certificados
CREATE TABLE IF NOT EXISTS public.certificate_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Package information
  package_type TEXT NOT NULL CHECK (package_type IN ('pack_10', 'pack_50', 'pack_100')),
  package_name TEXT NOT NULL,
  
  -- Certificate tracking
  certificates_purchased INTEGER NOT NULL CHECK (certificates_purchased > 0),
  certificates_used INTEGER NOT NULL DEFAULT 0 CHECK (certificates_used >= 0),
  certificates_remaining INTEGER GENERATED ALWAYS AS (certificates_purchased - certificates_used) STORED,
  
  -- Pricing
  amount_paid NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  
  -- Payment details
  payment_provider TEXT DEFAULT 'bold',
  transaction_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Timestamps
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT certificates_remaining_check CHECK (certificates_used <= certificates_purchased)
);

-- Indexes para performance
CREATE INDEX idx_certificate_purchases_user ON certificate_purchases(user_id);
CREATE INDEX idx_certificate_purchases_status ON certificate_purchases(payment_status);
CREATE INDEX idx_certificate_purchases_created ON certificate_purchases(created_at DESC);

-- RLS Policies
ALTER TABLE certificate_purchases ENABLE ROW LEVEL SECURITY;

-- Users can only see their own purchases
CREATE POLICY "Users can view own certificate purchases"
  ON certificate_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert certificate purchases"
  ON certificate_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- System can update purchases
CREATE POLICY "System can update certificate purchases"
  ON certificate_purchases FOR UPDATE
  USING (true);

-- Admins can view all purchases
CREATE POLICY "Admins can view all certificate purchases"
  ON certificate_purchases FOR SELECT
  USING (has_role(auth.uid(), 'joyero'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_certificate_purchases_updated_at
  BEFORE UPDATE ON certificate_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function para decrementar certificados al usarlos
CREATE OR REPLACE FUNCTION use_certificate_from_purchase()
RETURNS TRIGGER AS $$
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
  
  -- Incrementar certificados usados
  IF purchase_id IS NOT NULL THEN
    UPDATE certificate_purchases
    SET certificates_used = certificates_used + 1
    WHERE id = purchase_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en nft_certificates para decrementar automáticamente
DROP TRIGGER IF EXISTS decrement_certificate_on_creation ON nft_certificates;
CREATE TRIGGER decrement_certificate_on_creation
  AFTER INSERT ON nft_certificates
  FOR EACH ROW
  EXECUTE FUNCTION use_certificate_from_purchase();

-- Migrar datos existentes de subscriptions a certificate_purchases
-- Los valores correctos del enum son: 'pack_10', 'pack_50', 'pack_100' según los types
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
  purchased_at,
  metadata
)
SELECT 
  user_id,
  CASE plan::text
    WHEN 'pack_10' THEN 'pack_10'
    WHEN 'pack_50' THEN 'pack_50'
    WHEN 'pack_100' THEN 'pack_100'
    ELSE 'pack_10'
  END as package_type,
  CONCAT('Pack de ', certificates_limit, ' Certificados') as package_name,
  certificates_limit as certificates_purchased,
  COALESCE(certificates_used, 0) as certificates_used,
  price_per_month as amount_paid,
  'COP' as currency,
  'bold' as payment_provider,
  'completed' as payment_status,
  created_at as purchased_at,
  jsonb_build_object(
    'migrated_from_subscription', true,
    'original_plan', plan::text,
    'original_subscription_id', id,
    'original_status', status::text
  ) as metadata
FROM subscriptions
WHERE status IN ('active', 'canceled', 'trialing')
ON CONFLICT DO NOTHING;

-- Log de migración
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
SELECT 
  user_id,
  'data_migration',
  'certificate_purchases',
  id::text,
  jsonb_build_object(
    'certificates_migrated', certificates_limit - COALESCE(certificates_used, 0),
    'source', 'subscriptions_table',
    'plan', plan::text
  )
FROM subscriptions
WHERE status IN ('active', 'canceled', 'trialing');