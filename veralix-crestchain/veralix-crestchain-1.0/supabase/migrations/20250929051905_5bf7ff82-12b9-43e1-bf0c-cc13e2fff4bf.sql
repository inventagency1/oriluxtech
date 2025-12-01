-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  marketplace_listing_id UUID NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT,
  payment_reference TEXT,
  bold_payment_id TEXT,
  bold_transaction_id TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (marketplace_listing_id) REFERENCES public.marketplace_listings(id) ON DELETE CASCADE
);

-- Create order_items table (for future expansion to cart-based purchases)
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  marketplace_listing_id UUID NOT NULL,
  jewelry_item_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  FOREIGN KEY (marketplace_listing_id) REFERENCES public.marketplace_listings(id),
  FOREIGN KEY (jewelry_item_id) REFERENCES public.jewelry_items(id)
);

-- Create order_communications table for buyer-seller messages
CREATE TABLE public.order_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'message' CHECK (message_type IN ('message', 'offer', 'counter_offer', 'status_update')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_communications ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their orders as buyer or seller"
ON public.orders
FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers and sellers can update their orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create policies for order_items
CREATE POLICY "Users can view order items for their orders"
ON public.order_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders o 
  WHERE o.id = order_items.order_id 
  AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
));

CREATE POLICY "System can manage order items"
ON public.order_items
FOR ALL
USING (true);

-- Create policies for order_communications
CREATE POLICY "Users can view communications for their orders"
ON public.order_communications
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders o 
  WHERE o.id = order_communications.order_id 
  AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
));

CREATE POLICY "Users can create communications for their orders"
ON public.order_communications
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_communications.order_id 
    AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
  )
);

-- Create triggers for timestamps
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get the next sequential number
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.orders
  WHERE order_number ~ '^ORD-[0-9]+$';
  
  -- Format as ORD-001, ORD-002, etc.
  new_number := 'ORD-' || LPAD(counter::TEXT, 6, '0');
  
  RETURN new_number;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_order_status ON public.orders(order_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_communications_order_id ON public.order_communications(order_id);
CREATE INDEX idx_order_communications_created_at ON public.order_communications(created_at DESC);