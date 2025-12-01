import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JewelryImageGalleryProps {
  jewelry: {
    id: string;
    user_id: string;
    name: string;
    main_image_url?: string | null;
    image_urls?: string[] | null;
    images_count: number;
  };
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JewelryImageGallery({
  jewelry,
  initialIndex = 0,
  open,
  onOpenChange
}: JewelryImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  // Get all jewelry images - prioritize DB URLs
  const images = useMemo(() => {
    const imageList: string[] = [];
    
    // Use image_urls from DB if available
    if (jewelry.image_urls && jewelry.image_urls.length > 0) {
      imageList.push(...jewelry.image_urls);
    } 
    // Fallback: use main_image_url if available
    else if (jewelry.main_image_url) {
      imageList.push(jewelry.main_image_url);
    }
    // Last resort: construct URL
    else if (jewelry.images_count > 0) {
      const baseUrl = `https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/${jewelry.user_id}/${jewelry.id}`;
      imageList.push(`${baseUrl}/main.jpg`);
    }
    
    return imageList;
  }, [jewelry.id, jewelry.image_urls, jewelry.main_image_url]);

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${jewelry.name}-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="font-semibold">{jewelry.name}</h3>
                <p className="text-sm text-white/70">
                  {currentIndex + 1} de {images.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <img
              src={currentImage}
              alt={`${jewelry.name} - Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{ transform: `scale(${zoom})` }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex gap-2 justify-center overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setZoom(1);
                    }}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      idx === currentIndex
                        ? "border-primary scale-110"
                        : "border-white/30 hover:border-white/60"
                    )}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
