import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ClientCategoryRow = Database['public']['Tables']['client_categories']['Row'];
type ClientCategoryInsert = Database['public']['Tables']['client_categories']['Insert'];

export type ClientCategory = 'regular' | 'premium' | 'corporativo' | 'mayorista';

export const CLIENT_CATEGORY_LABELS: Record<ClientCategory, string> = {
  regular: 'Regular',
  premium: 'Premium',
  corporativo: 'Corporativo',
  mayorista: 'Mayorista'
};

export const CLIENT_CATEGORY_DESCRIPTIONS: Record<ClientCategory, string> = {
  regular: 'Cliente regular sin descuentos especiales',
  premium: 'Cliente premium con 10% de descuento',
  corporativo: 'Cliente corporativo con 20% de descuento',
  mayorista: 'Cliente mayorista con 30% de descuento'
};

export function useClientCategories() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ClientCategoryRow[]>([]);
  const { toast } = useToast();

  // Obtener categoría de un usuario
  const getUserCategory = async (userId: string): Promise<ClientCategory> => {
    try {
      const { data, error } = await supabase
        .from('client_categories')
        .select('category')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data?.category as ClientCategory || 'regular';

    } catch (error: any) {
      console.error('Error getting user category:', error);
      return 'regular'; // Default fallback
    }
  };

  // Asignar categoría a un usuario (solo admins)
  const assignCategory = async (userId: string, category: ClientCategory, notes?: string) => {
    try {
      setLoading(true);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('client_categories')
        .upsert({
          user_id: userId,
          category,
          assigned_by: currentUser.id,
          assigned_at: new Date().toISOString(),
          notes: notes || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Categoría asignada",
        description: `Se ha asignado la categoría ${CLIENT_CATEGORY_LABELS[category]} al cliente`,
      });

      return data;

    } catch (error: any) {
      console.error('Error assigning category:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar la categoría",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar todas las categorías (solo para admins)
  const loadAllCategories = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('client_categories')
        .select(`
          *,
          profiles!client_categories_user_id_fkey (
            full_name,
            email,
            business_name
          )
        `)
        .order('assigned_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCategories(data || []);

    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías de clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener usuarios sin categoría asignada
  const getUsersWithoutCategory = async () => {
    try {
      setLoading(true);

      // Obtener todos los perfiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        throw profilesError;
      }

      // Obtener usuarios que ya tienen categoría
      const { data: withCategories, error: categoriesError } = await supabase
        .from('client_categories')
        .select('user_id');

      if (categoriesError) {
        throw categoriesError;
      }

      const userIdsWithCategories = new Set(withCategories?.map(c => c.user_id) || []);
      
      // Filtrar usuarios sin categoría
      const usersWithoutCategory = profiles?.filter(
        profile => !userIdsWithCategories.has(profile.user_id)
      ) || [];

      return usersWithoutCategory;

    } catch (error: any) {
      console.error('Error getting users without category:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios sin categoría",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Remover categoría de un usuario
  const removeCategory = async (userId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('client_categories')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Categoría removida",
        description: "Se ha removido la categoría del cliente (volverá a ser Regular)",
      });

      // Recargar categorías
      await loadAllCategories();

    } catch (error: any) {
      console.error('Error removing category:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo remover la categoría",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDiscount = (category: ClientCategory): number => {
    const discounts = {
      regular: 0,
      premium: 10,
      corporativo: 20,
      mayorista: 30,
    };
    return discounts[category];
  };

  return {
    loading,
    categories,
    getUserCategory,
    assignCategory,
    loadAllCategories,
    getUsersWithoutCategory,
    removeCategory,
    getCategoryDiscount,
  };
}