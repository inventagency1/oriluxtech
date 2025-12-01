import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, Award, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CLIENT_CATEGORY_LABELS, type ClientCategory } from '@/hooks/useClientCategories';

interface CategoryStats {
  category: ClientCategory;
  count: number;
  total_purchases: number;
  avg_purchase: number;
}

export function CategoryDashboard() {
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      setLoading(true);

      // Obtener estadísticas por categoría
      const { data: categories, error: catError } = await supabase
        .from('client_categories')
        .select('category, user_id');

      if (catError) throw catError;

      // Contar clientes por categoría
      const categoryCounts: Record<string, number> = {};
      categories?.forEach(cat => {
        categoryCounts[cat.category] = (categoryCounts[cat.category] || 0) + 1;
      });

      // Obtener total de compras por usuario
      const { data: purchases, error: purchError } = await supabase
        .from('certificate_purchases')
        .select('user_id, amount_paid, payment_status');

      if (purchError) throw purchError;

      // Calcular estadísticas por categoría
      const categoryStats: CategoryStats[] = [];
      
      for (const [category, count] of Object.entries(categoryCounts)) {
        const categoryUsers = categories
          ?.filter(c => c.category === category)
          .map(c => c.user_id) || [];

        const categoryPurchases = purchases?.filter(
          p => categoryUsers.includes(p.user_id) && p.payment_status === 'completed'
        ) || [];

        const totalPurchases = categoryPurchases.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const avgPurchase = categoryPurchases.length > 0 ? totalPurchases / categoryPurchases.length : 0;

        categoryStats.push({
          category: category as ClientCategory,
          count,
          total_purchases: totalPurchases,
          avg_purchase: avgPurchase
        });
      }

      setStats(categoryStats);
      setTotalClients(categories?.length || 0);

    } catch (error) {
      console.error('Error fetching category stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: ClientCategory) => {
    switch(category) {
      case 'premium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'corporativo': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'mayorista': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const totalRevenue = stats.reduce((sum, s) => sum + s.total_purchases, 0);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Con categoría asignada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-muted-foreground">
              COP de todas las categorías
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías Activas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.length}</div>
            <p className="text-xs text-muted-foreground">
              De 4 categorías disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compra Promedio</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(totalRevenue / totalClients || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-muted-foreground">
              Por cliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Categoría</CardTitle>
          <CardDescription>
            Clientes e ingresos segmentados por nivel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map((stat) => (
              <div key={stat.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getCategoryColor(stat.category)}>
                    {CLIENT_CATEGORY_LABELS[stat.category]}
                  </Badge>
                  <div className="text-sm">
                    <div className="font-medium">{stat.count} clientes</div>
                    <div className="text-muted-foreground">
                      Promedio: ${Math.round(stat.avg_purchase).toLocaleString('es-CO')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    ${stat.total_purchases.toLocaleString('es-CO')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((stat.total_purchases / totalRevenue) * 100).toFixed(1)}% del total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}