import { useState, useEffect } from 'react';
import { Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useJewelryImage } from '@/hooks/useJewelryImage';
import { useImageLazyLoad } from '@/hooks/useImageLazyLoad';

interface JewelryImageProps {
  jewelry: {
    id: string;
    user_id: string;
    name: string;
    main_image_url?: string | null;
    images_count: number;
  };
  size?: 'thumbnail' | 'card' | 'full';
  className?: string;
  onClick?: () => void;
}

export function JewelryImage({ 
  jewelry, 
  size = 'card', 
  className,
  onClick
}: JewelryImageProps) {
  const { imageUrl } = useJewelryImage(jewelry);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Lazy loading con pre-carga anticipada
  const { imgRef, isInView } = useImageLazyLoad({
    rootMargin: '200px', // Pre-cargar 200px antes
    threshold: 0.01
  });
  
  // Cards y thumbnails siempre se cargan (above the fold)
  // Full size usa lazy loading
  const shouldLoad = size === 'card' || size === 'thumbnail' || isInView;

  // Reset loading state cuando cambia la URL
  useEffect(() => {
    if (imageUrl) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [imageUrl]);

  const sizeClasses = {
    thumbnail: 'w-12 h-12',
    card: 'w-full h-full',
    full: 'w-full h-full'
  };

  // Fallback UI cuando no hay imagen
  if (!imageUrl || hasError) {
    return (
      <div 
        className={cn(
          "bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-lg",
          sizeClasses[size],
          className
        )}
      >
        <Gem className={cn(
          "text-primary/40",
          size === 'thumbnail' ? 'w-5 h-5' : 'w-12 h-12'
        )} />
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={cn("relative w-full h-full overflow-hidden veralix-photo-overlay", className)}
    >
      {isLoading && shouldLoad && (
        <Skeleton className="absolute inset-0 rounded-lg" />
      )}
      
      {shouldLoad ? (
        <img
          src={imageUrl}
          alt={jewelry.name}
          loading={size === 'thumbnail' ? 'lazy' : 'eager'}
          decoding="async"
          fetchPriority={size === 'card' ? 'high' : 'auto'}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300 veralix-photo-filter",
            isLoading && 'opacity-0',
            onClick && 'cursor-pointer hover:scale-105 transition-transform'
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onClick={onClick}
        />
      ) : (
        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
      )}
    </div>
  );
}
