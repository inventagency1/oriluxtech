import { supabase } from '@/integrations/supabase/client';

export const useCertificateCache = () => {
  /**
   * Obtiene HTML de certificado desde caché de Supabase
   * @param certificateId - ID del certificado (ej: VRX-001)
   * @returns HTML del certificado o null si no está en caché
   */
  const getCachedHTML = async (certificateId: string): Promise<string | null> => {
    try {
      console.log('🔍 Buscando certificado en caché:', certificateId);
      
      // Intentar desde caché de Supabase
      const { data, error } = await supabase
        .from('certificate_cache')
        .select('html_content, expires_at, id')
        .eq('certificate_id', certificateId)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Error al buscar en caché:', error);
        return null;
      }

      if (!data) {
        console.log('❌ Certificado no encontrado en caché');
        return null;
      }

      // Incrementar contador de accesos (fire and forget)
      supabase.rpc('increment_cache_access', { 
        cache_id: data.id 
      }).then(({ error: rpcError }) => {
        if (rpcError) {
          console.warn('⚠️ No se pudo actualizar contador de accesos:', rpcError);
        }
      });
      
      console.log('✅ HTML cargado desde caché (< 100ms)');
      return data.html_content;
    } catch (error) {
      console.error('❌ Error inesperado al buscar en caché:', error);
      return null;
    }
  };

  return { getCachedHTML };
};
