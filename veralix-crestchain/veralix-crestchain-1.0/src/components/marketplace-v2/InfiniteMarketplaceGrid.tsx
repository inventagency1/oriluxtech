import { useEffect, useRef } from 'react';
import { useInfiniteMarketplace } from '@/hooks/useInfiniteMarketplace';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import type { MarketplaceListing } from '@/hooks/useOptimizedMarketplaceListings';

/**
 * Grid con infinite scroll optimizado
 * - Carga inicial: solo 20 items
 * - Auto-carga al hacer scroll (200px antes del final)
 * - Loading states fluidos
 * - Performance óptimo en mobile
 */
export const InfiniteMarketplaceGrid = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteMarketplace();
  
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer para detectar scroll
  useEffect(() => {
    if (isLoading) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' } // Pre-carga 200px antes
    );
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => observerRef.current?.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);
  
  // Flatten all pages into a single array
  const allListings: MarketplaceListing[] = data?.pages 
    ? data.pages.flatMap(page => page.listings) 
    : [];
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-destructive">
          Error al cargar productos
        </p>
      </div>
    );
  }
  
  if (allListings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          No se encontraron productos
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allListings.map((listing) => {
          // Construir URL de imagen principal
          const imageUrl = listing.jewelry_item?.main_image_url || 
            (listing.jewelry_item?.images_count && listing.jewelry_item.images_count > 0
              ? `https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/${listing.jewelry_item.user_id}/${listing.jewelry_item_id}/main.jpg`
              : null);

          // Construir array de URLs de imágenes si están disponibles
          const imageUrls = listing.jewelry_item?.image_urls || null;

          return (
            <ProductCard
              key={listing.id}
              id={listing.id}
              name={listing.jewelry_item?.name || 'Producto sin nombre'}
              price={listing.price}
              currency={listing.currency}
              imageUrl={imageUrl}
              imageUrls={imageUrls}
              category={listing.jewelry_item?.type}
              rating={listing.average_rating}
              reviewCount={listing.review_count}
              featured={listing.featured}
              description={listing.description}
              materials={listing.jewelry_item?.materials}
              weight={listing.jewelry_item?.weight}
              likes={listing.likes}
              views={listing.views}
              createdAt={listing.created_at}
              craftsman={listing.jewelry_item?.craftsman}
              sellerName={listing.seller?.full_name || listing.seller_name}
              sellerId={listing.seller_id}
            />
          );
        })}
      </div>
      
      {/* Trigger para infinite scroll */}
      <div ref={loadMoreRef} className="py-8 text-center">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
            <span className="text-muted-foreground">Cargando más productos...</span>
          </div>
        )}
        {!hasNextPage && allListings.length > 0 && (
          <p className="text-muted-foreground">
            Has visto todos los productos disponibles
          </p>
        )}
      </div>
    </div>
  );
};
