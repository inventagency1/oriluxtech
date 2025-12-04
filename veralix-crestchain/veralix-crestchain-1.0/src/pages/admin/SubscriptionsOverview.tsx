import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TrendingUp, Users, DollarSign, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CertificatePurchase {
  id: string;
  user_id: string;
  package_name: string;
  package_type: string;
  payment_status: string;
  amount_paid: number;
  certificates_purchased: number;
  certificates_used: number;
  purchased_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export default function SubscriptionsOverview() {
  const [purchases, setPurchases] = useState<CertificatePurchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<CertificatePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [purchases, statusFilter, packageFilter, searchTerm]);

  const loadPurchases = async () => {
    try {
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('certificate_purchases')
        .select('*')
        .order('purchased_at', { ascending: false });

      if (purchasesError) throw purchasesError;

      const purchasesWithProfiles = await Promise.all(
        (purchasesData || []).map(async (purchase) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', purchase.user_id)
            .single();

          return {
            ...purchase,
            profiles: profile || { full_name: null, email: null }
          };
        })
      );

      setPurchases(purchasesWithProfiles as CertificatePurchase[]);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los paquetes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPurchases = () => {
    let filtered = purchases;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.payment_status === statusFilter);
    }

    if (packageFilter !== 'all') {
      filtered = filtered.filter(p => p.package_type === packageFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPurchases(filtered);
  };

  // Cálculo de métricas
  const completedPurchases = purchases.filter(p => p.payment_status === 'completed');
  const totalRevenue = completedPurchases.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const totalPurchases = purchases.length;
  const failedCount = purchases.filter(p => p.payment_status === 'failed').length;

  // Distribución por paquete
  const packageDistribution = purchases.reduce((acc, p) => {
    acc[p.package_type] = (acc[p.package_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniquePackages = Array.from(new Set(purchases.map(p => p.package_type)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completado</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Reembolsado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Paquetes de Certificados" description="Panel de control de ventas y métricas">
        <div className="container mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Paquetes de Certificados" description="Panel de control de ventas y métricas">
      <div className="container mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Paquetes de Certificados</h1>
          <p className="text-muted-foreground">Panel de control de ventas y métricas</p>
        </div>
        <Button onClick={loadPurchases} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de ventas completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paquetes Vendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPurchases.length}</div>
            <p className="text-xs text-muted-foreground">
              De {totalPurchases} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados Comprados</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchases.reduce((sum, p) => sum + p.certificates_purchased, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {purchases.reduce((sum, p) => sum + p.certificates_used, 0)} utilizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${completedPurchases.length > 0 ? (totalRevenue / completedPurchases.length).toLocaleString('es-CO', { maximumFractionDigits: 0 }) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Por paquete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por plan */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Distribución por Plan</CardTitle>
          <CardDescription>Cantidad de paquetes vendidos por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(packageDistribution).map(([packageType, count]) => (
              <div key={packageType} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium capitalize">{packageType.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {((count / totalPurchases) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra los paquetes por estado, tipo o busca por usuario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="failed">Fallidos</SelectItem>
                  <SelectItem value="refunded">Reembolsados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Paquete</label>
              <Select value={packageFilter} onValueChange={setPackageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los paquetes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniquePackages.map(pkg => (
                    <SelectItem key={pkg} value={pkg} className="capitalize">
                      {pkg.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email, nombre o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de paquetes */}
      <Card>
        <CardHeader>
          <CardTitle>Paquetes Vendidos ({filteredPurchases.length})</CardTitle>
          <CardDescription>
            {filteredPurchases.length === purchases.length
              ? 'Mostrando todos los paquetes'
              : `Mostrando ${filteredPurchases.length} de ${purchases.length} paquetes`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPurchases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No se encontraron paquetes con los filtros aplicados
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Certificados</TableHead>
                    <TableHead>Monto Pagado</TableHead>
                    <TableHead>Fecha Compra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{purchase.profiles?.full_name || 'Sin nombre'}</p>
                          <p className="text-xs text-muted-foreground">{purchase.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{purchase.package_name}</TableCell>
                      <TableCell>{getStatusBadge(purchase.payment_status)}</TableCell>
                      <TableCell>
                        <span className={purchase.certificates_used >= purchase.certificates_purchased ? 'text-destructive font-medium' : ''}>
                          {purchase.certificates_used} / {purchase.certificates_purchased}
                        </span>
                      </TableCell>
                      <TableCell>${Number(purchase.amount_paid).toLocaleString('es-CO')}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(purchase.purchased_at), 'd MMM yyyy', { locale: es })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
