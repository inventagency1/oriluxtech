import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import {
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Coins,
  FileText,
  UserCog,
  DollarSign,
  Activity,
  Database,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserManagement } from "./admin/UserManagement";
import { PricingManagement } from "./admin/PricingManagement";
import { SystemStats } from "./admin/SystemStats";
import { AirdropManagement } from "./admin/AirdropManagement";
import { CategoryManagement } from "./admin/CategoryManagement";
import { MarketplaceCleanupPanel } from "./admin/MarketplaceCleanupPanel";
import { ProductManagement } from "./admin/ProductManagement";
import SubscriptionsOverview from "@/pages/admin/SubscriptionsOverview";
import { AssignCertificateForm } from "./admin/AssignCertificateForm";
import { AdminCertificateAssignment } from "./admin/AdminCertificateAssignment";

interface DashboardStats {
  totalUsers: number;
  totalCertificates: number;
  monthlyRevenue: number;
  totalTransactions: number;
  activeSubscriptions: number;
  recentGrowth: {
    users: number;
    certificates: number;
    revenue: number;
    transactions: number;
  };
}

export function AdminDashboard() {
  // v2.0 - Added certificate assignments tab
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCertificates: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    activeSubscriptions: 0,
    recentGrowth: {
      users: 0,
      certificates: 0,
      revenue: 0,
      transactions: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const [
        usersResult,
        certificatesResult,
        transactionsResult,
        activePurchasesResult,
        paymentsResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('nft_certificates').select('id', { count: 'exact' }),
        supabase.from('transactions').select('id', { count: 'exact' }),
        supabase.from('certificate_purchases').select('id', { count: 'exact' }).eq('payment_status', 'completed'),
        supabase.from('certificate_payments').select('amount, currency, payment_status, created_at')
      ]);

      // Calculate revenue
      const completedPayments = paymentsResult.data?.filter(p => p.payment_status === 'completed') || [];
      const totalRevenue = completedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      // Calculate this month's revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthPayments = completedPayments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      const monthlyRevenue = thisMonthPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      // Mock growth calculations (in production, you'd compare with previous period data)
      const mockGrowth = {
        users: Math.floor(Math.random() * 20) + 5, // 5-25% growth
        certificates: Math.floor(Math.random() * 15) + 3, // 3-18% growth
        revenue: Math.floor(Math.random() * 30) + 10, // 10-40% growth
        transactions: Math.floor(Math.random() * 12) + 5 // 5-17% growth
      };

      setStats({
        totalUsers: usersResult.count || 0,
        totalCertificates: certificatesResult.count || 0,
        monthlyRevenue: monthlyRevenue,
        totalTransactions: transactionsResult.count || 0,
        activeSubscriptions: activePurchasesResult.count || 0,
        recentGrowth: mockGrowth
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statsCards = [
    {
      title: "Total Usuarios",
      value: loading ? "..." : stats.totalUsers.toLocaleString(),
      change: `+${stats.recentGrowth.users}%`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Certificados Activos", 
      value: loading ? "..." : stats.totalCertificates.toLocaleString(),
      change: `+${stats.recentGrowth.certificates}%`,
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Ingresos del Mes",
      value: loading ? "..." : formatCurrency(stats.monthlyRevenue),
      change: `+${stats.recentGrowth.revenue}%`,
      icon: DollarSign,
      color: "text-emerald-600"
    },
    {
      title: "Transacciones",
      value: loading ? "..." : stats.totalTransactions.toLocaleString(),
      change: `+${stats.recentGrowth.transactions}%`,
      icon: Activity,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-3 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading bg-gradient-gold bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Gestiona todo el sistema Veralix desde un solo lugar
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Badge variant="secondary" className="bg-gradient-gold text-primary-foreground text-xs">
            <Shield className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            <span className="hidden sm:inline">Super </span>Admin
          </Badge>
          <AssignCertificateForm />
          <Button variant="outline" size="sm" onClick={fetchDashboardStats} disabled={loading}>
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
        </div>
      </div>

      {/* Overview Stats - Premium Design */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {statsCards.map((stat, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden shadow-veralix-premium border-border/50 hover:shadow-veralix-gold hover:scale-[1.02] transition-premium animate-fade-scale"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-veralix-gold opacity-0 group-hover:opacity-5 transition-opacity" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold font-heading bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                        <span className="text-base">↗</span>
                        {stat.change}
                      </div>
                      <p className="text-xs text-muted-foreground">vs mes anterior</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        {/* Mobile Select Dropdown */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full bg-background border-border h-11">
              <SelectValue placeholder="Selecciona una sección" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              <SelectItem value="overview">📊 General</SelectItem>
              <SelectItem value="packages">📦 Paquetes</SelectItem>
              <SelectItem value="users">👥 Usuarios</SelectItem>
              <SelectItem value="pricing">💰 Precios</SelectItem>
              {FEATURE_FLAGS.AIRDROP_ENABLED && (
                <SelectItem value="airdrops">🪙 Airdrops</SelectItem>
              )}
              <SelectItem value="categories">⚙️ Categorías</SelectItem>
              <SelectItem value="marketplace-cleanup">🧹 Marketplace</SelectItem>
              <SelectItem value="certificate-assignments">🎫 Asignaciones</SelectItem>
              <SelectItem value="system">🗄️ Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <TabsList className="inline-flex w-max md:grid md:w-full md:grid-cols-10 h-auto p-0.5 gap-0.5">
            <TabsTrigger value="overview" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm">General</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm">Paquetes</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm">Precios</span>
            </TabsTrigger>
            {FEATURE_FLAGS.AIRDROP_ENABLED && (
              <TabsTrigger value="airdrops" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-[9px] sm:text-xs md:text-sm">Airdrops</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="categories" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
              <UserCog className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm">Categorías</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace-cleanup" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm">Limpieza</span>
            </TabsTrigger>
            <TabsTrigger value="certificate-assignments" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm">Asignaciones</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-1 px-1.5 sm:px-3 py-2 whitespace-nowrap">
              <Database className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm">Sistema</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <SystemStats />
        </TabsContent>

        <TabsContent value="packages">
          <SubscriptionsOverview />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingManagement />
        </TabsContent>

        {FEATURE_FLAGS.AIRDROP_ENABLED && (
          <TabsContent value="airdrops">
            <AirdropManagement />
          </TabsContent>
        )}

        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="marketplace-cleanup">
          <MarketplaceCleanupPanel />
        </TabsContent>

        <TabsContent value="certificate-assignments">
          <AdminCertificateAssignment />
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Configuración del Sistema</span>
              </CardTitle>
              <CardDescription>
                Configuración avanzada y parámetros del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Base de Datos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Estado</span>
                        <Badge variant="default">Operativo</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Conexiones activas</span>
                        <span className="text-sm font-medium">12/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Almacenamiento usado</span>
                        <span className="text-sm font-medium">2.3 GB</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Rendimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Tiempo respuesta API</span>
                        <span className="text-sm font-medium text-green-600">142ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Uptime</span>
                        <span className="text-sm font-medium text-green-600">99.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Requests/min</span>
                        <span className="text-sm font-medium">284</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Acciones del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={fetchDashboardStats}>
                        <Activity className="w-4 h-4 mr-2" />
                        Actualizar Estadísticas
                      </Button>
                      <Button variant="outline" disabled>
                        <Database className="w-4 h-4 mr-2" />
                        Backup Base de Datos
                      </Button>
                      <Button variant="outline" disabled>
                        <Shield className="w-4 h-4 mr-2" />
                        Limpiar Cache
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}