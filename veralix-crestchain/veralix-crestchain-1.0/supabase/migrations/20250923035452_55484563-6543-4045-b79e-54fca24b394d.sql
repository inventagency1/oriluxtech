-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('joyero', 'cliente');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roles"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for jewelry_items to only allow joyeros to create/manage
DROP POLICY IF EXISTS "Users can create their own jewelry items" ON public.jewelry_items;
DROP POLICY IF EXISTS "Users can update their own jewelry items" ON public.jewelry_items;
DROP POLICY IF EXISTS "Users can delete their own jewelry items" ON public.jewelry_items;

CREATE POLICY "Joyeros can create jewelry items"
ON public.jewelry_items
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  public.has_role(auth.uid(), 'joyero')
);

CREATE POLICY "Joyeros can update their jewelry items"
ON public.jewelry_items
FOR UPDATE
USING (
  auth.uid() = user_id AND 
  public.has_role(auth.uid(), 'joyero')
);

CREATE POLICY "Joyeros can delete their jewelry items"
ON public.jewelry_items
FOR DELETE
USING (
  auth.uid() = user_id AND 
  public.has_role(auth.uid(), 'joyero')
);

-- Clientes can view jewelry items they own certificates for
CREATE POLICY "Clientes can view jewelry they own certificates for"
ON public.jewelry_items
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.nft_certificates 
    WHERE jewelry_item_id = jewelry_items.id 
    AND user_id = auth.uid()
    AND public.has_role(auth.uid(), 'cliente')
  )
);

-- Update certificates policies
DROP POLICY IF EXISTS "Users can create certificates for their jewelry" ON public.nft_certificates;
DROP POLICY IF EXISTS "Users can update their own certificates" ON public.nft_certificates;

CREATE POLICY "Joyeros can create certificates for their jewelry"
ON public.nft_certificates
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'joyero') AND
  EXISTS (
    SELECT 1 FROM public.jewelry_items 
    WHERE id = jewelry_item_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Certificate owners can update certificates"
ON public.nft_certificates
FOR UPDATE
USING (auth.uid() = user_id);

-- Both joyeros and clientes can view certificates they own
CREATE POLICY "Users can view certificates they own"
ON public.nft_certificates
FOR SELECT
USING (auth.uid() = user_id);

-- Update handle_new_user function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  
  -- Assign default role as 'cliente' (can be changed later)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente');
  
  RETURN NEW;
END;
$$;