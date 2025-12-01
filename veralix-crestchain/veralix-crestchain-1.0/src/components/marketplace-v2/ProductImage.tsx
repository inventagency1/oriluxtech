import { useState } from 'react';
import { Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageLazyLoad } from '@/hooks/useImageLazyLoad';

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Componente súper simple para mostrar imágenes de productos
 * Sin overlays, sin filtros complejos, sin hooks intermedios
 */
export const ProductImage = ({ src, alt, className, onClick }: ProductImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Lazy loading con pre-carga anticipada
  const { imgRef, isInView } = useImageLazyLoad({
    rootMargin: '200px',
    threshold: 0.01
  });

  // Si no hay imagen o falló la carga, mostrar fallback
  if (!src || hasError) {
    return (
      <div 
        className={cn(
          "w-full h-full bg-muted/30 flex items-center justify-center",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <Gem className="w-12 h-12 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={cn("relative w-full h-full", className)}
    >
      {isLoading && isInView && (
        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
      )}
      
      {isInView ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority="auto"
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            isLoading && "opacity-0",
            onClick && "cursor-pointer hover:scale-105"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onClick={onClick}
        />
      ) : (
        <div className="absolute inset-0 bg-muted/20" />
      )}
    </div>
  );
};
