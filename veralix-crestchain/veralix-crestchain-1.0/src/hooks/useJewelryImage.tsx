import { useMemo } from 'react';

interface JewelryImageData {
  id: string;
  user_id: string;
  main_image_url?: string | null;
  images_count: number;
}

/**
 * Hook dedicado para manejar URLs de imágenes de joyería
 * Prioriza URLs pre-guardadas en la DB, con fallback a construcción manual
 */
export const useJewelryImage = (jewelry: JewelryImageData) => {
  // Memoizar basado en valores primitivos estables para prevenir re-cálculos
  const imageUrl = useMemo(() => {
    // PRIORITY 1: URL pre-guardada en la DB (después de la migración)
    if (jewelry.main_image_url) {
      return jewelry.main_image_url;
    }
    
    // PRIORITY 2: Construir como fallback para items antiguos
    if (jewelry.images_count > 0) {
      return `https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/${jewelry.user_id}/${jewelry.id}/main.jpg`;
    }
    
    return null;
  }, [jewelry.id, jewelry.main_image_url]); // Solo depende de ID y URL, no del objeto completo

  return { imageUrl };
};
