import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orders, loading, formatPrice } = useOrders();
  const [order, setOrder] = useState<any>(null);

  const orderId = searchParams.get('order');

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const foundOrder = orders.find(o => o.id === orderId);
      setOrder(foundOrder);
    }
  }, [orderId, orders]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">¡Pago Exitoso!</CardTitle>
          <CardDescription>
            Tu pago ha sido procesado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading || !order ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Package className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold">
                          {order.listing?.jewelry_item?.name || 'Producto'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Orden #{order.order_number}
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        {formatPrice(order.total_amount, order.currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Próximos Pasos:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Recibirás un email de confirmación</li>
                  <li>• El vendedor procesará tu pedido</li>
                  <li>• Te notificaremos cuando sea enviado</li>
                  <li>• Puedes ver el estado de tu orden en todo momento</li>
                </ul>
              </div>
            </>
          )}

          <div className="space-y-2">
            {order && (
              <Button 
                className="w-full" 
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                Ver Detalles de la Orden
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/my-marketplace?tab=purchases")}
            >
              Ver Todas Mis Órdenes
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate("/marketplace")}
            >
              Seguir Comprando
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;