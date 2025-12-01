import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useUserRole } from "@/hooks/useUserRole";
import { JoyeroAnalytics } from "@/components/analytics/JoyeroAnalytics";
import { ClienteAnalytics } from "@/components/analytics/ClienteAnalytics";
import { MetricCard } from "@/components/analytics/MetricCard";
import { SalesChart } from "@/components/analytics/SalesChart";
import { RecentActivity } from "@/components/analytics/RecentActivity";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Award,
  Package,
  Clock,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { useEffect } from "react";

const Analytics = () => {
  const { analytics, timeSeriesData, loading, refreshAnalytics } = useAnalytics();
  const { role, isJoyero, isCliente, isAdmin } = useUserRole();

  // Safety timeout: log warning if loading persists too long
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Analytics: Loading timeout detectado después de 10 segundos');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-[400px]" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-heading mb-2">Analytics</h1>
                <p className="text-muted-foreground">
                  {isJoyero && "Monitorea el rendimiento de tu negocio en tiempo real"}
                  {isCliente && "Visualiza el valor de tu colección y actividad"}
                  {isAdmin && "Vista completa de métricas de la plataforma"}
                </p>
              </div>
              
              <Button onClick={refreshAnalytics} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
            </div>

            {/* Date Range Picker */}
            <DateRangePicker />
          </div>

          {/* Tabs por Rol */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              {isJoyero && <TabsTrigger value="products">Productos</TabsTrigger>}
              {isJoyero && <TabsTrigger value="certificates">Certificados</TabsTrigger>}
              <TabsTrigger value="activity">Actividad</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {isJoyero && <JoyeroAnalytics />}
              {isCliente && <ClienteAnalytics />}
              {isAdmin && (
                <div className="space-y-6">
                  {/* Admin Overview - Métricas generales */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                      title="Ingresos Totales"
                      value={formatCurrency(analytics.totalRevenue)}
                      icon={DollarSign}
                      subtitle="Ventas completadas"
                    />
                    
                    <MetricCard
                      title="Órdenes Totales"
                      value={analytics.totalOrders}
                      icon={ShoppingBag}
                      subtitle={`${analytics.completedOrders} completadas`}
                    />
                    
                    <MetricCard
                      title="Certificados"
                      value={analytics.totalCertificates}
                      icon={Award}
                      subtitle="NFT emitidos"
                    />
                    
                    <MetricCard
                      title="Ticket Promedio"
                      value={formatCurrency(analytics.averageOrderValue)}
                      icon={TrendingUp}
                      subtitle={`${analytics.conversionRate.toFixed(1)}% conversión`}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <MetricCard
                      title="Órdenes Pendientes"
                      value={analytics.pendingOrders}
                      icon={Clock}
                      subtitle="Requieren atención"
                      className="border-orange-500/20"
                    />
                    
                    <MetricCard
                      title="Órdenes Completadas"
                      value={analytics.completedOrders}
                      icon={CheckCircle}
                      subtitle="Exitosamente procesadas"
                      className="border-green-500/20"
                    />
                    
                    <MetricCard
                      title="Listados Activos"
                      value={analytics.totalListings}
                      icon={Package}
                      subtitle="En el marketplace"
                      className="border-blue-500/20"
                    />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <SalesChart data={timeSeriesData} type="area" />
                    <RecentActivity activities={analytics.recentActivity} />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Products Tab (solo joyerías) */}
            {isJoyero && (
              <TabsContent value="products">
                <div className="text-center py-12 text-muted-foreground">
                  Vista detallada de productos próximamente
                </div>
              </TabsContent>
            )}

            {/* Certificates Tab (solo joyerías) */}
            {isJoyero && (
              <TabsContent value="certificates">
                <div className="text-center py-12 text-muted-foreground">
                  Vista detallada de certificados próximamente
                </div>
              </TabsContent>
            )}

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <RecentActivity activities={analytics.recentActivity} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analytics;
