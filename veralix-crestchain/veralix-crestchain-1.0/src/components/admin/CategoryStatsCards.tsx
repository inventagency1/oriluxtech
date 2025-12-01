import { MetricCard } from "@/components/analytics/MetricCard";
import { Users, Award, Building2, ShoppingCart, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CategoryStats {
  regular: number;
  premium: number;
  corporativo: number;
  mayorista: number;
  without_category: number;
  total_discounts: number;
}

export function CategoryStatsCards() {
  const [stats, setStats] = useState<CategoryStats>({
    regular: 0,
    premium: 0,
    corporativo: 0,
    mayorista: 0,
    without_category: 0,
    total_discounts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get category counts
      const { data: categoryCounts } = await supabase
        .from('client_categories')
        .select('category');

      // Count by category
      const counts = {
        regular: 0,
        premium: 0,
        corporativo: 0,
        mayorista: 0,
      };

      categoryCounts?.forEach(({ category }) => {
        counts[category as keyof typeof counts]++;
      });

      // Get users without category
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const totalWithCategory = categoryCounts?.length || 0;
      const without_category = (totalUsers || 0) - totalWithCategory;

      // Get total discounts applied
      const { data: discountData } = await supabase
        .from('certificate_payments')
        .select('discount_applied')
        .eq('payment_status', 'completed');

      const total_discounts = discountData?.reduce(
        (sum, payment) => sum + (parseFloat(payment.discount_applied?.toString() || '0')),
        0
      ) || 0;

      setStats({
        ...counts,
        without_category,
        total_discounts,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Regular"
          value={stats.regular}
          icon={Users}
          subtitle="0% descuento"
          className="border-l-4 border-l-blue-500"
        />
        <MetricCard
          title="Premium"
          value={stats.premium}
          icon={Award}
          subtitle="10% descuento"
          className="border-l-4 border-l-purple-500"
        />
        <MetricCard
          title="Corporativo"
          value={stats.corporativo}
          icon={Building2}
          subtitle="20% descuento"
          className="border-l-4 border-l-amber-500"
        />
        <MetricCard
          title="Mayorista"
          value={stats.mayorista}
          icon={ShoppingCart}
          subtitle="30% descuento"
          className="border-l-4 border-l-green-500"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Sin Categoría Asignada"
          value={stats.without_category}
          icon={UserX}
          subtitle="Clientes pendientes"
          className="border-l-4 border-l-orange-500"
        />
        <MetricCard
          title="Descuentos Aplicados"
          value={`$${stats.total_discounts.toLocaleString('es-CO')}`}
          icon={Award}
          subtitle="Total ahorrado por clientes"
          className="border-l-4 border-l-emerald-500"
        />
      </div>
    </div>
  );
}
