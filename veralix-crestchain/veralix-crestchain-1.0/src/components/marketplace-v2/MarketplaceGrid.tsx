import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Listing {
  id: string;
  jewelry_item_id: string;
  price: number;
  currency: string;
  featured: boolean;
  average_rating: number | null;
  review_count: number | null;
  description?: string | null;
  likes: number;
  views: number;
  created_at: string;
  jewelry_item?: {
    name: string;
    type: string;
    main_image_url: string | null;
    image_urls?: string[] | null;
    user_id: string;
    images_count: number;
    materials?: string[] | null;
    description?: string | null;
    weight?: number | null;
    craftsman?: string | null;
  };
  seller_id: string;
  seller_full_name?: string | null;
}

interface MarketplaceGridProps {
  listings: Listing[];
  loading: boolean;
}

/**
 * Grid responsivo de productos
 * Simple y directo, sin complicaciones
 */
export const MarketplaceGrid = ({ listings, loading }: MarketplaceGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          No se encontraron productos
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => {
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
            description={listing.description || listing.jewelry_item?.description}
            materials={listing.jewelry_item?.materials}
            weight={listing.jewelry_item?.weight}
            likes={listing.likes}
            views={listing.views}
            createdAt={listing.created_at}
            craftsman={listing.jewelry_item?.craftsman}
            sellerName={listing.seller_full_name}
            sellerId={listing.seller_id}
          />
        );
      })}
    </div>
  );
};
