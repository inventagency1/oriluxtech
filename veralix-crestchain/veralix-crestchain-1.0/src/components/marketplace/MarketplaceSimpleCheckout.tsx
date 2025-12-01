import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWompiWidget } from "@/hooks/useWompiWidget";
import { useWompiDirectPayment } from "@/hooks/useWompiDirectPayment";
import { Loader2, CreditCard, ArrowLeft, Package, Shield } from "lucide-react";

interface MarketplaceSimpleCheckoutProps {
  listing: any;
  onBack: () => void;
}

export function MarketplaceSimpleCheckout({ listing, onBack }: MarketplaceSimpleCheckoutProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { openCheckout } = useWompiWidget();
  const { createPaymentLink, redirectToPayment, loading: directPaymentLoading } = useWompiDirectPayment();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'direct' | 'widget'>('direct');
  
  const WOMPI_PUBLIC_KEY = "pub_prod_XHaKFhY9SF4YB3GSxBhm7olkCxr7aiOQ";

  const handleDirectPayment = async () => {
    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para comprar",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Generar orderId único
      const orderNumber = `MKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear orden en base de datos
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: listing.seller_id,
          marketplace_listing_id: listing.id,
          order_number: orderNumber,
          total_amount: listing.price,
          currency: listing.currency || 'COP',
          payment_status: 'pending',
          order_status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('No se pudo crear la orden');
      }

      // Crear pending_payment
      const amountInCents = Math.round(listing.price * 100);
      
      const { error: pendingError } = await supabase
        .from('pending_payments')
        .insert({
          user_id: user.id,
          order_id: orderNumber,
          amount: amountInCents,
          currency: listing.currency || 'COP',
          payment_type: 'marketplace_order',
          metadata: {
            listing_id: listing.id,
            order_db_id: newOrder.id,
            listing_name: listing.jewelry_item?.name || 'Producto',
            payment_method: 'direct_api'
          }
        });

      if (pendingError) {
        console.error('Error storing pending payment:', pendingError);
        throw new Error('Error al preparar el pago');
      }

      // Obtener datos de perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('user_id', user.id)
        .single();

      const customerFullName = profile?.full_name || user.email?.split('@')[0] || 'Cliente';
      const customerEmail = profile?.email || user.email || '';

      // Crear payment link
      const paymentUrl = await createPaymentLink({
        orderId: orderNumber,
        amount: amountInCents,
        currency: listing.currency || 'COP',
        customerEmail,
        customerFullName,
        redirectUrl: `${window.location.origin}/payment-return?orderId=${orderNumber}`
      });

      if (paymentUrl) {
        redirectToPayment(paymentUrl);
      }

    } catch (error: any) {
      console.error('Error en checkout:', error);
      toast({
        title: "Error en el pago",
        description: error.message || "No se pudo iniciar el proceso de pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWidgetPayment = async () => {
    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para comprar",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Generar orderId único
      const orderNumber = `MKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear orden en base de datos
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: listing.seller_id,
          marketplace_listing_id: listing.id,
          order_number: orderNumber,
          total_amount: listing.price,
          currency: listing.currency || 'COP',
          payment_status: 'pending',
          order_status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('No se pudo crear la orden');
      }

      // Crear pending_payment
      const amountInCents = Math.round(listing.price * 100);
      
      const { error: pendingError } = await supabase
        .from('pending_payments')
        .insert({
          user_id: user.id,
          order_id: orderNumber,
          amount: amountInCents,
          currency: listing.currency || 'COP',
          payment_type: 'marketplace_order',
          metadata: {
            listing_id: listing.id,
            order_db_id: newOrder.id,
            listing_name: listing.jewelry_item?.name || 'Producto',
            payment_method: 'widget'
          }
        });

      if (pendingError) {
        console.error('Error storing pending payment:', pendingError);
        throw new Error('Error al preparar el pago');
      }

      // Obtener datos de perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('user_id', user.id)
        .single();

      const customerFullName = profile?.full_name || user.email?.split('@')[0] || 'Cliente';
      const customerEmail = profile?.email || user.email || '';
      const customerPhone = profile?.phone || '';

      // Abrir widget de Wompi
      await openCheckout({
        currency: listing.currency || 'COP',
        amountInCents,
        reference: orderNumber,
        publicKey: WOMPI_PUBLIC_KEY,
        redirectUrl: `${window.location.origin}/payment-return?orderId=${orderNumber}`,
        customerEmail,
        customerFullName,
        customerPhoneNumber: customerPhone
      });

    } catch (error: any) {
      console.error('Error en checkout:', error);
      toast({
        title: "Error en el pago",
        description: error.message || "No se pudo iniciar el proceso de pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (paymentMethod === 'direct') {
      await handleDirectPayment();
    } else {
      await handleWidgetPayment();
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const isProcessing = loading || directPaymentLoading;

  return (
    <div className="container max-w-6xl mx-auto p-4 sm:p-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Columna izquierda: Resumen del producto */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Resumen del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              <img
                src={listing.jewelry_item?.main_image_url || "/placeholder.svg"}
                alt={listing.jewelry_item?.name || "Producto"}
                className="object-cover w-full h-full"
              />
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">
                {listing.jewelry_item?.name || "Producto"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                {listing.description || listing.jewelry_item?.description}
              </p>
            </div>

            {listing.jewelry_item?.type && (
              <div>
                <Badge variant="outline">{listing.jewelry_item.type}</Badge>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-medium">
                  {formatPrice(listing.price, listing.currency || 'COP')}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(listing.price, listing.currency || 'COP')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Columna derecha: Método de pago */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(v) => setPaymentMethod(v as 'direct' | 'widget')}
              className="gap-4"
            >
              {/* Opción: Redirect a Wompi */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <RadioGroupItem value="direct" id="direct" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="direct" className="cursor-pointer font-medium flex items-center gap-2">
                    Página de Pago Wompi
                    <Badge variant="default" className="ml-2">Recomendado</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Serás redirigido a la página segura de Wompi para completar el pago
                  </p>
                </div>
              </div>

              {/* Opción: Widget */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <RadioGroupItem value="widget" id="widget" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="widget" className="cursor-pointer font-medium">
                    Widget de Pago
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Paga sin salir de esta página usando el widget integrado
                  </p>
                </div>
              </div>
            </RadioGroup>

            <Separator />

            {/* Botón de pago */}
            <div className="space-y-4">
              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    {paymentMethod === 'widget' ? 'Abrir Widget de Pago' : 'Ir a Página de Pago'}
                  </>
                )}
              </Button>

              {/* Información de seguridad */}
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Pago 100% seguro</strong>
                  <br />
                  Procesado por Wompi, cumpliendo con los estándares de seguridad PCI DSS
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
