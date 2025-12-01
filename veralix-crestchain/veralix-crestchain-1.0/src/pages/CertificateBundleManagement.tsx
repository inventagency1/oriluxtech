import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCertificateBalance } from '@/hooks/useCertificateBalance';
import { useCertificatePurchase } from '@/hooks/useCertificatePurchase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Package, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CertificateBundleManagement() {
  const navigate = useNavigate();
  const { balance, loading: balanceLoading, isLowBalance, getPurchaseHistory, getUsagePercentage } = useCertificateBalance();
  const { loading: purchaseLoading, getPurchaseHistory: fetchPurchases } = useCertificatePurchase();
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    const history = await fetchPurchases();
    if (history) {
      setPurchases(history);
    }
  };

  if (balanceLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const totalInvested = purchases.reduce((sum, p) => sum + (Number(p.price_per_month) || 0), 0);
  const mostPurchasedPackage = purchases.length > 0 
    ? purchases.reduce((acc: Record<string, number>, p) => {
        acc[p.plan] = (acc[p.plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};
  
  const topPackage = Object.entries(mostPurchasedPackage).sort(([,a], [,b]) => (b as number) - (a as number))[0];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mis Paquetes de Certificados</h1>
        <p className="text-muted-foreground">Administra tus certificados y revisa tu historial de compras</p>
      </div>

      {/* Balance Actual */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Balance Actual
            </CardTitle>
            {isLowBalance() && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertCircle className="h-3 w-3 mr-1" />
                Balance Bajo
              </Badge>
            )}
          </div>
          <CardDescription>Certificados disponibles en tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-4xl font-bold text-primary mb-2">
                {balance.available}
              </p>
              <p className="text-sm text-muted-foreground">Certificados Disponibles</p>
            </div>
            
            <div className="text-center p-6 bg-muted rounded-lg">
              <p className="text-3xl font-bold mb-2">{balance.totalPurchased}</p>
              <p className="text-sm text-muted-foreground">Total Comprados</p>
            </div>
            
            <div className="text-center p-6 bg-muted rounded-lg">
              <p className="text-3xl font-bold mb-2">{balance.totalUsed}</p>
              <p className="text-sm text-muted-foreground">Certificados Usados</p>
            </div>
          </div>

          {isLowBalance() && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Tus certificados están por agotarse
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Te recomendamos comprar más certificados para no interrumpir tu trabajo.
              </p>
              <Button asChild size="sm" variant="default">
                <Link to="/pricing">
                  <Package className="mr-2 h-4 w-4" />
                  Comprar Más Certificados
                </Link>
              </Button>
            </div>
          )}

          {balance.lastPurchaseDate && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Última compra: {format(new Date(balance.lastPurchaseDate), "d 'de' MMMM, yyyy", { locale: es })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas de Uso */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Invertido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalInvested.toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En {purchases.length} {purchases.length === 1 ? 'compra' : 'compras'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Uso de Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getUsagePercentage()}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance.totalUsed} de {balance.totalPurchased} usados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paquete Favorito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {topPackage ? topPackage[0] : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topPackage ? `${topPackage[1]} ${topPackage[1] === 1 ? 'vez' : 'veces'}` : 'Sin compras'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Compras */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Historial de Compras</CardTitle>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/pricing">
                <Package className="mr-2 h-4 w-4" />
                Comprar Más
              </Link>
            </Button>
          </div>
          <CardDescription>Registro de todos tus paquetes de certificados</CardDescription>
        </CardHeader>
        <CardContent>
          {purchaseLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Aún no has comprado ningún paquete de certificados
              </p>
              <Button asChild>
                <Link to="/pricing">
                  Ver Paquetes Disponibles
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Certificados</TableHead>
                    <TableHead>Usados</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => {
                    const remaining = purchase.certificates_limit - purchase.certificates_used;
                    return (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          {format(new Date(purchase.created_at), "d MMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="font-medium capitalize">
                          {purchase.plan}
                        </TableCell>
                        <TableCell>
                          {purchase.certificates_limit}
                        </TableCell>
                        <TableCell>
                          <span className={purchase.certificates_used >= purchase.certificates_limit ? 'text-destructive font-medium' : ''}>
                            {purchase.certificates_used} / {purchase.certificates_limit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={remaining > 0 ? 'default' : 'secondary'}
                          >
                            {remaining > 0 ? `${remaining} disponibles` : 'Agotado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(purchase.price_per_month).toLocaleString('es-CO')} COP
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">¿Necesitas más certificados?</h3>
              <p className="text-sm text-muted-foreground">
                Los certificados nunca expiran. Compra ahora y úsalos cuando los necesites.
              </p>
            </div>
            <Button asChild size="lg" className="ml-4">
              <Link to="/pricing">
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver Paquetes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}