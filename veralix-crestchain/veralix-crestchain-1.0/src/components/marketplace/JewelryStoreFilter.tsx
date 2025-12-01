import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface JewelryStore {
  user_id: string;
  full_name: string | null;
  business_name: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  listings_count: number;
}

interface JewelryStoreFilterProps {
  onSelectStore: (storeId: string | null) => void;
  selectedStoreId: string | null;
}

export function JewelryStoreFilter({ onSelectStore, selectedStoreId }: JewelryStoreFilterProps) {
  const [stores, setStores] = useState<JewelryStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      // Obtener joyerías con listings activos
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          seller_id,
          profiles!marketplace_listings_seller_id_fkey (
            user_id,
            full_name,
            business_name,
            avatar_url,
            city,
            country,
            description
          )
        `)
        .eq('status', 'active');

      if (error) throw error;

      // Agrupar por seller_id y contar listings
      const storeMap = new Map<string, JewelryStore>();
      
      data?.forEach((item: any) => {
        const profile = item.profiles;
        if (!profile) return;

        if (storeMap.has(profile.user_id)) {
          const store = storeMap.get(profile.user_id)!;
          store.listings_count++;
        } else {
          storeMap.set(profile.user_id, {
            user_id: profile.user_id,
            full_name: profile.full_name,
            business_name: profile.business_name,
            avatar_url: profile.avatar_url,
            city: profile.city,
            country: profile.country,
            description: profile.description,
            listings_count: 1
          });
        }
      });

      setStores(Array.from(storeMap.values()).sort((a, b) => 
        b.listings_count - a.listings_count
      ));
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg mb-4">Filtrar por Joyería</h3>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Filtrar por Joyería</h3>
      
      {/* Opción "Todas" */}
      <Card 
        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
          selectedStoreId === null ? 'border-primary ring-2 ring-primary/20' : ''
        }`}
        onClick={() => onSelectStore(null)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold">Todas las Joyerías</p>
            <p className="text-sm text-muted-foreground">
              {stores.reduce((acc, s) => acc + s.listings_count, 0)} productos
            </p>
          </div>
        </div>
      </Card>

      {stores.map((store) => (
        <Card
          key={store.user_id}
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedStoreId === store.user_id ? 'border-primary ring-2 ring-primary/20' : ''
          }`}
          onClick={() => onSelectStore(store.user_id)}
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={store.avatar_url || ''} />
                <AvatarFallback>
                  <Building className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {store.business_name || store.full_name || 'Joyería'}
                </p>
                {store.city && store.country && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {store.city}, {store.country}
                  </p>
                )}
                <Badge variant="secondary" className="mt-1">
                  {store.listings_count} {store.listings_count === 1 ? 'producto' : 'productos'}
                </Badge>
              </div>
            </div>
            {store.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {store.description}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
