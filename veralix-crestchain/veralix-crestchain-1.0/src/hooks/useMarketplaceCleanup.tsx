import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMarketplaceCleanup() {
  const [loading, setLoading] = useState(false);

  const cleanupMarketplace = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-marketplace');

      if (error) throw error;

      toast.success(`✅ ${data.message}`, {
        description: `${data.cleaned_count} productos eliminados`
      });

      return data;
    } catch (error: any) {
      toast.error('Error en limpieza', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async (jewelryItemId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-jewelry-images', {
        body: { jewelry_item_id: jewelryItemId }
      });

      if (error) throw error;

      toast.success('🎨 Imagen generada con AI');
      return data;
    } catch (error: any) {
      toast.error('Error generando imagen', {
        description: error.message
      });
      throw error;
    }
  };

  const enhanceDescription = async (listingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('enhance-jewelry-descriptions', {
        body: { listing_id: listingId }
      });

      if (error) throw error;

      toast.success('✍️ Descripción mejorada con AI');
      return data;
    } catch (error: any) {
      toast.error('Error mejorando descripción', {
        description: error.message
      });
      throw error;
    }
  };

  const generateAllImages = async () => {
    setLoading(true);
    try {
      // Obtener productos sin imágenes
      const { data: listings, error } = await supabase
        .from('marketplace_listings_complete')
        .select('jewelry_item_id, jewelry_name')
        .eq('status', 'active')
        .or('jewelry_images_count.eq.0,jewelry_images_count.is.null');

      if (error) throw error;

      if (!listings || listings.length === 0) {
        toast.info('No hay productos sin imágenes');
        return { success: true, count: 0 };
      }

      toast.info(`🎨 Generando ${listings.length} imágenes...`, {
        description: 'Esto puede tardar unos minutos'
      });

      let successCount = 0;
      let errorCount = 0;

      for (const listing of listings) {
        try {
          await generateImage(listing.jewelry_item_id);
          successCount++;
          // Delay para evitar rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          errorCount++;
          console.error(`Error generando imagen para ${listing.jewelry_item_id}:`, error);
        }
      }

      toast.success(`✅ Proceso completado`, {
        description: `${successCount} imágenes generadas, ${errorCount} errores`
      });

      return { success: true, successCount, errorCount };
    } catch (error: any) {
      toast.error('Error en generación masiva', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enhanceAllDescriptions = async () => {
    setLoading(true);
    try {
      // Obtener productos con descripciones pobres
      const { data: listings, error } = await supabase
        .from('marketplace_listings')
        .select('id, description')
        .eq('status', 'active');

      if (error) throw error;

      const needsEnhancement = listings?.filter(l => 
        !l.description || l.description.trim().length < 50
      ) || [];

      if (needsEnhancement.length === 0) {
        toast.info('No hay productos que necesiten mejorar descripciones');
        return { success: true, count: 0 };
      }

      toast.info(`✍️ Mejorando ${needsEnhancement.length} descripciones...`, {
        description: 'Esto puede tardar unos minutos'
      });

      let successCount = 0;
      let errorCount = 0;

      for (const listing of needsEnhancement) {
        try {
          await enhanceDescription(listing.id);
          successCount++;
          // Delay para evitar rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          errorCount++;
          console.error(`Error mejorando descripción para ${listing.id}:`, error);
        }
      }

      toast.success(`✅ Proceso completado`, {
        description: `${successCount} descripciones mejoradas, ${errorCount} errores`
      });

      return { success: true, successCount, errorCount };
    } catch (error: any) {
      toast.error('Error en mejora masiva', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    cleanupMarketplace,
    generateImage,
    enhanceDescription,
    generateAllImages,
    enhanceAllDescriptions
  };
}
