import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, Calendar, AlertCircle, CheckCircle, ShoppingCart, TrendingUp } from "lucide-react";
import { useCertificateBalance } from "@/hooks/useCertificateBalance";
import { Link } from "react-router-dom";

export function CertificateBalanceStatus() {
  const { 
    balance, 
    loading, 
    hasAvailableCertificates, 
    isLowBalance,
    getUsagePercentage
  } = useCertificateBalance();

  if (loading) {
    return (
      <Card className="shadow-premium border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAvailableCertificates()) {
    return (
      <Card className="shadow-premium border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading">Balance de Certificados</CardTitle>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Sin Certificados
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-muted-foreground mb-4">
              No tienes certificados disponibles. Compra un paquete para comenzar a certificar tus joyas.
            </p>
            <Button asChild className="bg-gradient-gold hover:shadow-gold transition-premium">
              <Link to="/pricing">
                <Package className="w-4 h-4 mr-2" />
                Comprar Certificados
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = getUsagePercentage();
  
  const getBalanceColor = () => {
    if (balance.available > 10) return 'text-green-600 border-green-200 bg-green-50';
    if (balance.available > 5) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="shadow-premium border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">Balance de Certificados</CardTitle>
          <Badge className={getBalanceColor()}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {balance.available} Disponibles
          </Badge>
        </div>
        <CardDescription>
          {balance.totalPurchased} certificados comprados en total
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Package Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold">Balance Total</p>
              <p className="text-sm text-muted-foreground">
                {balance.totalPurchased} certificados
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-semibold">Última Compra</p>
              <p className="text-sm text-muted-foreground">
                {balance.lastPurchaseDate ? 
                  formatDate(balance.lastPurchaseDate) : 'No disponible'}
              </p>
            </div>
          </div>
        </div>

        {/* Certificate Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Certificados Utilizados</span>
            <span className="text-sm text-muted-foreground">
              {balance.totalUsed} / {balance.totalPurchased}
            </span>
          </div>
          
          <Progress 
            value={usagePercentage} 
            className="h-2"
          />
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className={`w-4 h-4 ${balance.available > 5 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={balance.available > 5 ? 'text-green-600' : 'text-red-600'}>
                {balance.available} certificados restantes
              </span>
            </div>
            {balance.available <= 5 && (
              <Button asChild size="sm" variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                <Link to="/pricing">
                  Comprar Más
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Low Balance Alert */}
        {isLowBalance() && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-orange-800">
                <p className="font-medium">Balance bajo de certificados</p>
                <p>Solo te quedan {balance.available} certificados. Considera comprar más para continuar certificando sin interrupciones.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div className="text-center p-3 bg-accent/30 rounded-lg">
            <p className="text-2xl font-bold">{balance.totalPurchased}</p>
            <p className="text-xs text-muted-foreground">Total Comprado</p>
          </div>
          <div className="text-center p-3 bg-accent/30 rounded-lg">
            <p className="text-2xl font-bold">{balance.totalUsed}</p>
            <p className="text-xs text-muted-foreground">Total Usado</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/certificate-bundles/manage">
                Ver Historial
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-gold hover:shadow-gold transition-premium">
              <Link to="/pricing">
                <Package className="w-3 h-3 mr-1" />
                Comprar Más
              </Link>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Los certificados nunca expiran
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
