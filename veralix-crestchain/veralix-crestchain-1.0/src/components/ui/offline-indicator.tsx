import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OfflineIndicator - Shows network status and PWA cache info
 * Displays when user goes offline and marketplace is available from cache
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  useEffect(() => {
    const checkCacheAvailability = async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const hasMarketplaceCache = cacheNames.some(name => 
          name.includes('jewelry-images') || name.includes('marketplace')
        );
        setCacheStatus(hasMarketplaceCache ? 'available' : 'unavailable');
      } else {
        setCacheStatus('unavailable');
      }
    };

    checkCacheAvailability();

    const handleOnline = () => {
      console.log('🌐 [PWA] Connection restored');
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      console.log('📴 [PWA] Connection lost - using cached data');
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm",
        "transition-all duration-300 transform",
        showNotification ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        isOnline
          ? "bg-green-500/90 text-white"
          : "bg-amber-500/90 text-white"
      )}
    >
      <div className="flex items-center gap-3">
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <div className="text-sm font-medium">
              Conexión restaurada
            </div>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <div>
              <div className="text-sm font-medium">
                Sin conexión
              </div>
              {cacheStatus === 'available' && (
                <div className="text-xs opacity-90 mt-1">
                  Mostrando contenido guardado
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
