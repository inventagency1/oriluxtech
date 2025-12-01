-- ============================================================================
-- VERALIX SECURITY HARDENING - COMPLETE IMPLEMENTATION
-- ============================================================================

-- FASE 1.1: ASEGURAR NFT CERTIFICATES TABLE
-- ============================================================================

-- Eliminar política pública insegura
DROP POLICY IF EXISTS "Public certificate verification (limited data only)" ON nft_certificates;

-- Crear vista pública con solo datos seguros para verificación
CREATE OR REPLACE VIEW public.certificate_verification AS
SELECT 
  certificate_id,
  jewelry_item_id,
  verification_url,
  qr_code_url,
  is_verified,
  created_at,
  verification_date
FROM nft_certificates
WHERE certificate_id IS NOT NULL;

-- Permitir acceso público solo a la vista
GRANT SELECT ON certificate_verification TO anon, authenticated;

COMMENT ON VIEW certificate_verification IS 'Public view for certificate verification - exposes only safe, non-sensitive data';

-- ============================================================================
-- FASE 1.2: ASEGURAR CERTIFICATE PRICING TABLE
-- ============================================================================

-- Eliminar política pública que expone toda la estrategia de precios
DROP POLICY IF EXISTS "Users can view active pricing" ON certificate_pricing;

-- Crear política para usuarios autenticados solamente
CREATE POLICY "Authenticated users can view their relevant pricing"
ON certificate_pricing
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (
    -- Admins/Joyeros ven todo
    has_role(auth.uid(), 'joyero'::app_role)
    OR
    -- Usuarios ven solo su categoría
    client_category = (
      SELECT category FROM client_categories 
      WHERE user_id = auth.uid()
    )
    OR
    -- Si no tiene categoría, ve solo "regular"
    (
      NOT EXISTS (SELECT 1 FROM client_categories WHERE user_id = auth.uid())
      AND client_category = 'regular'::client_category
    )
  )
);

-- Crear función pública para obtener precio mínimo SIN exponer estructura completa
CREATE OR REPLACE FUNCTION public.get_public_certificate_price(
  p_jewelry_type jewelry_type_pricing
)
RETURNS TABLE(currency text, min_price numeric) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.currency,
    MIN(cp.base_price) as min_price
  FROM certificate_pricing cp
  WHERE cp.jewelry_type = p_jewelry_type
    AND cp.is_active = true
    AND cp.client_category = 'regular'::client_category
  GROUP BY cp.currency;
END;
$$;

COMMENT ON FUNCTION get_public_certificate_price IS 'Public function to get minimum price without exposing pricing strategy';

-- ============================================================================
-- FASE 1.3: ASEGURAR ORDER ITEMS TABLE
-- ============================================================================

-- Eliminar política insegura con USING (true)
DROP POLICY IF EXISTS "System can manage order items" ON order_items;

-- Crear políticas específicas y granulares

-- INSERT: Solo el comprador de la orden puede crear items
CREATE POLICY "Buyers can create order items"
ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id
    AND o.buyer_id = auth.uid()
  )
);

-- UPDATE: Solo participantes de la orden (buyer o seller)
CREATE POLICY "Order participants can update items"
ON order_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id
    AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
  )
);

-- DELETE: Solo participantes de la orden
CREATE POLICY "Order participants can delete items"
ON order_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id
    AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
  )
);

-- ============================================================================
-- FASE 1.4: MEJORAR MARKETPLACE LISTINGS PRIVACY
-- ============================================================================

-- Crear vista pública anonimizada (sin seller_id expuesto)
CREATE OR REPLACE VIEW public.marketplace_public_listings AS
SELECT 
  ml.id,
  ml.jewelry_item_id,
  -- NO incluir seller_id para prevenir tracking
  ml.price,
  ml.currency,
  ml.description,
  ml.status,
  ml.featured,
  ml.views,
  ml.likes,
  ml.average_rating,
  ml.review_count,
  ml.created_at,
  ml.updated_at,
  -- Agregar info pública del seller (sin UUID)
  p.business_name as seller_name,
  p.city as seller_city,
  p.country as seller_country
FROM marketplace_listings ml
LEFT JOIN profiles p ON p.user_id = ml.seller_id
WHERE ml.status = 'active';

-- Grant acceso a usuarios anónimos
GRANT SELECT ON marketplace_public_listings TO anon, authenticated;

COMMENT ON VIEW marketplace_public_listings IS 'Public marketplace view - prevents seller tracking by omitting seller_id';

-- ============================================================================
-- FASE 2.2: MOVER EXTENSIONES DE PUBLIC SCHEMA
-- ============================================================================

-- Crear schema para extensiones
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover extensión pg_trgm al schema correcto
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Actualizar referencias en funciones de búsqueda
-- La función search_marketplace_listings usa to_tsvector, no necesita cambios
-- pero documentamos el cambio para futuras referencias

COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions - follows Supabase best practices';

-- ============================================================================
-- FASE 3: TESTING SQL SCRIPTS
-- ============================================================================

-- Crear función de testing para validar seguridad
CREATE OR REPLACE FUNCTION public.test_security_policies()
RETURNS TABLE(
  test_name text,
  passed boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Test 1: Vista certificate_verification NO expone datos sensibles
  RETURN QUERY
  SELECT 
    'certificate_verification_no_sensitive_data'::text,
    NOT EXISTS(
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'certificate_verification'
      AND column_name IN ('contract_address', 'transaction_hash', 'token_id', 'metadata_uri', 'user_id', 'owner_id')
    ),
    'Certificate verification view should not expose sensitive blockchain data'::text;

  -- Test 2: Vista marketplace_public_listings NO expone seller_id
  RETURN QUERY
  SELECT 
    'marketplace_no_seller_tracking'::text,
    NOT EXISTS(
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'marketplace_public_listings'
      AND column_name = 'seller_id'
    ),
    'Marketplace public view should not expose seller_id for privacy'::text;

  -- Test 3: Extensión pg_trgm movida fuera de public
  RETURN QUERY
  SELECT 
    'extension_not_in_public_schema'::text,
    NOT EXISTS(
      SELECT 1 FROM pg_extension e
      JOIN pg_namespace n ON e.extnamespace = n.oid
      WHERE e.extname = 'pg_trgm' AND n.nspname = 'public'
    ),
    'pg_trgm extension should be in extensions schema'::text;

  -- Test 4: Certificate pricing NO accesible para anon
  RETURN QUERY
  SELECT 
    'pricing_requires_auth'::text,
    NOT EXISTS(
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename = 'certificate_pricing'
      AND roles @> ARRAY['anon']
    ),
    'Certificate pricing should require authentication'::text;

END;
$$;

COMMENT ON FUNCTION test_security_policies IS 'Automated security testing - validates all critical security fixes';

-- ============================================================================
-- AUDIT LOG ENTRY
-- ============================================================================

-- Registrar todos los cambios de seguridad
DO $$
BEGIN
  -- Solo si hay un usuario autenticado (en contexto de testing manual)
  IF auth.uid() IS NOT NULL THEN
    PERFORM log_audit_action(
      'security_hardening_applied',
      'system',
      NULL,
      jsonb_build_object(
        'changes', ARRAY[
          'NFT certificates: Created public verification view',
          'Certificate pricing: Restricted to authenticated users',
          'Order items: Implemented granular RLS policies',
          'Marketplace: Created privacy-preserving public view',
          'Extensions: Moved pg_trgm to extensions schema'
        ],
        'security_level', 'critical',
        'timestamp', now()
      )
    );
  END IF;
END $$;