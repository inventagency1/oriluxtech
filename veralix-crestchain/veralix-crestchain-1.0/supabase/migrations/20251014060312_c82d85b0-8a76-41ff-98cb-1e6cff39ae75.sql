-- Crear tabla de reviews del marketplace
CREATE TABLE public.marketplace_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN NOT NULL DEFAULT true,
  seller_response TEXT,
  seller_response_date TIMESTAMP WITH TIME ZONE,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint: Un usuario solo puede dejar una review por pedido
  UNIQUE(order_id, reviewer_id)
);

-- Añadir columnas de rating al marketplace_listings
ALTER TABLE public.marketplace_listings 
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Habilitar RLS
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reviews
CREATE POLICY "Anyone can view visible reviews"
ON public.marketplace_reviews
FOR SELECT
USING (is_visible = true);

CREATE POLICY "Verified buyers can create reviews"
ON public.marketplace_reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id 
  AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_id 
    AND buyer_id = auth.uid() 
    AND order_status = 'completed'
  )
);

CREATE POLICY "Reviewers can update their own reviews"
ON public.marketplace_reviews
FOR UPDATE
USING (auth.uid() = reviewer_id)
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Sellers can add responses to reviews"
ON public.marketplace_reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_listings ml
    WHERE ml.id = listing_id AND ml.seller_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all reviews"
ON public.marketplace_reviews
FOR ALL
USING (has_role(auth.uid(), 'joyero'::app_role));

-- Índices para mejorar rendimiento
CREATE INDEX idx_reviews_listing ON public.marketplace_reviews(listing_id);
CREATE INDEX idx_reviews_reviewer ON public.marketplace_reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON public.marketplace_reviews(rating);
CREATE INDEX idx_reviews_created ON public.marketplace_reviews(created_at DESC);

-- Función para actualizar el rating promedio del listing
CREATE OR REPLACE FUNCTION public.update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el average_rating y review_count del listing
  UPDATE public.marketplace_listings
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.marketplace_reviews
      WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id)
      AND is_visible = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.marketplace_reviews
      WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id)
      AND is_visible = true
    )
  WHERE id = COALESCE(NEW.listing_id, OLD.listing_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para actualizar rating automáticamente
CREATE TRIGGER update_listing_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.marketplace_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_listing_rating();

-- Trigger para updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.marketplace_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();