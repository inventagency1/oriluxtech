-- ============================================================================
-- SECURITY FIX: Corregir vistas con SECURITY INVOKER
-- ============================================================================
-- Las vistas por defecto en Postgres son SECURITY DEFINER
-- Necesitamos recrearlas como SECURITY INVOKER para usar permisos del usuario

-- Drop vistas anteriores
DROP VIEW IF EXISTS public.certificate_verification CASCADE;
DROP VIEW IF EXISTS public.marketplace_public_listings CASCADE;

-- ============================================================================
-- RECREAR VISTA DE VERIFICACIÓN DE CERTIFICADOS (SECURITY INVOKER)
-- ============================================================================

CREATE VIEW public.certificate_verification
WITH (security_invoker = true) AS
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

-- Grant acceso
GRANT SELECT ON certificate_verification TO anon, authenticated;

COMMENT ON VIEW certificate_verification IS 
'Public view for certificate verification (SECURITY INVOKER) - exposes only safe, non-sensitive data';

-- ============================================================================
-- RECREAR VISTA DE MARKETPLACE (SECURITY INVOKER)
-- ============================================================================

CREATE VIEW public.marketplace_public_listings
WITH (security_invoker = true) AS
SELECT 
  ml.id,
  ml.jewelry_item_id,
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
  p.business_name as seller_name,
  p.city as seller_city,
  p.country as seller_country
FROM marketplace_listings ml
LEFT JOIN profiles p ON p.user_id = ml.seller_id
WHERE ml.status = 'active';

-- Grant acceso
GRANT SELECT ON marketplace_public_listings TO anon, authenticated;

COMMENT ON VIEW marketplace_public_listings IS 
'Public marketplace view (SECURITY INVOKER) - prevents seller tracking by omitting seller_id';