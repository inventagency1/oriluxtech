-- Enable full-text search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create full-text search index on marketplace listings
CREATE INDEX IF NOT EXISTS marketplace_listings_search_idx ON marketplace_listings 
USING GIN (to_tsvector('spanish', 
  coalesce(description, '')
));

-- Create index for jewelry items search
CREATE INDEX IF NOT EXISTS jewelry_items_search_idx ON jewelry_items 
USING GIN (to_tsvector('spanish', 
  coalesce(name, '') || ' ' || coalesce(description, '')
));

-- Create index for materials search
CREATE INDEX IF NOT EXISTS jewelry_items_materials_gin_idx ON jewelry_items 
USING GIN (materials);

-- Advanced search function with corrected parameter names
CREATE OR REPLACE FUNCTION search_marketplace_listings(
  search_query TEXT DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  jewelry_types TEXT[] DEFAULT NULL,
  materials TEXT[] DEFAULT NULL,
  min_rating NUMERIC DEFAULT NULL,
  filter_seller_id UUID DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance'
)
RETURNS TABLE (
  id UUID,
  jewelry_item_id UUID,
  seller_id UUID,
  price NUMERIC,
  currency TEXT,
  description TEXT,
  status TEXT,
  featured BOOLEAN,
  views INTEGER,
  likes INTEGER,
  average_rating NUMERIC,
  review_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
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
    CASE 
      WHEN search_query IS NOT NULL THEN
        ts_rank(
          to_tsvector('spanish', coalesce(ml.description, '') || ' ' || coalesce(ji.name, '')),
          plainto_tsquery('spanish', search_query)
        )
      ELSE 1.0
    END as relevance
  FROM marketplace_listings ml
  JOIN jewelry_items ji ON ml.jewelry_item_id = ji.id
  WHERE 
    ml.status = 'active'
    AND (search_query IS NULL OR 
         to_tsvector('spanish', coalesce(ml.description, '') || ' ' || coalesce(ji.name, ''))
         @@ plainto_tsquery('spanish', search_query))
    AND (min_price IS NULL OR ml.price >= min_price)
    AND (max_price IS NULL OR ml.price <= max_price)
    AND (jewelry_types IS NULL OR ji.type::text = ANY(jewelry_types))
    AND (materials IS NULL OR ji.materials && materials)
    AND (min_rating IS NULL OR ml.average_rating >= min_rating)
    AND (filter_seller_id IS NULL OR ml.seller_id = filter_seller_id)
  ORDER BY 
    CASE 
      WHEN sort_by = 'relevance' THEN relevance
      WHEN sort_by = 'price_asc' THEN ml.price::real
      WHEN sort_by = 'price_desc' THEN -ml.price::real
      WHEN sort_by = 'rating' THEN -ml.average_rating::real
      WHEN sort_by = 'newest' THEN -EXTRACT(EPOCH FROM ml.created_at)::real
      ELSE relevance
    END DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to find similar listings
CREATE OR REPLACE FUNCTION find_similar_listings(
  target_listing_id UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  jewelry_item_id UUID,
  seller_id UUID,
  price NUMERIC,
  currency TEXT,
  description TEXT,
  status TEXT,
  featured BOOLEAN,
  views INTEGER,
  likes INTEGER,
  average_rating NUMERIC,
  review_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity_score INTEGER
) AS $$
DECLARE
  target_type TEXT;
  target_materials TEXT[];
BEGIN
  -- Get target listing details
  SELECT ji.type::text, ji.materials
  INTO target_type, target_materials
  FROM marketplace_listings ml
  JOIN jewelry_items ji ON ml.jewelry_item_id = ji.id
  WHERE ml.id = target_listing_id;

  RETURN QUERY
  SELECT 
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
    (
      (CASE WHEN ji.type::text = target_type THEN 2 ELSE 0 END) +
      (SELECT COUNT(*)::INTEGER FROM unnest(ji.materials) m WHERE m = ANY(target_materials))
    ) as similarity_score
  FROM marketplace_listings ml
  JOIN jewelry_items ji ON ml.jewelry_item_id = ji.id
  WHERE ml.id != target_listing_id
    AND ml.status = 'active'
    AND (
      ji.type::text = target_type
      OR ji.materials && target_materials
    )
  ORDER BY similarity_score DESC, ml.average_rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  search_query TEXT NOT NULL,
  filters_applied JSONB DEFAULT '{}'::jsonb,
  results_count INTEGER,
  clicked_result_id UUID REFERENCES marketplace_listings(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for search analytics
CREATE INDEX IF NOT EXISTS search_analytics_query_idx ON search_analytics(search_query);
CREATE INDEX IF NOT EXISTS search_analytics_user_idx ON search_analytics(user_id);
CREATE INDEX IF NOT EXISTS search_analytics_created_at_idx ON search_analytics(created_at);

-- Enable RLS on search_analytics
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own search analytics
CREATE POLICY "Users can create their own search analytics"
ON search_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Admins can view all search analytics
CREATE POLICY "Admins can view all search analytics"
ON search_analytics
FOR SELECT
USING (has_role(auth.uid(), 'joyero'::app_role));

-- Policy: Users can view their own search analytics
CREATE POLICY "Users can view their own search analytics"
ON search_analytics
FOR SELECT
USING (auth.uid() = user_id);