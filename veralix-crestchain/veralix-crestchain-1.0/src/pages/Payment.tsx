import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, Order } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Banknote,
  Smartphone,
  Building,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orders, formatPrice } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const orderId = searchParams.get('order');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (orderId) {
      findOrder(orderId);
    } else {
      navigate('/marketplace');
    }
  }, [user, orderId, navigate]);

  const findOrder = async (id: string) => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from Supabase
      // For now, using mock data
      const mockOrder: Order = {
        id: id,
        buyer_id: user?.id || "",
        seller_id: "seller1",
        marketplace_listing_id: "1",
        order_number: "ORD-000001",
        total_amount: 2500000,
        currency: "COP",
        payment_status: "pending",
        order_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        shipping_address: {
          street: "Calle 123 # 45-67",
          city: "Bogotá",
          state: "Cundinamarca",
          zipCode: "110111",
          country: "Colombia"
        },
        listing: {
          id: "1",
          jewelry_item: {
            id: "item1",
            name: "Anillo de Diamante Clásico",
            type: "ring",
            materials: ["Oro Blanco 18k", "Diamante 1ct"],
            images_count: 3
          },
          seller: {
            full_name: "Joyería Premium",
            business_name: "Joyería Premium S.A.S",
            email: "seller@example.com"
          }
        }
      };

      setOrder(mockOrder);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error al cargar la orden');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (paymentMethod: 'bold' | 'manual') => {
    if (!order) return;

    try {
      setProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          orderId: order.id,
          paymentMethod: paymentMethod,
          returnUrl: `${window.location.origin}/payment-success?order=${order.id}`
        }
      });

      if (error) throw error;

      if (data.success) {
        if (data.paymentUrl && paymentMethod === 'bold') {
          // Redirect to Bold payment page
          window.location.href = data.paymentUrl;
        } else {
          // Manual payment - show success message
          toast.success('Orden procesada. Se han enviado las instrucciones de pago.');
          navigate(`/payment-success?order=${order.id}`);
        }
      } else {
        throw new Error(data.error || 'Error processing payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  // Header Component
  const Header = () => (
    <header className="w-full py-4 px-6 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b border-border/20 sticky top-0 z-40">
      <div className="flex items-center space-x-6">
        <Link to="/marketplace" className="flex items-center space-x-3">
          <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          <VeralixLogo size={32} />
          <span className="text-2xl font-bold text-foreground">Pago</span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
      </div>
    </header>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Requerido</h2>
              <p className="text-muted-foreground mb-6">
                Debes iniciar sesión para acceder al pago
              </p>
              <Button asChild>
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Cargando orden...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Orden no encontrada</h2>
              <p className="text-muted-foreground mb-6">
                La orden que buscas no existe o no tienes acceso a ella
              </p>
              <Button asChild>
                <Link to="/marketplace">Volver al Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Método de <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">Pago</span>
            </h1>
            <p className="text-muted-foreground">
              Orden #{order.order_number} • {order.listing?.jewelry_item.name}
            </p>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Resumen de Orden</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Producto:</span>
                  <span className="font-semibold">{order.listing?.jewelry_item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vendedor:</span>
                  <span>{order.listing?.seller.business_name || order.listing?.seller.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    Pendiente de Pago
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(order.total_amount, order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Selecciona el Método de Pago</span>
              </CardTitle>
              <CardDescription>
                Elige cómo quieres pagar tu compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bold Payment */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Pago en Línea Bold</h3>
                        <p className="text-sm text-muted-foreground">
                          Tarjetas, PSE, Nequi, Efecty y más
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => processPayment('bold')}
                      disabled={processing}
                      className="bg-gradient-gold text-background hover:scale-105 transition-transform"
                    >
                      {processing ? 'Procesando...' : 'Pagar Ahora'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Payment */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Transferencia Bancaria</h3>
                        <p className="text-sm text-muted-foreground">
                          Pago directo al vendedor
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => processPayment('manual')}
                      disabled={processing}
                      variant="outline"
                    >
                      {processing ? 'Procesando...' : 'Continuar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-semibold text-foreground">Compra Segura</p>
                  <p>Tu información está protegida con certificación blockchain NFT y encriptación de extremo a extremo.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => navigate('/marketplace')} className="flex-1">
              Cancelar Compra
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;