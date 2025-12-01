-- Crear tabla para pricing de paquetes por categoría de cliente
CREATE TABLE IF NOT EXISTS public.package_category_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.certificate_packages(id) ON DELETE CASCADE,
  client_category client_category NOT NULL,
  adjusted_price NUMERIC NOT NULL CHECK (adjusted_price >= 0),
  discount_percentage NUMERIC DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(package_id, client_category)
);

-- Índices para mejorar performance
CREATE INDEX idx_package_category_pricing_package ON public.package_category_pricing(package_id);
CREATE INDEX idx_package_category_pricing_category ON public.package_category_pricing(client_category);
CREATE INDEX idx_package_category_pricing_active ON public.package_category_pricing(is_active);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_package_category_pricing_updated_at
  BEFORE UPDATE ON public.package_category_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.package_category_pricing ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage all package category pricing"
  ON public.package_category_pricing
  FOR ALL
  USING (has_role(auth.uid(), 'joyero'::app_role));

CREATE POLICY "Authenticated users can view active pricing for their category"
  ON public.package_category_pricing
  FOR SELECT
  USING (
    is_active = true AND (
      has_role(auth.uid(), 'joyero'::app_role) OR
      client_category = (
        SELECT category FROM client_categories WHERE user_id = auth.uid()
      ) OR
      (
        NOT EXISTS (SELECT 1 FROM client_categories WHERE user_id = auth.uid())
        AND client_category = 'regular'::client_category
      )
    )
  );

-- Función para obtener precio de paquete según categoría de usuario
CREATE OR REPLACE FUNCTION public.get_package_price_for_user(
  p_package_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  base_price NUMERIC,
  adjusted_price NUMERIC,
  discount_percentage NUMERIC,
  client_category client_category,
  has_custom_pricing BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_category client_category;
  v_package_base_price NUMERIC;
BEGIN
  -- Obtener categoría del usuario
  SELECT cc.category INTO v_user_category
  FROM public.client_categories cc
  WHERE cc.user_id = p_user_id;
  
  -- Si no tiene categoría, usar 'regular'
  IF v_user_category IS NULL THEN
    v_user_category := 'regular'::client_category;
  END IF;
  
  -- Obtener precio base del paquete
  SELECT cp.base_price INTO v_package_base_price
  FROM public.certificate_packages cp
  WHERE cp.id = p_package_id AND cp.is_active = true;
  
  -- Buscar precio personalizado por categoría
  RETURN QUERY
  SELECT 
    v_package_base_price as base_price,
    COALESCE(pcp.adjusted_price, v_package_base_price) as adjusted_price,
    COALESCE(pcp.discount_percentage, 0) as discount_percentage,
    v_user_category as client_category,
    EXISTS(
      SELECT 1 FROM package_category_pricing 
      WHERE package_id = p_package_id 
      AND client_category = v_user_category
      AND is_active = true
    ) as has_custom_pricing
  FROM public.certificate_packages cp
  LEFT JOIN public.package_category_pricing pcp 
    ON pcp.package_id = p_package_id 
    AND pcp.client_category = v_user_category
    AND pcp.is_active = true
  WHERE cp.id = p_package_id
  LIMIT 1;
  
  -- Si no se encontró el paquete, devolver NULL
  IF NOT FOUND THEN
    RETURN;
  END IF;
END;
$$;

COMMENT ON TABLE public.package_category_pricing IS 'Pricing personalizado de paquetes de certificados según categoría de cliente';
COMMENT ON FUNCTION public.get_package_price_for_user IS 'Obtiene el precio de un paquete según la categoría del usuario';