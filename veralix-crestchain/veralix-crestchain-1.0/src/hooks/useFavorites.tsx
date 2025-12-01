import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

// Global debounce variables shared across all hook instances
let globalFavoritesPromise: Promise<string[]> | null = null;
let globalFavoritesLastFetch = 0;

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const now = Date.now();
    
    // If there's an ongoing fetch, reuse it
    if (globalFavoritesPromise) {
      console.log('Favorites: Waiting for existing fetch to complete');
      try {
        const result = await globalFavoritesPromise;
        setFavorites(result);
        setLoading(false);
      } catch (error) {
        console.error('Error waiting for favorites:', error);
        setLoading(false);
      }
      return;
    }
    
    // Global debounce of 2 seconds
    if (now - globalFavoritesLastFetch < 2000) {
      console.log('Favorites: Skipping duplicate call (global debounce)');
      setLoading(false);
      return;
    }

    try {
      globalFavoritesLastFetch = now;
      
      globalFavoritesPromise = (async () => {
        const { data, error } = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', user.id);

        if (error) throw error;
        return data?.map(f => f.listing_id) || [];
      })();

      const favoriteIds = await globalFavoritesPromise;
      setFavorites(favoriteIds);
      
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      // Toast removed to prevent spam
    } finally {
      setLoading(false);
      globalFavoritesPromise = null;
    }
  }, [user]);

  // Add to favorites
  const addToFavorites = useCallback(async (listingId: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          listing_id: listingId,
        });

      if (error) throw error;

      // Optimistic update
      setFavorites(prev => [...prev, listingId]);

      toast({
        title: "¡Agregado a favoritos!",
        description: "Puedes ver tus favoritos en tu perfil",
      });

      return true;
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      
      // Handle unique constraint violation (already favorited)
      if (error.code === '23505') {
        toast({
          title: "Ya está en favoritos",
          description: "Este artículo ya está guardado en tus favoritos",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar a favoritos",
          variant: "destructive",
        });
      }
      return false;
    }
  }, [user, toast]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (listingId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) throw error;

      // Optimistic update
      setFavorites(prev => prev.filter(id => id !== listingId));

      toast({
        title: "Eliminado de favoritos",
        description: "El artículo ha sido removido de tus favoritos",
      });

      return true;
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar de favoritos",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  // Toggle favorite (add or remove)
  const toggleFavorite = useCallback(async (listingId: string) => {
    if (favorites.includes(listingId)) {
      return await removeFromFavorites(listingId);
    } else {
      return await addToFavorites(listingId);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  // Check if a listing is favorited
  const isFavorite = useCallback((listingId: string) => {
    return favorites.includes(listingId);
  }, [favorites]);

  // Fetch favorites on mount - only when user changes
  useEffect(() => {
    fetchFavorites();
  }, [user?.id]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Favorites changed:', payload);
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFavorites]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
}
