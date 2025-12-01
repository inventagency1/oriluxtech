import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";

interface RecentActivityProps {
  activities: any[];
}

// Memoize to prevent unnecessary re-renders
export const RecentActivity = memo(function RecentActivity({ activities }: RecentActivityProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "outline" as const, icon: Clock },
      processing: { label: "Procesando", variant: "default" as const, icon: Package },
      completed: { label: "Completado", variant: "default" as const, icon: CheckCircle2 },
      cancelled: { label: "Cancelado", variant: "destructive" as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="shadow-veralix-premium border-border/50">
      <CardHeader>
        <CardTitle className="font-heading">Actividad Reciente</CardTitle>
        <CardDescription>Últimas transacciones y órdenes</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No hay actividad reciente</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        Orden #{activity.order_number}
                      </p>
                      {getStatusBadge(activity.order_status)}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {formatDate(activity.created_at)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        {formatCurrency(Number(activity.total_amount))}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {activity.payment_status === 'paid' ? 'Pagado' : 'Pendiente pago'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
