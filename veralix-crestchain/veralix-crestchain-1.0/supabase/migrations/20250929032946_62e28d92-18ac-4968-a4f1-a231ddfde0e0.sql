-- Crear enum para categorías de cliente
CREATE TYPE public.client_category AS ENUM (
  'regular',
  'premium', 
  'corporativo',
  'mayorista'
);

-- Crear enum para tipos de joya (para precios específicos)
CREATE TYPE public.jewelry_type_pricing AS ENUM (
  'anillo',
  'collar',
  'pulsera',
  'aretes',
  'reloj',
  'cadena',
  'dije',
  'broche',
  'gemelos',
  'otro'
);

-- Tabla de configuración de precios por certificado
CREATE TABLE public.certificate_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jewelry_type jewelry_type_pricing NOT NULL,
  client_category client_category NOT NULL,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'COP',
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraint única para evitar duplicados
  UNIQUE(jewelry_type, client_category, min_quantity)
);

-- Tabla para categorías personalizadas de clientes
CREATE TABLE public.client_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category client_category NOT NULL DEFAULT 'regular',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  
  -- Un usuario solo puede tener una categoría
  UNIQUE(user_id)
);

-- Tabla para pagos de certificados individuales
CREATE TABLE public.certificate_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jewelry_item_id UUID NOT NULL REFERENCES public.jewelry_items(id) ON DELETE CASCADE,
  certificate_id TEXT, -- Se llena cuando se genera el certificado
  
  -- Información del pago
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  
  -- Datos de Bold.co
  bold_order_id TEXT UNIQUE,
  bold_transaction_id TEXT,
  bold_payment_url TEXT,
  
  -- Configuración de precios aplicada
  applied_pricing_id UUID REFERENCES public.certificate_pricing(id),
  client_category_applied client_category NOT NULL DEFAULT 'regular',
  discount_applied NUMERIC(5,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.certificate_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para certificate_pricing
CREATE POLICY "Admins can manage all pricing" 
ON public.certificate_pricing 
FOR ALL 
USING (has_role(auth.uid(), 'joyero'::app_role));

CREATE POLICY "Users can view active pricing" 
ON public.certificate_pricing 
FOR SELECT 
USING (is_active = true);

-- Políticas RLS para client_categories  
CREATE POLICY "Admins can manage all client categories" 
ON public.client_categories 
FOR ALL 
USING (has_role(auth.uid(), 'joyero'::app_role));

CREATE POLICY "Users can view their own category" 
ON public.client_categories 
FOR SELECT 
USING (auth.uid() = user_id);

-- Políticas RLS para certificate_payments
CREATE POLICY "Users can view their own payments" 
ON public.certificate_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" 
ON public.certificate_payments 
FOR SELECT 
USING (has_role(auth.uid(), 'joyero'::app_role));

CREATE POLICY "Users can create their own payments" 
ON public.certificate_payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments" 
ON public.certificate_payments 
FOR UPDATE 
USING (true); -- Para webhooks de Bold.co

-- Triggers para updated_at
CREATE TRIGGER update_certificate_pricing_updated_at
BEFORE UPDATE ON public.certificate_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificate_payments_updated_at
BEFORE UPDATE ON public.certificate_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para obtener el precio de certificación para un usuario
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
BEGIN
  -- Obtener la categoría del cliente (por defecto 'regular')
  DECLARE 
    user_category client_category;
  BEGIN
    SELECT cc.category INTO user_category
    FROM public.client_categories cc
    WHERE cc.user_id = p_user_id;
    
    -- Si no tiene categoría asignada, usar 'regular'
    IF user_category IS NULL THEN
      user_category := 'regular'::client_category;
    END IF;
  END;
  
  -- Buscar el precio correspondiente
  RETURN QUERY
  SELECT 
    cp.base_price,
    cp.currency,
    user_category,
    cp.discount_percentage,
    cp.id
  FROM public.certificate_pricing cp
  WHERE cp.jewelry_type = p_jewelry_type::jewelry_type_pricing
    AND cp.client_category = user_category
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
    ORDER BY cp.min_quantity DESC NULLS LAST
    LIMIT 1;
  END IF;
END;
$$;

-- Insertar precios base por defecto
INSERT INTO public.certificate_pricing (jewelry_type, client_category, base_price, currency, discount_percentage) VALUES
-- Precios regulares
('anillo', 'regular', 25000, 'COP', 0),
('collar', 'regular', 30000, 'COP', 0),
('pulsera', 'regular', 25000, 'COP', 0),
('aretes', 'regular', 20000, 'COP', 0),
('reloj', 'regular', 40000, 'COP', 0),
('cadena', 'regular', 30000, 'COP', 0),
('dije', 'regular', 20000, 'COP', 0),
('broche', 'regular', 25000, 'COP', 0),
('gemelos', 'regular', 35000, 'COP', 0),
('otro', 'regular', 25000, 'COP', 0),

-- Precios premium (10% descuento)
('anillo', 'premium', 25000, 'COP', 10),
('collar', 'premium', 30000, 'COP', 10),
('pulsera', 'premium', 25000, 'COP', 10),
('aretes', 'premium', 20000, 'COP', 10),
('reloj', 'premium', 40000, 'COP', 10),
('cadena', 'premium', 30000, 'COP', 10),
('dije', 'premium', 20000, 'COP', 10),
('broche', 'premium', 25000, 'COP', 10),
('gemelos', 'premium', 35000, 'COP', 10),
('otro', 'premium', 25000, 'COP', 10),

-- Precios corporativos (20% descuento)
('anillo', 'corporativo', 25000, 'COP', 20),
('collar', 'corporativo', 30000, 'COP', 20),
('pulsera', 'corporativo', 25000, 'COP', 20),
('aretes', 'corporativo', 20000, 'COP', 20),
('reloj', 'corporativo', 40000, 'COP', 20),
('cadena', 'corporativo', 30000, 'COP', 20),
('dije', 'corporativo', 20000, 'COP', 20),
('broche', 'corporativo', 25000, 'COP', 20),
('gemelos', 'corporativo', 35000, 'COP', 20),
('otro', 'corporativo', 25000, 'COP', 20),

-- Precios mayoristas (30% descuento)
('anillo', 'mayorista', 25000, 'COP', 30),
('collar', 'mayorista', 30000, 'COP', 30),
('pulsera', 'mayorista', 25000, 'COP', 30),
('aretes', 'mayorista', 20000, 'COP', 30),
('reloj', 'mayorista', 40000, 'COP', 30),
('cadena', 'mayorista', 30000, 'COP', 30),
('dije', 'mayorista', 20000, 'COP', 30),
('broche', 'mayorista', 25000, 'COP', 30),
('gemelos', 'mayorista', 35000, 'COP', 30),
('otro', 'mayorista', 25000, 'COP', 30);