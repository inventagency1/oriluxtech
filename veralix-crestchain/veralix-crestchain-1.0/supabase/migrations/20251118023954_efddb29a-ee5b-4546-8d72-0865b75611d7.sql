-- Eliminar políticas RLS restrictivas y crear una política pública simple
-- para el bucket jewelry-images

-- Eliminar política restrictiva de usuarios autenticados
DROP POLICY IF EXISTS "Users can view their own jewelry images" ON storage.objects;

-- Asegurar que la política pública existe y es correcta
DROP POLICY IF EXISTS "Public access to jewelry images for verification" ON storage.objects;

-- Crear política pública simple y clara para lectura de imágenes
CREATE POLICY "Public read access to jewelry images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'jewelry-images');

-- Mantener las políticas de escritura solo para usuarios autenticados
-- (upload y delete ya existen y están correctas)