import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceListing {
  id: string;
  jewelry_item_id: string;
  seller_id?: string; // Made optional since marketplace_public_listings doesn't expose it
  price: number;
  currency: string;
  description: string;
  status: 'active' | 'sold' | 'inactive';
  featured: boolean;
  views: number;
  likes: number;
  average_rating: number | null;
  review_count: number | null;
  created_at: string;
  updated_at: string;
  // Public view fields
  seller_name?: string;
  seller_city?: string;
  seller_country?: string;
  jewelry_item: {
    id: string;
    name: string;
    type: string;
    materials: string[] | null;
    weight: number | null;
    dimensions: string | null;
    origin: string | null;
    craftsman: string | null;
    images_count: number;
    user_id: string;
    main_image_url: string | null;
    image_urls: string[] | null;
  };
  seller?: {
    full_name: string | null;
    business_name: string | null;
    avatar_url: string | null;
    city: string | null;
    country: string | null;
  };
  certificate?: {
    certificate_id: string;
    is_verified: boolean | null;
  };
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult {
  listings: MarketplaceListing[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

/**
 * Hook optimizado para cargar listings del marketplace
 * Usa React Query para:
 * - Eliminar N+1 queries (1 query con JOINs en lugar de múltiples)
 * - Cache automático (30s)
 * - Deduplicación de requests
 * - Referencias estables que previenen re-renders infinitos
 * - Paginación server-side para cargar solo lo necesario
 */
export const useOptimizedMarketplaceListings = (options?: PaginationOptions) => {
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  
  return useQuery<PaginatedResult>({
    queryKey: ['marketplace-listings', page, pageSize],
    queryFn: async () => {
      const startIndex = (page - 1) * pageSize;
      
      // ✅ UNA SOLA QUERY con paginación server-side
      const { data, error, count } = await supabase
        .from('marketplace_listings_complete')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + pageSize - 1);

      if (error) throw error;

      // ✅ Mapear datos de la vista al formato esperado
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
      const totalPages = Math.ceil(totalCount / pageSize);
      
      return {
        listings,
        totalCount,
        hasMore: totalCount > startIndex + pageSize,
        currentPage: page,
        totalPages,
      };
    },
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 300000, // Guardar en memoria por 5 minutos
    refetchOnWindowFocus: false, // No refetch cuando el usuario vuelve a la pestaña
  });
};
