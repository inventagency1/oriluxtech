import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PendingPayment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  created_at: string;
  expires_at: string;
  metadata: any;
}

interface WebhookLog {
  id: string;
  created_at: string;
  event_type: string;
  transaction_id: string | null;
  status: string | null;
  reference: string | null;
  amount_in_cents: number | null;
  currency: string | null;
  signature_valid: boolean | null;
  processed: boolean;
  processing_error: string | null;
  user_id: string | null;
  order_id: string | null;
}

interface CertificatePurchase {
  id: string;
  user_id: string;
  package_name: string;
  certificates_purchased: number;
  certificates_remaining: number;
  amount_paid: number;
  currency: string;
  payment_status: string;
  purchased_at: string;
  transaction_id: string | null;
}

export default function WompiMonitoring() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<CertificatePurchase[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch pending payments
      const { data: payments, error: paymentsError } = await supabase
        .from('pending_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (paymentsError) throw paymentsError;
      setPendingPayments(payments || []);

      // Fetch webhook logs
      const { data: logs, error: logsError } = await supabase
        .from('wompi_webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setWebhookLogs(logs || []);

      // Fetch recent purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('certificate_purchases')
        .select('*')
        .eq('payment_provider', 'wompi')
        .order('purchased_at', { ascending: false })
        .limit(20);

      if (purchasesError) throw purchasesError;
      setRecentPurchases(purchases || []);

      console.log('✅ [MONITORING] Data loaded:', {
        pendingPayments: payments?.length,
        webhookLogs: logs?.length,
        recentPurchases: purchases?.length
      });
    } catch (error) {
      console.error('❌ [MONITORING] Error loading data:', error);
      toast({
        title: "Error al cargar datos",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string | null) => {
    if (status === 'APPROVED') {
      return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
    } else if (status === 'DECLINED' || status === 'ERROR') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
    } else if (status === 'PENDING') {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
    }
    return <Badge variant="outline">{status || 'Desconocido'}</Badge>;
  };

  return (
    <DashboardLayout title="Monitor Wompi" description="Monitoreo en tiempo real de pagos y webhooks">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monitor Wompi</h1>
            <p className="text-muted-foreground">
              Monitoreo en tiempo real de pagos y webhooks
            </p>
          </div>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              Esperando confirmación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Recibidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhookLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 50 eventos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentPurchases.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 20 compras
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pagos Pendientes</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
        </TabsList>

        {/* Pending Payments Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagos Pendientes</CardTitle>
              <CardDescription>
                Pagos que están esperando ser completados por Wompi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay pagos pendientes
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-start justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{payment.order_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.metadata?.package_name} - {payment.metadata?.certificates_count} certificados
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Creado {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true, locale: es })}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="font-bold">
                          ${payment.amount.toLocaleString()} {payment.currency}
                        </div>
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Webhooks</CardTitle>
              <CardDescription>
                Todos los webhooks recibidos desde Wompi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webhookLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se han recibido webhooks aún
                </div>
              ) : (
                <div className="space-y-4">
                  {webhookLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.event_type}</span>
                            {log.signature_valid === false && (
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                            )}
                            {log.processed ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.reference || log.transaction_id || 'Sin referencia'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                          </div>
                          {log.processing_error && (
                            <div className="text-xs text-destructive mt-2">
                              Error: {log.processing_error}
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          {log.status && getStatusBadge(log.status)}
                          {log.amount_in_cents && (
                            <div className="text-sm">
                              ${(log.amount_in_cents / 100).toLocaleString()} {log.currency}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compras Completadas</CardTitle>
              <CardDescription>
                Certificados comprados a través de Wompi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPurchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay compras completadas aún
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-start justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{purchase.package_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {purchase.certificates_purchased} certificados - {purchase.certificates_remaining} restantes
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(purchase.purchased_at), { addSuffix: true, locale: es })}
                        </div>
                        {purchase.transaction_id && (
                          <div className="text-xs font-mono text-muted-foreground">
                            TX: {purchase.transaction_id.substring(0, 20)}...
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <div className="font-bold">
                          ${purchase.amount_paid.toLocaleString()} {purchase.currency}
                        </div>
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completado
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}
