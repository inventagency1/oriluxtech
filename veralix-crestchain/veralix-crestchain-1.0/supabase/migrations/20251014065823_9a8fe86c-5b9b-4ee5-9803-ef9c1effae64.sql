-- Fix get_certification_price function - column user_category does not exist
CREATE OR REPLACE FUNCTION public.get_certification_price(
  p_user_id UUID,
  p_jewelry_type TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS TABLE (
  price NUMERIC,
  currency TEXT,
  client_category client_category,
  discount_percentage NUMERIC,
  pricing_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  v_user_category client_category;
BEGIN
  -- Obtener la categoría del cliente (por defecto 'regular')
  SELECT cc.category INTO v_user_category
  FROM public.client_categories cc
  WHERE cc.user_id = p_user_id;
  
  -- Si no tiene categoría asignada, usar 'regular'
  IF v_user_category IS NULL THEN
    v_user_category := 'regular'::client_category;
  END IF;
  
  -- Buscar el precio correspondiente
  RETURN QUERY
  SELECT 
    cp.base_price,
    cp.currency,
    v_user_category,
    cp.discount_percentage,
    cp.id
  FROM public.certificate_pricing cp
  WHERE cp.jewelry_type = p_jewelry_type::jewelry_type_pricing
    AND cp.client_category = v_user_category
    AND cp.is_active = true
    AND (cp.min_quantity IS NULL OR p_quantity >= cp.min_quantity)
    AND (cp.max_quantity IS NULL OR p_quantity <= cp.max_quantity)
  ORDER BY cp.min_quantity DESC NULLS LAST
  LIMIT 1;
  
  -- Si no se encuentra precio específico, usar precio base para 'regular'
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      cp.base_price,
      cp.currency,
      'regular'::client_category,
      cp.discount_percentage,
      cp.id
    FROM public.certificate_pricing cp
    WHERE cp.jewelry_type = p_jewelry_type::jewelry_type_pricing
      AND cp.client_category = 'regular'::client_category
      AND cp.is_active = true
    ORDER BY cp.base_price ASC
    LIMIT 1;
  END IF;
END;
$$;