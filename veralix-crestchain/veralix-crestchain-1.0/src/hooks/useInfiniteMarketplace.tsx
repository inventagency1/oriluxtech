import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceListing } from './useOptimizedMarketplaceListings';

const PAGE_SIZE = 20;

interface InfinitePageResult {
  listings: MarketplaceListing[];
  nextCursor: number | undefined;
  hasMore: boolean;
}

/**
 * Hook optimizado para infinite scroll en el marketplace
 * Usa React Query's useInfiniteQuery para:
 * - Cargar datos bajo demanda (20 items por página)
 * - Cache automático de todas las páginas
 * - Scroll infinito fluido sin clicks
 * - Reducción dramática en transferencia de datos inicial
 */
export const useInfiniteMarketplace = () => {
  return useInfiniteQuery({
    queryKey: ['marketplace-infinite'],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, error, count } = await supabase
        .from('marketplace_listings_complete')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);
      
      if (error) throw error;
      
      // Mapear datos de la vista al formato esperado
      const listings = (data || []).map(item => ({
        id: item.id,
        jewelry_item_id: item.jewelry_item_id,
        seller_id: item.seller_id,
        price: item.price,
        currency: item.currency,
        description: item.description,
        status: item.status as 'active' | 'sold' | 'inactive',
        featured: item.featured,
        views: item.views,
        likes: item.likes,
        average_rating: item.average_rating,
        review_count: item.review_count,
        created_at: item.created_at,
        updated_at: item.updated_at,
        seller_name: item.seller_full_name,
        seller_city: item.seller_city,
        seller_country: item.seller_country,
        jewelry_item: {
          id: item.jewelry_item_id,
          name: item.jewelry_name,
          type: item.jewelry_type,
          materials: item.jewelry_materials,
          weight: item.jewelry_weight,
          dimensions: item.jewelry_dimensions,
          origin: item.jewelry_origin,
          craftsman: item.jewelry_craftsman,
          images_count: item.jewelry_images_count,
          user_id: item.jewelry_user_id,
          main_image_url: item.jewelry_main_image_url,
          image_urls: item.jewelry_image_urls,
        },
        seller: {
          full_name: item.seller_full_name,
          business_name: item.seller_business_name,
          avatar_url: item.seller_avatar_url,
          city: item.seller_city,
          country: item.seller_country,
        },
        certificate: item.certificate_id ? {
          certificate_id: item.certificate_id,
          is_verified: item.certificate_is_verified,
        } : undefined,
      })) as MarketplaceListing[];
      
      const totalCount = count || 0;
      const nextCursor = totalCount > pageParam + PAGE_SIZE 
        ? pageParam + PAGE_SIZE 
        : undefined;
      
      return {
        listings,
        nextCursor,
        hasMore: nextCursor !== undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30000,
    gcTime: 300000,
    initialPageParam: 0,
  });
};
