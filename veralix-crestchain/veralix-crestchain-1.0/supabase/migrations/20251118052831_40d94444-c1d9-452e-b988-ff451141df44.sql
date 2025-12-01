-- Crear bucket público para almacenar certificados HTML
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificate-files',
  'certificate-files',
  true,
  5242880, -- 5MB limit
  ARRAY['text/html']::text[]
);

-- Política RLS: Permitir lectura pública de certificados
CREATE POLICY "Public can view certificate files"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificate-files');

-- Política RLS: Solo usuarios autenticados pueden subir certificados
CREATE POLICY "Authenticated users can upload certificate files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificate-files' 
  AND auth.role() = 'authenticated'
);