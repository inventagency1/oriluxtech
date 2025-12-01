-- ============================================================
-- PARTE 5: OPTIMIZACIÓN DE QUERIES - ELIMINAR N+1 QUERIES
-- ============================================================
-- Esta migración crea una vista optimizada que pre-hace todos los
-- JOINs necesarios, eliminando el problema de N+1 queries
-- Reduce de 21+ queries a 1 sola query
-- ============================================================

-- 1. Crear vista optimizada marketplace_listings_complete
CREATE OR REPLACE VIEW marketplace_listings_complete AS
SELECT 
  -- Datos del listing
  ml.id,
  ml.jewelry_item_id,
  ml.seller_id,
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
  
  -- Datos del jewelry item
  ji.name as jewelry_name,
  ji.type as jewelry_type,
  ji.materials as jewelry_materials,
  ji.main_image_url as jewelry_main_image_url,
  ji.image_urls as jewelry_image_urls,
  ji.description as jewelry_description,
  ji.weight as jewelry_weight,
  ji.dimensions as jewelry_dimensions,
  ji.origin as jewelry_origin,
  ji.craftsman as jewelry_craftsman,
  ji.images_count as jewelry_images_count,
  ji.user_id as jewelry_user_id,
  
  -- Datos del seller (profile)
  p.full_name as seller_full_name,
  p.business_name as seller_business_name,
  p.avatar_url as seller_avatar_url,
  p.city as seller_city,
  p.country as seller_country,
  
  -- Datos del certificado (si existe)
  nc.certificate_id as certificate_id,
  nc.is_verified as certificate_is_verified
  
FROM marketplace_listings ml
INNER JOIN jewelry_items ji ON ml.jewelry_item_id = ji.id
INNER JOIN profiles p ON ml.seller_id = p.user_id
LEFT JOIN nft_certificates nc ON ml.jewelry_item_id = nc.jewelry_item_id
WHERE ml.status = 'active';

-- Otorgar permisos de lectura
GRANT SELECT ON marketplace_listings_complete TO authenticated;
GRANT SELECT ON marketplace_listings_complete TO anon;

-- 2. Crear índices compuestos para optimizar búsquedas frecuentes
-- Índice para búsquedas por jewelry_item + status
CREATE INDEX IF NOT EXISTS idx_marketplace_jewelry_status 
ON marketplace_listings(jewelry_item_id, status) 
WHERE status = 'active';

-- Índice para búsquedas por seller + status + orden temporal
CREATE INDEX IF NOT EXISTS idx_marketplace_seller_status_created 
ON marketplace_listings(seller_id, status, created_at DESC) 
WHERE status = 'active';

-- Índice para certificados por jewelry_item
CREATE INDEX IF NOT EXISTS idx_certificates_jewelry_verified 
ON nft_certificates(jewelry_item_id, is_verified);

-- Índice para reviews por listing
CREATE INDEX IF NOT EXISTS idx_reviews_listing_rating 
ON marketplace_reviews(listing_id, rating)
WHERE is_visible = true;

-- Índice para perfiles por user_id (optimiza join con sellers)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON profiles(user_id);

-- 3. Comentarios para documentación
COMMENT ON VIEW marketplace_listings_complete IS 
'Vista optimizada que elimina N+1 queries combinando marketplace_listings, jewelry_items, profiles y nft_certificates en una sola query. Reduce de 21+ queries a 1 sola query para 10 items.';