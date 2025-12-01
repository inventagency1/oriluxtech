-- Create marketplace_listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jewelry_item_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (jewelry_item_id) REFERENCES public.jewelry_items(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace_listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active');

CREATE POLICY "Sellers can create their own listings"
ON public.marketplace_listings
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings"
ON public.marketplace_listings
FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings"
ON public.marketplace_listings
FOR DELETE
USING (auth.uid() = seller_id);

-- Create function to update timestamps
CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_created_at ON public.marketplace_listings(created_at DESC);
CREATE INDEX idx_marketplace_listings_price ON public.marketplace_listings(price);
CREATE INDEX idx_marketplace_listings_featured ON public.marketplace_listings(featured) WHERE featured = true;