import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { OrderChatPanel } from '@/components/marketplace/OrderChatPanel';
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, loading, updateOrderStatus, initiatePayment, formatPrice } = useOrders();
  const [order, setOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orders.length > 0 && orderId) {
      const foundOrder = orders.find(o => o.id === orderId);
      setOrder(foundOrder);
    }
  }, [orders, orderId]);

  const handlePayNow = async () => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const result = await initiatePayment(order.id, 'bold');
      
      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toast.error('Error al iniciar el pago');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus as any);
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando orden...</p>
        </div>
      </AppLayout>
    );
  }

  const isBuyer = user?.id === order.buyer_id;
  const isSeller = user?.id === order.seller_id;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      processing: 'default',
      shipped: 'outline',
      delivered: 'default',
      cancelled: 'destructive'
    };
    
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    };
    
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(isBuyer ? '/my-marketplace?tab=purchases' : '/my-marketplace?tab=sales')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Orden #{order.order_number}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            {getStatusBadge(order.order_status)}
            {getPaymentStatusBadge(order.payment_status)}
            <span className="text-sm text-muted-foreground">
              Creada el {new Date(order.created_at).toLocaleDateString('es-CO')}
            </span>
          </div>
        </div>

        {/* Payment Pending Alert */}
        {order.payment_status === 'pending' && isBuyer && (
          <Card className="border-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <CreditCard className="w-6 h-6 text-yellow-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">Pago Pendiente</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tu orden está esperando el pago para ser procesada.
                    </p>
                  </div>
                </div>
                <Button onClick={handlePayNow} disabled={updating}>
                  {updating ? 'Procesando...' : 'Pagar Ahora'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Producto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {order.listing?.jewelry_item?.name || 'Joya'}
                </h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {order.listing?.jewelry_item?.type}
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio:</span>
                  <span className="font-semibold">
                    {formatPrice(order.total_amount, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío:</span>
                  <span className="font-semibold">Por calcular</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">
                  {formatPrice(order.total_amount, order.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Dirección de Envío</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_address && (
                <div className="space-y-1">
                  <p className="font-medium">{order.shipping_address.street}</p>
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state}
                  </p>
                  <p>{order.shipping_address.zipCode}</p>
                  <p>{order.shipping_address.country}</p>
                  {order.shipping_address.phone && (
                    <p className="mt-2 text-sm">
                      <span className="text-muted-foreground">Tel:</span> {order.shipping_address.phone}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buyer/Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{isBuyer ? 'Vendedor' : 'Comprador'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {isBuyer 
                  ? (order.listing?.seller?.business_name || order.listing?.seller?.full_name || 'Vendedor')
                  : 'Información del comprador'}
              </p>
            </CardContent>
          </Card>

          {/* Order Actions - Only for seller */}
          {isSeller && order.payment_status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Acciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.order_status === 'pending' && (
                  <Button
                    className="w-full"
                    onClick={() => handleStatusUpdate('processing')}
                    disabled={updating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Procesar Orden
                  </Button>
                )}
                {order.order_status === 'processing' && (
                  <Button
                    className="w-full"
                    onClick={() => handleStatusUpdate('shipped')}
                    disabled={updating}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Marcar como Enviado
                  </Button>
                )}
                {order.order_status === 'shipped' && (
                  <Button
                    className="w-full"
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={updating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Entregado
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Notas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Communication Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Mensajes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderChatPanel
              orderId={order.id}
              orderNumber={order.order_number}
              otherPartyName={
                isBuyer 
                  ? (order.listing?.seller?.business_name || order.listing?.seller?.full_name || 'Vendedor')
                  : 'Comprador'
              }
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OrderDetail;
