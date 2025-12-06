-- =============================================
-- Tabla para pagos con QR Bancolombia
-- =============================================

CREATE TABLE IF NOT EXISTS public.pagos_qr (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  referencia VARCHAR(50) NOT NULL UNIQUE,
  monto DECIMAL(12,2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'aprobado', 'rechazado')),
  comprobante_url TEXT,
  detalles JSONB DEFAULT '{}',
  mensaje_admin TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  aprobado_por UUID REFERENCES auth.users(id),
  aprobado_en TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pagos_qr_user_id ON public.pagos_qr(user_id);
CREATE INDEX IF NOT EXISTS idx_pagos_qr_estado ON public.pagos_qr(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_qr_referencia ON public.pagos_qr(referencia);

-- Habilitar RLS
ALTER TABLE public.pagos_qr ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuarios ven sus pagos" ON public.pagos_qr FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios crean pagos" ON public.pagos_qr FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios actualizan comprobante" ON public.pagos_qr FOR UPDATE 
  USING (auth.uid() = user_id AND estado IN ('pendiente', 'en_revision'));

-- Admin policies
CREATE POLICY "Admin ve todos" ON public.pagos_qr FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin actualiza" ON public.pagos_qr FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
