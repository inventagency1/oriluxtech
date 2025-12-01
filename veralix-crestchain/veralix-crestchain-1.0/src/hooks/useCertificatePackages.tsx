import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CertificatePackage {
  id: string;
  package_id: string;
  package_name: string;
  certificates_count: number;
  base_price: number;
  currency: string;
  price_per_certificate: number;
  description: string;
  features: string[];
  icon_name: string;
  color_scheme: string;
  discount_percentage: number;
  savings_amount: number;
  is_active: boolean;
  is_popular: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useCertificatePackages() {
  const [packages, setPackages] = useState<CertificatePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPackages = useCallback(async (includeInactive = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('certificate_packages')
        .select('*')
        .order('display_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPackages((data || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : []
      })) as CertificatePackage[]);
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los paquetes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []); // Remove toast dependency to prevent infinite loops

  const upsertPackage = useCallback(async (packageData: any) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('certificate_packages')
        .upsert([packageData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: packageData.id ? "Paquete actualizado" : "Paquete creado",
      });

      await fetchPackages(true);
      return data;
    } catch (error: any) {
      console.error('Error upserting package:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el paquete",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPackages, toast]);

  const deletePackage = useCallback(async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('certificate_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Paquete eliminado correctamente",
      });

      await fetchPackages(true);
    } catch (error: any) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el paquete",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchPackages, toast]);

  return {
    packages,
    loading,
    fetchPackages,
    upsertPackage,
    deletePackage
  };
}
