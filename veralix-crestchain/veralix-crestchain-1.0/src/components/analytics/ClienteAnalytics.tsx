import { useEffect } from "react";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { MetricCard } from "./MetricCard";
import { SimpleDonutChart } from "./ChartLibrary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Gem, Award, ShoppingBag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ClienteAnalytics() {
  const { collectionStats, loading, loadAll } = useAdvancedAnalytics();

  useEffect(() => {
    loadAll('cliente');
  }, [loadAll]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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

  if (!collectionStats) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Aún no tienes compras completadas. ¡Explora el marketplace!
          </p>
        </CardContent>
      </Card>
    );
  }

  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  const pieData = collectionStats.byType.map((item, index) => ({
    name: item.type,
    value: item.count,
    color: colors[index % colors.length]
  }));

  return (
    <div className="space-y-8">
      {/* Collection Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          title="Valor de Colección"
          value={formatCurrency(collectionStats.totalValue)}
          icon={Gem}
          subtitle="Total invertido"
        />
        
        <MetricCard
          title="Joyas Adquiridas"
          value={collectionStats.totalItems}
          icon={ShoppingBag}
          subtitle="Piezas únicas"
        />
        
        <MetricCard
          title="Certificados NFT"
          value={collectionStats.certificatesOwned}
          icon={Award}
          subtitle="En tu posesión"
        />
      </div>

      {/* Collection Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {pieData.length > 0 && (
          <SimpleDonutChart
            data={pieData}
            title="Distribución por Tipo de Joya"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Desglose de Colección</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collectionStats.byType.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.count} {item.count === 1 ? 'pieza' : 'piezas'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.value)}</p>
                    <Badge variant="secondary" className="mt-1">
                      {((item.value / collectionStats.totalValue) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Insight */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading font-semibold text-lg">
                Tu Inversión en Joyería
              </h3>
              <p className="text-muted-foreground">
                Has invertido <span className="font-semibold text-foreground">{formatCurrency(collectionStats.totalValue)}</span> en {collectionStats.totalItems} piezas únicas de joyería certificada. 
                Cada pieza cuenta con su certificado NFT que garantiza su autenticidad y trazabilidad.
              </p>
              {collectionStats.totalItems > 0 && (
                <p className="text-sm text-primary font-medium">
                  Valor promedio por pieza: {formatCurrency(collectionStats.totalValue / collectionStats.totalItems)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
