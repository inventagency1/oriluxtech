import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { ArrowLeft, ShoppingCart, Shield, Award, Share2 } from "lucide-react";
import { JewelryImageGallery } from "@/components/jewelry/JewelryImageGallery";
import { RatingStars } from "@/components/marketplace/RatingStars";
import { ReviewList } from "@/components/marketplace/ReviewList";
import { ReviewForm } from "@/components/marketplace/ReviewForm";
import { SimilarProducts } from "@/components/marketplace/SimilarProducts";
import { useReviews } from "@/hooks/useReviews";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useToast } from "@/hooks/use-toast";
import { MarketplaceListing } from "@/hooks/useMarketplaceListings";
import { useSEO } from "@/utils/seoHelpers";
import type { AsyncResult } from "@/types";

export default function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackView } = useRecentlyViewed();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userOrderId, setUserOrderId] = useState<string | null>(null);

  const {
    reviews,
    stats,
    loading: reviewsLoading,
    canReview,
    createReview,
    addSellerResponse,
  } = useReviews(listingId);

  const [isSeller, setIsSeller] = useState(false);

  useSEO({
    title: listing ? `${listing.jewelry_item?.name} - Marketplace Veralix` : "Producto - Marketplace",
    description: listing?.description || "Descubre joyas certificadas con NFT en el marketplace de Veralix",
  });

  useEffect(() => {
    if (listingId) {
      fetchListing();
      checkUserRole();
      trackView(listingId);
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select(`
          *,
          jewelry_item:jewelry_items(*)
        `)
        .eq("id", listingId!)
        .single();

      if (error) throw error;

      // Fetch seller profile separately
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("full_name, business_name, avatar_url")
        .eq("user_id", data.seller_id)
        .single();

      // Fetch certificate if exists
      let certificate = undefined;
      if (data.jewelry_item_id) {
        const { data: certData } = await supabase
          .from("nft_certificates")
          .select("certificate_id, is_verified")
          .eq("jewelry_item_id", data.jewelry_item_id)
          .maybeSingle();
        
        certificate = certData || undefined;
      }

      const listingWithSeller = {
        ...data,
        seller: sellerProfile || { full_name: "Vendedor", business_name: null, avatar_url: null },
        certificate,
      } as MarketplaceListing;

      setListing(listingWithSeller);

      // Check if user has an order for this listing
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: orders } = await supabase
          .from("orders")
          .select("id")
          .eq("marketplace_listing_id", listingId!)
          .eq("buyer_id", user.id)
          .eq("order_status", "completed")
          .maybeSingle();

        if (orders) {
          setUserOrderId(orders.id);
        }
      }
    } catch (error: any) {
      console.error("Error fetching listing:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("marketplace_listings")
      .select("seller_id")
      .eq("id", listingId!)
      .single();

    setIsSeller(data?.seller_id === user.id);
  };

  const handlePurchase = async () => {
    // Get seller's WhatsApp from profile
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("phone, business_name, full_name")
      .eq("user_id", listing?.seller_id)
      .single();

    if (!sellerProfile?.phone) {
      toast({
        title: "Contacto no disponible",
        description: "Esta joyería no ha configurado su número de WhatsApp.",
        variant: "destructive",
      });
      return;
    }

    // Format WhatsApp message
    const jewelryName = listing?.jewelry_item?.name || "producto";
    const price = `${listing?.price.toLocaleString()} ${listing?.currency}`;
    const sellerName = sellerProfile.business_name || sellerProfile.full_name || "la joyería";
    const message = `Hola ${sellerName}, estoy interesado en comprar: ${jewelryName} - Precio: ${price}`;
    
    // Open WhatsApp with message
    const whatsappUrl = `https://wa.me/${sellerProfile.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.jewelry_item?.name || 'Joya en Veralix',
          text: listing?.description || 'Mira esta hermosa joya en Veralix',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copiado al portapapeles" });
      } catch (error) {
        toast({ title: "Error al copiar el link", variant: "destructive" });
      }
    }
  };

  const handleReviewSubmit = async (data: any): Promise<AsyncResult> => {
    if (!userOrderId) {
      toast({
        title: "Error",
        description: "No se encontró una orden completada",
        variant: "destructive",
      });
      return { success: false, error: "No se encontró una orden completada" };
    }

    const result = await createReview({ ...data, order_id: userOrderId });
    
    if (result.data) {
      setShowReviewForm(false);
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Producto no encontrado</p>
      </div>
    );
  }

  const sellerName = listing.seller?.business_name || listing.seller?.full_name || "Vendedor";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/marketplace">Marketplace</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{listing.jewelry_item?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/marketplace")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al marketplace
        </Button>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {listing.jewelry_item && (
              <div className="space-y-2">
                <img
                  src={listing.jewelry_item.main_image_url || "/placeholder.svg"}
                  alt={listing.jewelry_item.name}
                  className="w-full h-auto rounded-lg"
                />
                {listing.jewelry_item.image_urls && listing.jewelry_item.image_urls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {listing.jewelry_item.image_urls.slice(0, 4).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${listing.jewelry_item?.name} ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{listing.jewelry_item?.name}</h1>
              <div className="flex items-center gap-4 mb-4">
              <RatingStars rating={listing.average_rating || 0} size="md" />
                <span className="text-sm text-muted-foreground">
                  ({listing.review_count || 0} {listing.review_count === 1 ? "reseña" : "reseñas"})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-primary">
                  ${listing.price.toLocaleString()} {listing.currency}
                </div>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                {listing.jewelry_item?.type}
              </Badge>
              {listing.certificate && (
                <Badge variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  Certificado NFT
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description || listing.jewelry_item?.description}
              </p>
            </div>

            {/* Specifications */}
            {listing.jewelry_item && (
              <div>
                <h3 className="font-semibold mb-3">Especificaciones</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {listing.jewelry_item.weight && (
                    <div>
                      <span className="text-muted-foreground">Peso:</span>
                      <span className="ml-2 font-medium">{listing.jewelry_item.weight}g</span>
                    </div>
                  )}
                  {listing.jewelry_item.materials && listing.jewelry_item.materials.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Materiales:</span>
                      <span className="ml-2 font-medium">{listing.jewelry_item.materials.join(", ")}</span>
                    </div>
                  )}
                  {listing.jewelry_item.dimensions && (
                    <div>
                      <span className="text-muted-foreground">Dimensiones:</span>
                      <span className="ml-2 font-medium">{listing.jewelry_item.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Seller Info */}
            <div>
              <h3 className="font-semibold mb-2">Vendedor</h3>
              <p className="text-muted-foreground">{sellerName}</p>
            </div>

            {/* Purchase Button */}
            {!isSeller && (
              <Button size="lg" className="w-full gap-2" onClick={handlePurchase}>
                <ShoppingCart className="h-5 w-5" />
                Comprar ahora
              </Button>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Reviews Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Reseñas y opiniones</h2>

          {/* Review Form */}
          {canReview && userOrderId && showReviewForm && (
            <ReviewForm
              listingId={listingId!}
              orderId={userOrderId}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          )}

          {/* Reviews List */}
          <ReviewList
            reviews={reviews}
            stats={stats}
            loading={reviewsLoading}
            canRespond={isSeller}
            onRespond={addSellerResponse}
            onWriteReview={() => setShowReviewForm(true)}
            showWriteButton={canReview && !showReviewForm}
          />
        </div>

        <Separator className="my-8" />

        {/* Similar Products Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">También te puede interesar</h2>
          <SimilarProducts listingId={listingId!} />
        </div>
      </div>
    </div>
  );
}
