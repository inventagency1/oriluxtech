import { useState, useEffect, useRef } from 'react';

interface UseImageLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
}

/**
 * Hook para lazy loading inteligente de imágenes usando Intersection Observer
 * Pre-carga imágenes antes de que entren al viewport para mejor UX
 */
export const useImageLazyLoad = (options: UseImageLazyLoadOptions = {}) => {
  const {
    rootMargin = '150px', // Pre-cargar 150px antes del viewport
    threshold = 0.01 // Detectar cuando 1% es visible
  } = options;

  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = imgRef.current;
    if (!currentRef) return;

    // Si ya está en vista, no crear observer
    if (isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Auto-desconectar después de primera carga
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isInView, rootMargin, threshold]);

  return { imgRef, isInView };
};
