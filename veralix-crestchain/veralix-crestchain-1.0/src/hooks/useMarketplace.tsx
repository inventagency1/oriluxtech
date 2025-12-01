import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook simplificado para marketplace
 * Fetching directo con React Query, sin complicaciones
 */
export const useMarketplace = () => {
  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async () => {
      console.log('🔄 Fetching marketplace listings...');
      
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          jewelry_item:jewelry_items (
            id,
            name,
            type,
            main_image_url,
            images_count,
            user_id,
            materials,
            description,
            weight,
            craftsman
          )
        `)
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching listings:', error);
        throw error;
      }

      console.log('✅ Fetched listings:', data?.length || 0);
      
      // Fetch seller profiles separately to avoid FK issues
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map(listing => listing.seller_id))];
        const { data: sellers, error: sellersError } = await supabase
          .from('profiles')
          .select('user_id, full_name, business_name, avatar_url, city, country, phone, email')
          .in('user_id', sellerIds);
        
        if (!sellersError && sellers) {
          // Attach seller data to each listing
          const enrichedData = data.map(listing => ({
            ...listing,
            seller: sellers.find(s => s.user_id === listing.seller_id) || null
          }));
          
          console.log('✅ Enriched with seller data');
          return enrichedData;
        }
      }
      
      // Log para debug de imágenes
      data?.forEach((listing) => {
        console.log('📦 Listing:', {
          id: listing.id,
          name: listing.jewelry_item?.name,
          main_image_url: listing.jewelry_item?.main_image_url,
          images_count: listing.jewelry_item?.images_count,
          user_id: listing.jewelry_item?.user_id
        });
      });

      return data || [];
    },
    staleTime: 30 * 1000, // 30 segundos de cache
  });

  return {
    listings,
    loading: isLoading,
    error,
    refetch
  };
};
