import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders, Order } from '@/hooks/useOrders';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Clock, Truck, CheckCircle, XCircle, Package, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { OrderChatPanel } from './OrderChatPanel';

interface BuyerOrdersPanelProps {
  className?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'confirmed': return <Package className="w-4 h-4" />;
    case 'processing': return <Package className="w-4 h-4" />;
    case 'shipped': return <Truck className="w-4 h-4" />;
    case 'delivered': return <CheckCircle className="w-4 h-4" />;
    case 'cancelled': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
    case 'confirmed': return 'bg-blue-500/20 text-blue-700 border-blue-300';
    case 'processing': return 'bg-purple-500/20 text-purple-700 border-purple-300';
    case 'shipped': return 'bg-orange-500/20 text-orange-700 border-orange-300';
    case 'delivered': return 'bg-green-500/20 text-green-700 border-green-300';
    case 'cancelled': return 'bg-red-500/20 text-red-700 border-red-300';
    default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
    case 'processing': return 'bg-blue-500/20 text-blue-700 border-blue-300';
    case 'completed': return 'bg-green-500/20 text-green-700 border-green-300';
    case 'failed': return 'bg-red-500/20 text-red-700 border-red-300';
    case 'cancelled': return 'bg-gray-500/20 text-gray-700 border-gray-300';
    case 'refunded': return 'bg-purple-500/20 text-purple-700 border-purple-300';
    default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
  }
};

export const BuyerOrdersPanel = ({ className }: BuyerOrdersPanelProps) => {
  const { user } = useAuth();
  const { 
    orders, 
    loading, 
    error, 
    fetchOrders, 
    getBuyerOrders,
    getOrdersByStatus,
    getOrdersByPaymentStatus,
    createCommunication,
    cancelOrder,
    formatPrice 
  } = useOrders();
  const { getUnreadCount, totalUnread } = useUnreadMessages();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const buyerOrders = getBuyerOrders();
  const pendingOrders = getOrdersByStatus('pending');
  const activeOrders = buyerOrders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.order_status));
  const completedOrders = getOrdersByStatus('delivered');
  const cancelledOrders = getOrdersByStatus('cancelled');

  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta orden?')) return;

    const result = await cancelOrder(order.id, 'Cancelado por el comprador');
    if (result.success) {
      fetchOrders(); // Refresh orders
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} shadow-lg animate-fade-in`}>
      <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20 py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl font-heading flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="bg-gradient-gold bg-clip-text text-transparent">Mis Compras</span>
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs">Historial y seguimiento de tus órdenes</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-3 px-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-3 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-gradient-gold data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <span className="hidden sm:inline">Todas</span> ({buyerOrders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="active"
              className="data-[state=active]:bg-gradient-gold data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <Truck className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Activas</span> ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-gradient-gold data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <CheckCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Completadas</span> ({completedOrders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="cancelled"
              className="data-[state=active]:bg-gradient-gold data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <XCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Canceladas</span> ({cancelledOrders.length})
            </TabsTrigger>
          </TabsList>

        <TabsContent value="all" className="space-y-4">
          <OrdersList orders={buyerOrders} onOrderClick={setSelectedOrder} onCancelOrder={handleCancelOrder} formatPrice={formatPrice} getUnreadCount={getUnreadCount} />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <OrdersList orders={buyerOrders} onOrderClick={setSelectedOrder} onCancelOrder={handleCancelOrder} formatPrice={formatPrice} getUnreadCount={getUnreadCount} />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <OrdersList orders={activeOrders} onOrderClick={setSelectedOrder} onCancelOrder={handleCancelOrder} formatPrice={formatPrice} getUnreadCount={getUnreadCount} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <OrdersList orders={completedOrders} onOrderClick={setSelectedOrder} onCancelOrder={handleCancelOrder} formatPrice={formatPrice} getUnreadCount={getUnreadCount} />
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <OrdersList orders={cancelledOrders} onOrderClick={setSelectedOrder} onCancelOrder={handleCancelOrder} formatPrice={formatPrice} getUnreadCount={getUnreadCount} />
        </TabsContent>
      </Tabs>
      </CardContent>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Orden {selectedOrder.order_number}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Order Status & Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Estado de la Orden</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedOrder.order_status)}>
                        {getStatusIcon(selectedOrder.order_status)}
                        <span className="ml-1 capitalize">{selectedOrder.order_status}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estado del Pago</label>
                    <div className="mt-1">
                      <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                        <span className="capitalize">{selectedOrder.payment_status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <h4 className="font-semibold mb-2">Detalles de la Orden</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fecha:</span>
                      <p>{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-semibold">{formatPrice(selectedOrder.total_amount, selectedOrder.currency)}</p>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                {selectedOrder.listing && (
                  <div>
                    <h4 className="font-semibold mb-2">Producto</h4>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium">{selectedOrder.listing.jewelry_item.name}</h5>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedOrder.listing.jewelry_item.type}
                      </p>
                      {selectedOrder.listing.jewelry_item.materials.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Materiales: {selectedOrder.listing.jewelry_item.materials.join(', ')}
                        </p>
                      )}
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Vendedor:</span>
                        <p className="text-sm font-medium">
                          {selectedOrder.listing.seller.business_name || selectedOrder.listing.seller.full_name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div>
                    <h4 className="font-semibold mb-2">Dirección de Envío</h4>
                    <div className="text-sm bg-muted p-3 rounded">
                      <p>{selectedOrder.shipping_address.street}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                      <p>{selectedOrder.shipping_address.zipCode}, {selectedOrder.shipping_address.country}</p>
                      {selectedOrder.shipping_address.phone && (
                        <p>Tel: {selectedOrder.shipping_address.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notas</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  </div>
                )}

                <Separator />

                {/* Communication Section */}
                <OrderChatPanel
                  orderId={selectedOrder.id}
                  orderNumber={selectedOrder.order_number}
                  otherPartyName={
                    selectedOrder.listing?.seller.business_name || 
                    selectedOrder.listing?.seller.full_name || 
                    'Vendedor'
                  }
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// Orders List Component
const OrdersList = ({ 
  orders, 
  onOrderClick, 
  onCancelOrder, 
  formatPrice,
  getUnreadCount 
}: { 
  orders: Order[], 
  onOrderClick: (order: Order) => void,
  onCancelOrder: (order: Order) => void,
  formatPrice: (amount: number, currency?: string) => string,
  getUnreadCount: (orderId: string) => number
}) => {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay órdenes</h3>
          <p className="text-muted-foreground">Aún no has realizado ninguna compra.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h4 className="font-semibold">{order.order_number}</h4>
                  <Badge className={getStatusColor(order.order_status)}>
                    {getStatusIcon(order.order_status)}
                    <span className="ml-1 capitalize">{order.order_status}</span>
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    <span className="capitalize">{order.payment_status}</span>
                  </Badge>
                </div>
                
                {order.listing && (
                  <p className="text-sm text-muted-foreground mb-1">
                    {order.listing.jewelry_item.name}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(order.total_amount, order.currency)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {order.order_status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelOrder(order);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => onOrderClick(order)}
                  className="relative"
                >
                  {getUnreadCount(order.id) > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {getUnreadCount(order.id)}
                    </Badge>
                  )}
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};