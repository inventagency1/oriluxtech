import { useEffect, useRef } from 'react';
import { useIsMobile } from './use-mobile';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const isMobile = useIsMobile();
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      
      if (diff > 80) {
        isPulling.current = false;
        onRefresh();
      }
    };

    const handleTouchEnd = () => {
      isPulling.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, onRefresh]);
}
