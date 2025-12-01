-- FASE 1: Fix Inmediato - Actualizar URLs de imágenes existentes

-- Actualizar "Anillo oro" con sus URLs reales
UPDATE jewelry_items
SET 
  main_image_url = 'https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/437ec4f6-d647-417f-8edc-35ff4bc1bf3f/d948d354-0cd7-4073-9a25-34129538cda7/1758598678310-0.png',
  image_urls = ARRAY[
    'https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/437ec4f6-d647-417f-8edc-35ff4bc1bf3f/d948d354-0cd7-4073-9a25-34129538cda7/1758598678310-0.png',
    'https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/437ec4f6-d647-417f-8edc-35ff4bc1bf3f/d948d354-0cd7-4073-9a25-34129538cda7/1758598678312-1.png'
  ],
  updated_at = now()
WHERE id = 'd948d354-0cd7-4073-9a25-34129538cda7';

-- Actualizar "anillo de oro 18k" con su URL real
UPDATE jewelry_items
SET 
  main_image_url = 'https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/b890155d-4615-4f23-9e64-6571b3d4dc1e/259f4eee-b0ec-448c-acbe-bb2f34a77ae5/1759295080053-0.png',
  image_urls = ARRAY[
    'https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/b890155d-4615-4f23-9e64-6571b3d4dc1e/259f4eee-b0ec-448c-acbe-bb2f34a77ae5/1759295080053-0.png'
  ],
  updated_at = now()
WHERE id = '259f4eee-b0ec-448c-acbe-bb2f34a77ae5';

-- Log de auditoría
INSERT INTO audit_logs (user_id, action, resource_type, details)
VALUES 
  (
    '437ec4f6-d647-417f-8edc-35ff4bc1bf3f',
    'image_urls_fixed',
    'jewelry_items',
    jsonb_build_object(
      'jewelry_id', 'd948d354-0cd7-4073-9a25-34129538cda7',
      'reason', 'Manual fix for marketplace image display',
      'images_fixed', 2
    )
  ),
  (
    'b890155d-4615-4f23-9e64-6571b3d4dc1e',
    'image_urls_fixed',
    'jewelry_items',
    jsonb_build_object(
      'jewelry_id', '259f4eee-b0ec-448c-acbe-bb2f34a77ae5',
      'reason', 'Manual fix for marketplace image display',
      'images_fixed', 1
    )
  );