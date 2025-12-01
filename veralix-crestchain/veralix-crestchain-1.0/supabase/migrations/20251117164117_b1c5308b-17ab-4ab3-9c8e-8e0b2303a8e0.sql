-- Poblar main_image_url y image_urls desde el storage para todos los items con imágenes
-- Esto elimina la necesidad de reconstruir URLs dinámicamente

UPDATE jewelry_items 
SET 
  main_image_url = CONCAT(
    'https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/',
    user_id, '/', id, '/main.jpg'
  ),
  image_urls = ARRAY[
    CONCAT('https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/', user_id, '/', id, '/main.jpg')
  ]
WHERE images_count > 0 
  AND (main_image_url IS NULL OR main_image_url = '');

-- Crear índice para optimizar búsquedas por main_image_url
CREATE INDEX IF NOT EXISTS idx_jewelry_items_main_image_url 
ON jewelry_items(main_image_url) 
WHERE main_image_url IS NOT NULL;