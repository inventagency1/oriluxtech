-- Fix security issue: Set proper search_path for the certificate ID generation function
CREATE OR REPLACE FUNCTION public.generate_certificate_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INTEGER;
BEGIN
  -- Get the next sequential number
  SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_id FROM 5) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.nft_certificates
  WHERE certificate_id ~ '^VRX-[0-9]+$';
  
  -- Format as VRX-001, VRX-002, etc.
  new_id := 'VRX-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create storage buckets for jewelry images
INSERT INTO storage.buckets (id, name, public) VALUES ('jewelry-images', 'jewelry-images', true);

-- Storage policies for jewelry images
CREATE POLICY "Authenticated users can upload jewelry images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'jewelry-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own jewelry images" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'jewelry-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own jewelry images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'jewelry-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public access to jewelry images for verification" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'jewelry-images');

-- Create a function to get user's current subscription info
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  plan subscription_plan,
  status subscription_status,
  certificates_limit INTEGER,
  certificates_used INTEGER,
  can_create_certificate BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.plan,
    s.status,
    s.certificates_limit,
    s.certificates_used,
    (s.status = 'active' AND s.certificates_used < s.certificates_limit) as can_create_certificate
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid
    AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;