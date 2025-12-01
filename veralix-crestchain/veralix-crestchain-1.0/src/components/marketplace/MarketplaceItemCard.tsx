import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JewelryImage } from "@/components/jewelry/JewelryImage";
import { JewelryImageGallery } from "@/components/jewelry/JewelryImageGallery";
import { 
  Heart, 
  Share2, 
  Eye, 
  Star, 
  ShoppingCart, 
  Verified,
  MapPin,
  Calendar,
  Weight,
  Ruler
} from "lucide-react";
import { MarketplaceListing } from "@/hooks/useMarketplaceListings";
import { RatingStars } from "./RatingStars";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MarketplaceItemCardProps {
  item: MarketplaceListing;
  onLike?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
  onBuy?: (itemId: string) => void;
  className?: string;
}

export const MarketplaceItemCard = ({ 
  item, 
  onLike, 
  onShare, 
  onBuy,
  className = ""
}: MarketplaceItemCardProps) => {
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  const isItemFavorited = isFavorite(item.id);
  
  // Safety check: if jewelry_item is null, don't render the card
  if (!item.jewelry_item) {
    console.error('MarketplaceItemCard: jewelry_item is null for listing:', item.id);
    return null;
  }
  
  // Debug logging removed to prevent console spam
  
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getJewelryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'ring': 'Anillo',
      'necklace': 'Collar',
      'bracelet': 'Pulsera',
      'earrings': 'Aretes',
      'watch': 'Reloj',
      'pendant': 'Colgante'
    };
    return types[type] || type;
  };

  const getSellerDisplayName = () => {
    if (item.seller_name) return item.seller_name;
    return item.seller?.business_name || item.seller?.full_name || 'Vendedor';
  };

  const getSellerLocation = () => {
    if (item.seller_city) {
      return item.seller_country ? `${item.seller_city}, ${item.seller_country}` : item.seller_city;
    }
    return null;
  };

  const handleBuyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🛒 COMPRAR CLICKED - Opening WhatsApp for listing:', item.id);
    
    if (onBuy) {
      onBuy(item.id);
      return;
    }

    // Get seller's WhatsApp from profile
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("phone, business_name, full_name")
      .eq("user_id", item.seller_id)
      .single();

    if (!sellerProfile?.phone) {
      toast.error("Esta joyería no ha configurado su número de WhatsApp.");
      return;
    }

    // Format WhatsApp message
    const jewelryName = item.jewelry_item?.name || "producto";
    const price = formatPrice(item.price, item.currency);
    const sellerName = sellerProfile.business_name || sellerProfile.full_name || "la joyería";
    const message = `Hola ${sellerName}, estoy interesado en comprar: ${jewelryName} - Precio: ${price}`;
    
    // Open WhatsApp with message
    const whatsappUrl = `https://wa.me/${sellerProfile.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('❤️ FAVORITE CLICKED - Item ID:', item.id);
    
    await toggleFavorite(item.id);
    
    // Also call the onLike callback if provided
    if (onLike) {
      console.log('❤️ Calling onLike function...');
      onLike(item.id);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔗 SHARE CLICKED - Item ID:', item.id);
    
    if (onShare) {
      console.log('🔗 Calling onShare function...');
      onShare(item.id);
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden ${className}`}>
      <div className="relative">
        {item.featured && (
          <Badge className="absolute top-2 left-2 z-10 bg-gradient-gold text-background">
            <Star className="w-3 h-3 mr-1" />
            Destacado
          </Badge>
        )}
        
        <div className="aspect-square bg-muted/20 relative overflow-hidden rounded-t-lg">
          <JewelryImage
            jewelry={{
              id: item.jewelry_item_id,
              user_id: item.jewelry_item?.user_id || item.seller_id,
              name: item.jewelry_item?.name || 'Joya',
              main_image_url: item.jewelry_item?.main_image_url,
              images_count: item.jewelry_item?.images_count || 0
            }}
            size="card"
            onClick={() => setGalleryOpen(true)}
            className="w-full h-full"
          />
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90 h-10 w-10 sm:h-8 sm:w-8 p-0"
            onClick={handleLikeClick}
          >
            <Heart 
              className={`w-5 h-5 sm:w-4 sm:h-4 transition-colors ${isItemFavorited ? 'fill-red-500 text-red-500' : ''}`} 
            />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90 h-10 w-10 sm:h-8 sm:w-8 p-0"
            onClick={handleShareClick}
          >
            <Share2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
        </div>
        
        <div className="absolute bottom-2 right-2">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {getJewelryTypeLabel(item.jewelry_item.type)}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg line-clamp-2">{item.jewelry_item.name}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-xs sm:text-sm">
              <span className="truncate max-w-[150px] sm:max-w-none">{getSellerDisplayName()}</span>
              {getSellerLocation() && (
                <span className="text-xs hidden sm:inline">• {getSellerLocation()}</span>
              )}
              {item.certificate?.is_verified && (
                <Verified className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </CardDescription>
          </div>
          {item.certificate && (
            <Badge variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap self-start">
              {item.certificate.certificate_id.slice(0, 8)}...
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-bold">
              {formatPrice(item.price, item.currency)}
            </span>
            {item.review_count && item.review_count > 0 && (
              <div className="flex items-center gap-1">
                <RatingStars rating={item.average_rating || 0} size="sm" />
                <span className="text-xs text-muted-foreground">({item.review_count})</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(item.created_at)}</span>
          </div>
          
          {item.jewelry_item.origin && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{item.jewelry_item.origin}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {item.jewelry_item.materials.slice(0, 2).map((material, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {material}
              </Badge>
            ))}
            {item.jewelry_item.materials.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{item.jewelry_item.materials.length - 2}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 text-sm"
                  onClick={(e) => {
                    console.log('👀 Ver Detalles clicked for item:', item.id);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <span>{item.jewelry_item.name}</span>
                    {item.certificate?.is_verified && (
                      <Verified className="w-5 h-5 text-green-500" />
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {item.certificate && `Certificado: ${item.certificate.certificate_id} | `}
                    {getSellerDisplayName()}
                    {getSellerLocation() && ` • ${getSellerLocation()}`}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="aspect-square bg-muted/20 relative rounded-lg overflow-hidden">
                      <JewelryImage
                        jewelry={{
                          id: item.jewelry_item_id,
                          user_id: item.jewelry_item?.user_id || item.seller_id,
                          name: item.jewelry_item?.name || 'Joya',
                          main_image_url: item.jewelry_item?.main_image_url,
                          images_count: item.jewelry_item?.images_count || 0
                        }}
                        size="full"
                        onClick={() => setGalleryOpen(true)}
                        className="w-full h-full cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-foreground">
                        {formatPrice(item.price, item.currency)}
                      </span>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleLikeClick}
                        >
                          <Heart 
                            className={`w-4 h-4 transition-colors ${isItemFavorited ? 'fill-red-500 text-red-500' : ''}`}
                          />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleShareClick}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Descripción</h3>
                      <p className="text-muted-foreground">
                        {item.description || "Una hermosa pieza de joyería única."}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Especificaciones</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tipo:</span>
                          <span>{getJewelryTypeLabel(item.jewelry_item.type)}</span>
                        </div>
                        {item.jewelry_item.weight && (
                          <div className="flex justify-between">
                            <span>Peso:</span>
                            <span>{item.jewelry_item.weight}g</span>
                          </div>
                        )}
                        {item.jewelry_item.dimensions && (
                          <div className="flex justify-between">
                            <span>Dimensiones:</span>
                            <span>{item.jewelry_item.dimensions}</span>
                          </div>
                        )}
                        {item.jewelry_item.origin && (
                          <div className="flex justify-between">
                            <span>Origen:</span>
                            <span>{item.jewelry_item.origin}</span>
                          </div>
                        )}
                        {item.jewelry_item.craftsman && (
                          <div className="flex justify-between">
                            <span>Artesano:</span>
                            <span>{item.jewelry_item.craftsman}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Materiales</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.jewelry_item.materials.map((material, index) => (
                          <Badge key={index} variant="secondary">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Vendedor</h3>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={item.seller?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {getSellerDisplayName().charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getSellerDisplayName()}</p>
                          {getSellerLocation() && (
                            <p className="text-sm text-muted-foreground">{getSellerLocation()}</p>
                          )}
                          {item.average_rating && item.review_count ? (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-muted-foreground">
                                {item.average_rating.toFixed(1)} ({item.review_count} reseñas)
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    
                    {item.certificate && (
                      <div>
                        <h3 className="font-semibold mb-2">Certificación</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.certificate.is_verified ? "default" : "secondary"}>
                            {item.certificate.certificate_id}
                          </Badge>
                          {item.certificate.is_verified && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Verified className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        className="flex-1 bg-gradient-gold text-background hover:scale-105 transition-transform"
                        onClick={handleBuyClick}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Comprar Ahora
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Hacer Oferta
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              className="flex-1 bg-gradient-gold text-background hover:scale-105 transition-transform text-sm"
              onClick={handleBuyClick}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Comprar
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Image Gallery */}
      <JewelryImageGallery 
        jewelry={{
          id: item.jewelry_item_id,
          user_id: item.seller_id,
          name: item.jewelry_item?.name || 'Joya',
          main_image_url: item.jewelry_item?.main_image_url,
          image_urls: item.jewelry_item?.image_urls,
          images_count: item.jewelry_item?.images_count || 0
        }}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />
    </Card>
  );
};