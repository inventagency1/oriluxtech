import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Database } from 'lucide-react';
import { MarketplaceItemCard } from '@/components/marketplace/MarketplaceItemCard';

/**
 * OfflineMarketplace - Shows cached marketplace data when offline
 * Allows users to browse previously loaded jewelry items from cache
 */
export default function OfflineMarketplace() {
  const [cachedListings, setCachedListings] = useState<any[]>([]);
  const [cacheInfo, setCacheInfo] = useState<{ size: number; count: number }>({ size: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = async () => {
    setLoading(true);
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const marketplaceCache = cacheNames.find(name => name.includes('marketplace-api'));
        
        if (marketplaceCache) {
          const cache = await caches.open(marketplaceCache);
          const requests = await cache.keys();
          
          // Get cached listings
          const listings = [];
          let totalSize = 0;
          
          for (const request of requests) {
            if (request.url.includes('marketplace_listings')) {
              const response = await cache.match(request);
              if (response) {
                const data = await response.json();
                listings.push(...(Array.isArray(data) ? data : [data]));
                
                // Estimate size
                const blob = await response.blob();
                totalSize += blob.size;
              }
            }
          }
          
          setCachedListings(listings);
          setCacheInfo({
            count: listings.length,
            size: totalSize
          });
        }
      }
    } catch (error) {
      console.error('❌ [PWA] Failed to load cached data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Offline Status Banner */}
        <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-700 dark:text-amber-500">
              <WifiOff className="w-6 h-6" />
              Modo Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No hay conexión a internet. Mostrando contenido guardado en tu dispositivo.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>{cacheInfo.count} productos en caché</span>
              </div>
              <div className="text-muted-foreground">
                {formatBytes(cacheInfo.size)}
              </div>
            </div>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              className="mt-4"
              disabled={!navigator.onLine}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar conexión
            </Button>
          </CardContent>
        </Card>

        {/* Cached Marketplace Items */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Cargando contenido guardado...</p>
          </div>
        ) : cachedListings.length > 0 ? (
          <>
            <h1 className="text-2xl font-bold mb-6">Marketplace (Caché Local)</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cachedListings.slice(0, 12).map((listing) => (
                <MarketplaceItemCard
                  key={listing.id}
                  item={listing}
                  onLike={() => {}}
                  onShare={() => {}}
                  onBuy={() => {}}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <WifiOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sin contenido en caché</h2>
            <p className="text-muted-foreground mb-6">
              Necesitas conexión para ver el marketplace por primera vez
            </p>
            <Button onClick={handleRetry} disabled={!navigator.onLine}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar conexión
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
