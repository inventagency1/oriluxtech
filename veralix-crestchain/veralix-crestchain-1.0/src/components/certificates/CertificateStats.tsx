import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, RefreshCw, Gem, TrendingUp, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificateStatsProps {
  stats: {
    total: number;
    verified: number;
    pending: number;
    transferred: number;
    totalValue: number;
    averageValue: number;
  };
  className?: string;
}

export const CertificateStats = ({ stats, className }: CertificateStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const statCards = [
    {
      label: "Total Certificados",
      value: stats.total,
      icon: Package,
      color: "text-foreground",
      bgColor: "bg-muted"
    },
    {
      label: "Verificados",
      value: stats.verified,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      label: "Pendientes",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10"
    },
    {
      label: "Transferidos",
      value: stats.transferred,
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Valor Total",
      value: formatCurrency(stats.totalValue),
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      label: "Valor Promedio",
      value: formatCurrency(stats.averageValue),
      icon: Gem,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {statCards.map((stat, index) => (
        <Card key={index} className="border-border/50 hover:shadow-premium transition-premium">
          <CardContent className="pt-6">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", stat.bgColor)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
