import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceData {
  enabled: boolean;
  message: string;
  estimated_end: string | null;
}

export const useMaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (error) {
        // Si no se encuentra, asumir que no está en mantenimiento
        if (error.code === 'PGRST116') {
          setIsMaintenanceMode(false);
          setMaintenanceData(null);
          return;
        }
        throw error;
      }

      const maintenance = data.value as unknown as MaintenanceData;
      setIsMaintenanceMode(maintenance.enabled);
      setMaintenanceData(maintenance);
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
      // En caso de error, asumir que no está en mantenimiento para no bloquear
      setIsMaintenanceMode(false);
      setMaintenanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const enableMaintenanceMode = async (message?: string, estimatedEnd?: string) => {
    try {
      const maintenanceConfig: MaintenanceData = {
        enabled: true,
        message: message || 'Estamos realizando mejoras en Veralix. Vuelve pronto.',
        estimated_end: estimatedEnd || null
      };

      const { error } = await supabase
        .from('system_settings')
        .update({
          value: maintenanceConfig as any,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'maintenance_mode');

      if (error) throw error;

      setIsMaintenanceMode(true);
      setMaintenanceData(maintenanceConfig);
      
      toast({
        title: "Modo mantenimiento activado",
        description: "Los usuarios verán la página de mantenimiento",
      });

      return { success: true };
    } catch (error) {
      console.error('Error enabling maintenance mode:', error);
      toast({
        title: "Error",
        description: "No se pudo activar el modo mantenimiento",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const disableMaintenanceMode = async () => {
    try {
      const maintenanceConfig: MaintenanceData = {
        enabled: false,
        message: '',
        estimated_end: null
      };

      const { error } = await supabase
        .from('system_settings')
        .update({
          value: maintenanceConfig as any,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'maintenance_mode');

      if (error) throw error;

      setIsMaintenanceMode(false);
      setMaintenanceData(maintenanceConfig);
      
      toast({
        title: "Modo mantenimiento desactivado",
        description: "El sitio está nuevamente operativo",
      });

      return { success: true };
    } catch (error) {
      console.error('Error disabling maintenance mode:', error);
      toast({
        title: "Error",
        description: "No se pudo desactivar el modo mantenimiento",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateMaintenanceMessage = async (message: string, estimatedEnd?: string) => {
    if (!maintenanceData) return { success: false };

    try {
      const updatedConfig: MaintenanceData = {
        ...maintenanceData,
        message,
        estimated_end: estimatedEnd || maintenanceData.estimated_end
      };

      const { error } = await supabase
        .from('system_settings')
        .update({
          value: updatedConfig as any,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'maintenance_mode');

      if (error) throw error;

      setMaintenanceData(updatedConfig);
      
      toast({
        title: "Mensaje actualizado",
        description: "El mensaje de mantenimiento fue actualizado",
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating maintenance message:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el mensaje",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    checkMaintenanceMode();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('maintenance-mode-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.maintenance_mode'
        },
        (payload) => {
          console.log('🔄 Maintenance mode changed:', payload);
          if (payload.new && 'value' in payload.new) {
            const maintenance = payload.new.value as unknown as MaintenanceData;
            setIsMaintenanceMode(maintenance.enabled);
            setMaintenanceData(maintenance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    isMaintenanceMode,
    maintenanceData,
    loading,
    enableMaintenanceMode,
    disableMaintenanceMode,
    updateMaintenanceMessage,
    refetch: checkMaintenanceMode
  };
};
