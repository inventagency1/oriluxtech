-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Habilitar RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver sus propios favoritos
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden agregar favoritos
CREATE POLICY "Users can add favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden eliminar sus favoritos
CREATE POLICY "Users can remove favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE public.favorites IS 'Tabla para almacenar los listados favoritos de los usuarios';
COMMENT ON COLUMN public.favorites.user_id IS 'ID del usuario que guardó el favorito';
COMMENT ON COLUMN public.favorites.listing_id IS 'ID del listing del marketplace marcado como favorito';