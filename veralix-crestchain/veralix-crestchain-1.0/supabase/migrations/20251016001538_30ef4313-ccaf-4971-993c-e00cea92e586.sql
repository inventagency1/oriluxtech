-- Crear tabla para gestión de paquetes de certificados
CREATE TABLE IF NOT EXISTS public.certificate_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id TEXT UNIQUE NOT NULL,
  package_name TEXT NOT NULL,
  certificates_count INTEGER NOT NULL CHECK (certificates_count > 0),
  base_price NUMERIC NOT NULL CHECK (base_price >= 0),
  currency TEXT NOT NULL DEFAULT 'COP',
  price_per_certificate NUMERIC GENERATED ALWAYS AS (base_price / certificates_count) STORED,
  
  -- Metadatos
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  icon_name TEXT DEFAULT 'Gem',
  color_scheme TEXT DEFAULT 'primary',
  
  -- Descuentos
  discount_percentage NUMERIC DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  savings_amount NUMERIC DEFAULT 0,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_certificate_packages_active ON public.certificate_packages(is_active, display_order);
CREATE INDEX idx_certificate_packages_package_id ON public.certificate_packages(package_id);

-- RLS
ALTER TABLE public.certificate_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
ON public.certificate_packages
FOR SELECT
TO authenticated, anon
USING (is_active = true);

CREATE POLICY "Admins can manage all packages"
ON public.certificate_packages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger
CREATE TRIGGER update_certificate_packages_updated_at
  BEFORE UPDATE ON public.certificate_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Datos iniciales (migración de paquetes hardcodeados)
INSERT INTO public.certificate_packages (
  package_id, package_name, certificates_count, base_price, currency,
  description, features, icon_name, color_scheme, is_popular, display_order
) VALUES
(
  'pack-10',
  'Pack de 10 Certificados',
  10,
  270000,
  'COP',
  'Ideal para comenzar o joyerías pequeñas',
  '["10 Certificados NFT prepagados","Blockchain Ethereum","Soporte por email","Dashboard completo","Verificación pública + QR","Sin expiración","Usuarios ilimitados"]'::jsonb,
  'Gem',
  'crypto-blue',
  false,
  1
),
(
  'pack-50',
  'Pack de 50 Certificados',
  50,
  1350000,
  'COP',
  'Perfecto para joyerías establecidas',
  '["50 Certificados NFT prepagados","Blockchain Ethereum","Soporte prioritario","Dashboard con analytics","Verificación pública + QR","Sin expiración","Usuarios ilimitados","API access incluido"]'::jsonb,
  'Star',
  'primary',
  true,
  2
),
(
  'pack-100',
  'Pack de 100 Certificados',
  100,
  2500000,
  'COP',
  'Máximo volumen con mejor precio',
  '["100 Certificados NFT prepagados","¡Ahorra COP $200.000!","Blockchain Ethereum","Soporte dedicado","Dashboard premium + BI","Verificación avanzada","Sin expiración","Usuarios ilimitados","API completo","Personalización de marca"]'::jsonb,
  'Crown',
  'secondary',
  false,
  3
);