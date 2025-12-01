import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceItemCard } from "@/components/marketplace/MarketplaceItemCard";
import { MarketplaceListing } from "@/hooks/useMarketplaceListings";

const Favorites = () => {
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteListings = async () => {
      if (favorites.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            jewelry_item:jewelry_items!jewelry_item_id (
              id,
              name,
              type,
              materials,
              weight,
              dimensions,
              origin,
              craftsman,
              images_count,
              user_id,
              main_image_url,
              image_urls,
              description
            )
          `)
          .in('id', favorites)
          .eq('status', 'active');

        if (error) throw error;

        // Fetch seller profiles and certificates for each listing
        const listingsWithDetails = await Promise.all(
          (data || [])
            .filter(listing => listing.jewelry_item !== null)
            .map(async (listing) => {
              const { data: sellerProfile } = await supabase
                .from('profiles')
                .select('full_name, business_name, avatar_url')
                .eq('user_id', listing.seller_id)
                .single();

              const { data: certificate } = await supabase
                .from('nft_certificates')
                .select('certificate_id, is_verified')
                .eq('jewelry_item_id', listing.jewelry_item_id)
                .single();

              return {
                ...listing,
                seller: sellerProfile || undefined,
                certificate: certificate || undefined,
              };
            })
        );

        setListings(listingsWithDetails as MarketplaceListing[]);
      } catch (error) {
        console.error('Error fetching favorite listings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteListings();
    }
  }, [favorites, favoritesLoading]);

  const isLoading = favoritesLoading || loading;
  const hasFavorites = listings.length > 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Favoritos</h1>
          <p className="text-muted-foreground">
            Guarda y organiza las joyas y listados que más te interesan
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !hasFavorites ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tienes favoritos aún</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Explora el marketplace y guarda las joyas que te gusten haciendo clic en el ícono de corazón
              </p>
              <div className="flex gap-4">
                <Link to="/marketplace">
                  <Button>
                    <Package className="h-4 w-4 mr-2" />
                    Explorar Marketplace
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <MarketplaceItemCard
                key={listing.id}
                item={listing}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Favorites;
