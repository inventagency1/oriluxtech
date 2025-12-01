import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { toast } from "sonner";
import { OrderChatPanel } from "./OrderChatPanel";
import { 
  Package,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  Eye,
  Search,
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  CreditCard,
  Hash,
  MessageSquare
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  total_amount: number;
  currency: string;
  order_status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  shipping_address?: any;
  billing_address?: any;
  buyer?: {
    full_name: string;
    email: string;
    business_name?: string;
  };
  order_items?: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    jewelry_item?: {
      name: string;
      type: string;
      materials: string[];
    };
    marketplace_listing?: {
      description: string;
    };
  }>;
  communications?: Array<{
    id: string;
    message: string;
    sender_id: string;
    message_type: string;
    created_at: string;
  }>;
}

const statusTranslations = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

const paymentStatusTranslations = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
  refunded: 'Reembolsado'
};

export const JoyeroOrdersPanel = () => {
  const { user } = useAuth();
  const { orders, loading, updateOrder, fetchOrdersBySeller } = useOrders();
  const { getUnreadCount } = useUnreadMessages();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      fetchOrdersBySeller(user.id);
    }
  }, [user, fetchOrdersBySeller]);

  useEffect(() => {
    let filtered = orders.filter((order: any) => order.seller_id === user?.id);

    // Aplicar filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order: any) => order.order_status === statusFilter);
    }

    // Aplicar filtro por tab activo
    if (activeTab !== "all") {
      switch (activeTab) {
        case "pending":
          filtered = filtered.filter((order: any) => 
            order.order_status === "pending" || order.order_status === "confirmed"
          );
          break;
        case "processing":
          filtered = filtered.filter((order: any) => 
            order.order_status === "processing" || order.order_status === "shipped"
          );
          break;
        case "completed":
          filtered = filtered.filter((order: any) => 
            order.order_status === "delivered"
          );
          break;
      }
    }

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter((order: any) =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, activeTab, searchTerm, user]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateOrder(orderId, { order_status: newStatus as any });
      if (result.success) {
        toast.success("Estado actualizado correctamente");
      }
    } catch (error) {
      toast.error("Error al actualizar el estado");
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' = 'order') => {
    const translations = type === 'order' ? statusTranslations : paymentStatusTranslations;
    const statusText = translations[status as keyof typeof translations] || status;

    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">{statusText}</Badge>;
      case 'confirmed':
      case 'paid':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 border-blue-500/30">{statusText}</Badge>;
      case 'processing':
      case 'shipped':
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 border-orange-500/30">{statusText}</Badge>;
      case 'delivered':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">{statusText}</Badge>;
      case 'cancelled':
      case 'failed':
        return <Badge variant="secondary" className="bg-red-500/20 text-red-700 border-red-500/30">{statusText}</Badge>;
      default:
        return <Badge variant="outline">{statusText}</Badge>;
    }
  };

  const getOrderStats = () => {
    const allOrders = orders.filter((order: any) => order.seller_id === user?.id);
    return {
      total: allOrders.length,
      pending: allOrders.filter((o: any) => o.order_status === 'pending' || o.order_status === 'confirmed').length,
      processing: allOrders.filter((o: any) => o.order_status === 'processing' || o.order_status === 'shipped').length,
      completed: allOrders.filter((o: any) => o.order_status === 'delivered').length,
      revenue: allOrders
        .filter((o: any) => o.payment_status === 'paid')
        .reduce((sum: number, o: any) => sum + o.total_amount, 0)
    };
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold font-heading">Gestión de Pedidos</h2>
        <p className="text-xs text-muted-foreground">Administra los pedidos de tu marketplace</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Truck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {formatPrice(stats.revenue, 'COP')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="confirmed">Confirmados</SelectItem>
              <SelectItem value="processing">Procesando</SelectItem>
              <SelectItem value="shipped">Enviados</SelectItem>
              <SelectItem value="delivered">Entregados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="p-1 gap-1">
          <TabsTrigger value="all" className="text-sm">Todos ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending" className="text-sm">Pendientes ({stats.pending})</TabsTrigger>
          <TabsTrigger value="processing" className="text-sm">Proceso ({stats.processing})</TabsTrigger>
          <TabsTrigger value="completed" className="text-sm">Completados ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-3">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">No hay pedidos</CardTitle>
                <CardDescription>
                  {searchTerm || statusFilter !== "all" ? 
                    "No se encontraron pedidos con los filtros aplicados" :
                    "Aún no tienes pedidos en esta categoría"
                  }
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order: any) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                          <Hash className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{order.order_number}</h3>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {order.buyer?.full_name || 'Cliente'} • {order.buyer?.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatPrice(order.total_amount, order.currency)}</div>
                        <div className="flex space-x-2 mt-1">
                          {getStatusBadge(order.order_status, 'order')}
                          {getStatusBadge(order.payment_status, 'payment')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(order.created_at)}
                        </span>
                        {order.order_items && (
                          <span>{order.order_items.length} producto(s)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
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
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Pedido {order.order_number}</DialogTitle>
                              <DialogDescription>
                                Detalles completos del pedido y comunicación con el cliente
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid md:grid-cols-2 gap-6 mt-6">
                              {/* Información del Pedido */}
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold mb-3">Información del Pedido</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Número:</span>
                                      <span className="font-medium">{order.order_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Estado:</span>
                                      {getStatusBadge(order.order_status, 'order')}
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Pago:</span>
                                      {getStatusBadge(order.payment_status, 'payment')}
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Total:</span>
                                      <span className="font-medium">{formatPrice(order.total_amount, order.currency)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Fecha:</span>
                                      <span>{formatDate(order.created_at)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Cliente */}
                                <div>
                                  <h3 className="font-semibold mb-3">Cliente</h3>
                                  <div className="flex items-center space-x-3">
                                    <Avatar>
                                      <AvatarFallback>
                                        {(order.buyer?.full_name || 'C').charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{order.buyer?.full_name}</p>
                                      <p className="text-sm text-muted-foreground">{order.buyer?.email}</p>
                                      {order.buyer?.business_name && (
                                        <p className="text-sm text-muted-foreground">{order.buyer.business_name}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Productos */}
                                {order.order_items && (
                                  <div>
                                    <h3 className="font-semibold mb-3">Productos</h3>
                                    <div className="space-y-2">
                                      {order.order_items.map((item: any) => (
                                        <div key={item.id} className="border rounded-lg p-3">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{item.jewelry_item?.name}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {item.jewelry_item?.type}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                Cantidad: {item.quantity}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-medium">{formatPrice(item.total_price, order.currency)}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {formatPrice(item.unit_price, order.currency)} c/u
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Gestión de Estado */}
                                <div>
                                  <h3 className="font-semibold mb-3">Actualizar Estado</h3>
                                  <div className="flex space-x-2">
                                    <Select 
                                      value={newStatus} 
                                      onValueChange={setNewStatus}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Nuevo estado" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="confirmed">Confirmar</SelectItem>
                                        <SelectItem value="processing">En Proceso</SelectItem>
                                        <SelectItem value="shipped">Enviado</SelectItem>
                                        <SelectItem value="delivered">Entregado</SelectItem>
                                        <SelectItem value="cancelled">Cancelar</SelectItem>
                                      </SelectContent>
                                    </Select>
                                <Button 
                                  onClick={async () => {
                                    if (newStatus) {
                                      await handleUpdateStatus(order.id, newStatus);
                                    }
                                  }}
                                  disabled={!newStatus}
                                >
                                  Actualizar
                                </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Comunicación */}
                              <div className="space-y-4 col-span-2">
                                <OrderChatPanel
                                  orderId={order.id}
                                  orderNumber={order.order_number}
                                  otherPartyName={order.buyer?.full_name || order.buyer?.email || 'Cliente'}
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {order.order_status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};