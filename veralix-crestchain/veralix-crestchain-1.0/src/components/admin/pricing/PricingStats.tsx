import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Tag, TrendingUp } from "lucide-react";

interface PricingStatsProps {
  totalPackages: number;
  totalRules: number;
  activePackages: number;
  activeRules: number;
}

export function PricingStats({ totalPackages, totalRules, activePackages, activeRules }: PricingStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paquetes Totales</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPackages}</div>
          <p className="text-xs text-muted-foreground">
            {activePackages} activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reglas de Precio</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRules}</div>
          <p className="text-xs text-muted-foreground">
            {activeRules} activas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Configuraciones</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPackages + totalRules}</div>
          <p className="text-xs text-muted-foreground">
            Paquetes + Reglas individuales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Activación</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalPackages + totalRules > 0 
              ? Math.round(((activePackages + activeRules) / (totalPackages + totalRules)) * 100)
              : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            Configuraciones activas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
