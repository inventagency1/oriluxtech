-- ============================================
-- FASE 1: Corregir vista marketplace_public_listings
-- ============================================

-- Eliminar vista existente
DROP VIEW IF EXISTS marketplace_public_listings;

-- Crear vista mejorada con COALESCE para seller_name
CREATE VIEW marketplace_public_listings AS
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
  -- Usar COALESCE para tener fallback de business_name a full_name
  COALESCE(p.business_name, p.full_name, 'Vendedor') AS seller_name,
  p.city AS seller_city,
  p.country AS seller_country
FROM marketplace_listings ml
LEFT JOIN profiles p ON p.user_id = ml.seller_id
WHERE ml.status = 'active';

-- ============================================
-- FASE 2: Agregar RLS Policy para jewelry_items
-- ============================================

-- Permitir que usuarios anónimos y autenticados vean jewelry_items en listings activos
CREATE POLICY "Anyone can view jewelry in active marketplace listings"
ON jewelry_items FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings
    WHERE marketplace_listings.jewelry_item_id = jewelry_items.id
    AND marketplace_listings.status = 'active'
  )
);

-- ============================================
-- FASE 4: Migración de Datos
-- ============================================

-- 4.1: Verificar y desactivar listings sin jewelry_item válido
UPDATE marketplace_listings
SET status = 'inactive'
WHERE status = 'active'
AND jewelry_item_id NOT IN (SELECT id FROM jewelry_items);

-- 4.2: Completar perfiles de joyeros con datos mínimos
UPDATE profiles
SET 
  business_name = COALESCE(business_name, full_name, 'Joyería'),
  city = COALESCE(city, 'No especificado'),
  country = COALESCE(country, 'Colombia')
WHERE user_id IN (
  SELECT DISTINCT seller_id FROM marketplace_listings WHERE status = 'active'
)
AND (business_name IS NULL OR city IS NULL OR country IS NULL);