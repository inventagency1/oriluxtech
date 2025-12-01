import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CertificatePricingRow = Database['public']['Tables']['certificate_pricing']['Row'];
type CertificatePricingInsert = Database['public']['Tables']['certificate_pricing']['Insert'];

export interface PriceQuote {
  price: number;
  currency: string;
  category: string;
  discount_percentage: number;
  final_price: number;
  pricing_id: string;
}

export function useCertificatePricing() {
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<CertificatePricingRow[]>([]);
  const { toast } = useToast();

  // Obtener cotización de precio para un usuario y tipo de joya
  const getPriceQuote = useCallback(async (userId: string, jewelryType: string, quantity = 1): Promise<PriceQuote | null> => {
    try {
      // Validar que userId no sea null/undefined
      if (!userId || userId.trim() === '') {
        console.error('getPriceQuote: Invalid userId provided');
        return null;
      }
      
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_certification_price', {
          p_user_id: userId,
          p_jewelry_type: jewelryType,
          p_quantity: quantity
        });

      if (error) {
        console.error('Error getting price quote:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.warn(`No pricing found for jewelry type: ${jewelryType}`);
        return null;
      }

      const pricing = data[0];
      const finalPrice = pricing.price * (1 - (pricing.discount_percentage || 0) / 100);

      return {
        price: pricing.price,
        currency: pricing.currency,
        category: pricing.client_category,
        discount_percentage: pricing.discount_percentage || 0,
        final_price: Math.round(finalPrice),
        pricing_id: pricing.pricing_id
      };

    } catch (error: any) {
      console.error('Price quote error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar todos los precios (solo para admins)
  const loadAllPrices = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('certificate_pricing')
        .select('*')
        .order('jewelry_type', { ascending: true })
        .order('client_category', { ascending: true });

      if (error) {
        throw error;
      }

      setPrices(data || []);
      
    } catch (error: any) {
      console.error('Error loading prices:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los precios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Crear o actualizar precio
  const upsertPrice = async (pricing: CertificatePricingInsert) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('certificate_pricing')
        .upsert([pricing])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Precio actualizado",
        description: "La configuración de precios se ha guardado correctamente",
      });

      // Recargar precios
      await loadAllPrices();
      
      return data;

    } catch (error: any) {
      console.error('Error upserting price:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el precio",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar precio
  const deletePrice = async (priceId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('certificate_pricing')
        .delete()
        .eq('id', priceId);

      if (error) {
        throw error;
      }

      toast({
        title: "Precio eliminado",
        description: "La configuración de precios se ha eliminado correctamente",
      });

      // Recargar precios
      await loadAllPrices();

    } catch (error: any) {
      console.error('Error deleting price:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el precio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    prices,
    getPriceQuote,
    loadAllPrices,
    upsertPrice,
    deletePrice
  };
}