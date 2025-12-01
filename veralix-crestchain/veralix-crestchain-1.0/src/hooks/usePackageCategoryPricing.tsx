import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PackageCategoryPricingRow = Database['public']['Tables']['package_category_pricing']['Row'];
type PackageCategoryPricingInsert = Database['public']['Tables']['package_category_pricing']['Insert'];

export interface PackageCategoryPricing extends PackageCategoryPricingRow {
  package_name?: string;
  certificates_count?: number;
}

export function usePackageCategoryPricing() {
  const [loading, setLoading] = useState(false);
  const [pricingRules, setPricingRules] = useState<PackageCategoryPricing[]>([]);
  const { toast } = useToast();

  // Cargar todas las reglas de pricing de paquetes por categoría
  const fetchPricingRules = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('package_category_pricing')
        .select(`
          *,
          certificate_packages (
            package_name,
            certificates_count
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(rule => ({
        ...rule,
        package_name: rule.certificate_packages?.package_name,
        certificates_count: rule.certificate_packages?.certificates_count
      })) || [];

      setPricingRules(formattedData);

    } catch (error: any) {
      console.error('Error fetching package category pricing:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reglas de pricing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Crear o actualizar regla de pricing
  const upsertPricingRule = async (rule: any) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('package_category_pricing')
        .upsert([rule])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Regla de pricing guardada correctamente",
      });

      await fetchPricingRules();
      return data;

    } catch (error: any) {
      console.error('Error upserting pricing rule:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la regla de pricing",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar regla de pricing
  const deletePricingRule = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('package_category_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Regla de pricing eliminada",
      });

      await fetchPricingRules();

    } catch (error: any) {
      console.error('Error deleting pricing rule:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la regla",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener precio de un paquete para un usuario específico
  const getPackagePriceForUser = async (packageId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_package_price_for_user', {
          p_package_id: packageId,
          p_user_id: userId
        });

      if (error) throw error;

      return data?.[0] || null;

    } catch (error: any) {
      console.error('Error getting package price for user:', error);
      return null;
    }
  };

  return {
    loading,
    pricingRules,
    fetchPricingRules,
    upsertPricingRule,
    deletePricingRule,
    getPackagePriceForUser,
  };
}