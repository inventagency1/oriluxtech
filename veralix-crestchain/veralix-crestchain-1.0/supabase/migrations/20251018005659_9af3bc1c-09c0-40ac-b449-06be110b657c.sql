-- Tabla para guardar metadatos temporales de pagos antes de redirigir a Bold
CREATE TABLE IF NOT EXISTS public.pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('certificate_package', 'certificate_individual', 'subscription')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'COP',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pending_payments_order_id ON public.pending_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON public.pending_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_expires_at ON public.pending_payments(expires_at);

-- Habilitar RLS
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden crear sus propios pagos pendientes
CREATE POLICY "Users can create their own pending payments"
  ON public.pending_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden ver sus propios pagos pendientes
CREATE POLICY "Users can view their own pending payments"
  ON public.pending_payments FOR SELECT
  USING (auth.uid() = user_id);

-- Política: El sistema puede actualizar pagos pendientes
CREATE POLICY "System can update pending payments"
  ON public.pending_payments FOR UPDATE
  USING (true);

-- Política: Los usuarios pueden eliminar sus propios pagos pendientes
CREATE POLICY "Users can delete their own pending payments"
  ON public.pending_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE public.pending_payments IS 'Almacena metadatos temporales de pagos antes de redirigir al gateway de pago';
COMMENT ON COLUMN public.pending_payments.order_id IS 'ID único del pedido que se usará en Bold.co';
COMMENT ON COLUMN public.pending_payments.payment_type IS 'Tipo de pago: certificate_package, certificate_individual, o subscription';
COMMENT ON COLUMN public.pending_payments.metadata IS 'Metadatos adicionales del pago (package_id, jewelry_item_id, etc.)';
COMMENT ON COLUMN public.pending_payments.expires_at IS 'Fecha de expiración del pago pendiente (24 horas por defecto)';