import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketplaceItemCard } from './MarketplaceItemCard';
import { Skeleton } from '@/components/ui/skeleton';

interface SimilarProductsProps {
  listingId: string;
}

export const SimilarProducts = ({ listingId }: SimilarProductsProps) => {
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarListings = async () => {
      try {
        const { data, error } = await supabase.rpc('find_similar_listings', {
          target_listing_id: listingId,
          limit_count: 4
        });

        if (error) throw error;

        // Fetch additional data for each listing
        const listingsWithData = await Promise.all(
          (data || []).map(async (listing) => {
            const [jewelryData, sellerData] = await Promise.all([
              supabase
                .from('jewelry_items')
                .select('*')
                .eq('id', listing.jewelry_item_id)
                .single(),
              supabase
                .from('profiles')
                .select('full_name, business_name')
                .eq('user_id', listing.seller_id)
                .single()
            ]);

            return {
              ...listing,
              jewelry_item: jewelryData.data,
              seller: sellerData.data
            };
          })
        );

        setSimilarListings(listingsWithData);
      } catch (error) {
        console.error('Error fetching similar listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarListings();
  }, [listingId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Similares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarListings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Similares</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {similarListings.map((listing) => (
            <MarketplaceItemCard
              key={listing.id}
              item={listing}
              onLike={() => {}}
              onShare={() => {}}
              onBuy={() => {}}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
