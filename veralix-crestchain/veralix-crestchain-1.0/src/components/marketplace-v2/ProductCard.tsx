import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProductImage } from './ProductImage';
import { ShoppingCart, Star, Heart, Eye, Gem, Weight, User, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateWhatsAppLink } from '@/utils/whatsappHelper';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  imageUrls?: string[] | null;
  category?: string;
  rating?: number | null;
  reviewCount?: number | null;
  featured?: boolean;
  description?: string | null;
  materials?: string[] | null;
  weight?: number | null;
  likes?: number;
  views?: number;
  createdAt?: string;
  craftsman?: string | null;
  sellerName?: string | null;
  sellerId?: string;
}

/**
 * Tarjeta de producto minimalista
 * Muestra imagen, nombre, precio y botón de compra
 * Click directo a checkout sin modales intermedios
 */
export const ProductCard = ({
  id,
  name,
  price,
  currency,
  imageUrl,
  imageUrls,
  category,
  rating,
  reviewCount,
  featured,
  description,
  materials,
  weight,
  likes = 0,
  views = 0,
  createdAt,
  craftsman,
  sellerName,
  sellerId
}: ProductCardProps) => {
  const navigate = useNavigate();
  
  // Check if product is new (less than 7 days old)
  const isNew = createdAt ? 
    new Date().getTime() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 
    : false;

  const handleBuyClick = async (e: React.MouseEvent) => {
    console.log('🛒 Click en botón Comprar - Redirigiendo a WhatsApp', { id, listingId: id });
    e.preventDefault();
    e.stopPropagation();
    
    if (!sellerId) {
      toast.error('No se pudo obtener la información del vendedor');
      return;
    }

    try {
      // Obtener el perfil del vendedor
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone, business_name, full_name, city, country')
        .eq('user_id', sellerId)
        .single();

      if (profileError || !profile?.phone) {
        toast.error('El vendedor no tiene un número de WhatsApp registrado');
        return;
      }

      // Generar enlace de WhatsApp con formato correcto
      const whatsappUrl = generateWhatsAppLink(
        profile.phone,
        profile.country
      );

      // Redirigir directamente a WhatsApp
      console.log('📱 Abriendo WhatsApp:', { 
        phone: profile.phone, 
        country: profile.country,
        url: whatsappUrl 
      });
      
      window.open(whatsappUrl, '_blank');
      toast.success('Abriendo WhatsApp del vendedor...');
      
    } catch (error) {
      console.error('Error al contactar vendedor:', error);
      toast.error('Error al contactar al vendedor');
    }
  };

  const handleCardClick = () => {
    console.log('🔍 Click en Card para ver detalles', { id });
    navigate(`/marketplace/${id}`);
  };

  return (
    <>
      <Card 
        className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-muted/10">
          {/* Badges superiores */}
          <div className="absolute top-2 left-2 z-10 flex gap-2">
            {featured && (
              <Badge className="bg-primary shadow-lg">
                Destacado
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-accent shadow-lg">
                Nuevo
              </Badge>
            )}
          </div>
          
          {/* Botón de favorito */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implementar favoritos
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
          
          <ProductImage 
            src={imageUrl}
            alt={name}
          />
        </div>

        {/* Info */}
        <div className="p-3 md:p-4 space-y-3">
          {/* Categoría y Rating */}
          <div className="flex items-center justify-between gap-2">
            {category && (
              <Badge variant="outline" className="text-xs">
                <Package className="w-3 h-3 mr-1" />
                {category}
              </Badge>
            )}
            
            {rating && rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating.toFixed(1)}</span>
                {reviewCount !== null && reviewCount !== undefined && (
                  <span>({reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Título */}
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
            {name}
          </h3>

          {/* Materiales y peso */}
          {(materials || weight) && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {materials && materials.length > 0 && (
                <div className="flex items-center gap-1">
                  <Gem className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{materials.join(', ')}</span>
                </div>
              )}
              {weight && (
                <div className="flex items-center gap-1">
                  <Weight className="w-3 h-3 flex-shrink-0" />
                  <span>{weight}g</span>
                </div>
              )}
            </div>
          )}

          {/* Artesano/Vendedor */}
          {(craftsman || sellerName) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{craftsman || sellerName}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Precio y botones */}
        <div className="p-3 md:p-4 space-y-3">
          {/* Precio y estadísticas */}
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-base md:text-lg font-bold text-foreground">
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: currency || 'COP',
                minimumFractionDigits: 0
              }).format(price)}
            </p>
            
            {/* Stats al lado del precio */}
            {(views > 0 || likes > 0) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {views > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{views}</span>
                  </div>
                )}
                {likes > 0 && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{likes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Botones */}
          <div className="flex gap-2">
            <Button 
              type="button"
              onClick={handleBuyClick}
              className="flex-1 shadow-sm hover:shadow-md transition-shadow"
              size="default"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Comprar
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCardClick();
              }}
              className="shrink-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
