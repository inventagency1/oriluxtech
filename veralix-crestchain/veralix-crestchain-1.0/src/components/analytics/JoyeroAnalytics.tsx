import { useEffect } from "react";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { useAnalytics } from "@/hooks/useAnalytics";
import { MetricCard } from "./MetricCard";
import { SimpleBarChart, FunnelChart } from "./ChartLibrary";
import { ComparisonCard } from "./AdvancedMetrics";
import { RatingStars } from "@/components/marketplace/RatingStars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, Award, TrendingUp, Eye, Heart, ShoppingCart, CheckCircle } from "lucide-react";

export function JoyeroAnalytics() {
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { topProducts, conversionFunnel, loading: advancedLoading, loadAll } = useAdvancedAnalytics();

  useEffect(() => {
    loadAll('joyero');
  }, [loadAll]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const loading = analyticsLoading || advancedLoading;

  if (loading) {
    return (
      <div className="space-y-6">
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
    );
  }

  const funnelData = conversionFunnel ? [
    { stage: "Vistas", value: conversionFunnel.views },
    { stage: "Me Gusta", value: conversionFunnel.likes },
    { stage: "Órdenes", value: conversionFunnel.orders },
    { stage: "Completadas", value: conversionFunnel.completed }
  ] : [];

  const topProductsChart = topProducts.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    value: p.revenue
  }));

  return (
    <div className="space-y-8">
      {/* Hero Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ingresos del Mes"
          value={formatCurrency(analytics.totalRevenue)}
          icon={DollarSign}
          subtitle="Ventas completadas"
        />
        
        <MetricCard
          title="Órdenes Activas"
          value={analytics.pendingOrders}
          icon={ShoppingBag}
          subtitle="Requieren atención"
        />
        
        <MetricCard
          title="Rating Promedio"
          value={analytics.averageOrderValue > 0 ? "4.5" : "N/A"}
          icon={Award}
          subtitle="De tus productos"
        />
        
        <MetricCard
          title="Tasa de Conversión"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          subtitle="Vistas a ventas"
        />
      </div>

      {/* Top Products & Funnel */}
      <div className="grid gap-6 lg:grid-cols-2">
        {topProductsChart.length > 0 ? (
          <SimpleBarChart
            data={topProductsChart}
            title="Top Productos por Revenue"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Top Productos por Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No hay datos suficientes aún
              </p>
            </CardContent>
          </Card>
        )}

        {funnelData.length > 0 && (
          <FunnelChart
            data={funnelData}
            title="Embudo de Conversión"
          />
        )}
      </div>

      {/* Top Products Table */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Detalle de Top Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Conversión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{product.sales}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.revenue)}
                    </TableCell>
                    <TableCell>
                      <RatingStars rating={product.rating} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={product.conversion > 5 ? "default" : "secondary"}>
                        {product.conversion}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Certificate Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        <ComparisonCard
          title="Certificados Emitidos"
          currentValue={analytics.totalCertificates}
          previousValue={Math.max(0, analytics.totalCertificates - 5)}
          icon={<Award className="w-4 h-4 text-primary" />}
        />
        
        <ComparisonCard
          title="Listados Activos"
          currentValue={analytics.totalListings}
          previousValue={Math.max(0, analytics.totalListings - 2)}
          icon={<ShoppingCart className="w-4 h-4 text-primary" />}
        />
        
        <ComparisonCard
          title="Órdenes Completadas"
          currentValue={analytics.completedOrders}
          previousValue={Math.max(0, analytics.completedOrders - 3)}
          icon={<CheckCircle className="w-4 h-4 text-primary" />}
        />
      </div>
    </div>
  );
}
