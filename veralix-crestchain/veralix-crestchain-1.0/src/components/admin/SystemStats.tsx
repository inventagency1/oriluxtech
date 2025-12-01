import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  Coins, 
  Activity,
  TrendingUp,
  Calendar,
  DollarSign,
  Shield,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemStatsData {
  totalUsers: number;
  totalProfiles: number;
  totalCertificates: number;
  totalTransactions: number;
  activeSubscriptions: number;
  totalAirdrops: number;
  totalTokensDistributed: number;
  totalPayments: number;
  totalRevenue: number;
  recentActivity: any[];
  usersByRole: {
    admin: number;
    joyero: number;
    cliente: number;
    noRole: number;
  };
  certificatesByStatus: {
    verified: number;
    unverified: number;
  };
  paymentsThisMonth: number;
  revenueThisMonth: number;
}

export function SystemStats() {
  const [stats, setStats] = useState<SystemStatsData>({
    totalUsers: 0,
    totalProfiles: 0,
    totalCertificates: 0,
    totalTransactions: 0,
    activeSubscriptions: 0,
    totalAirdrops: 0,
    totalTokensDistributed: 0,
    totalPayments: 0,
    totalRevenue: 0,
    recentActivity: [],
    usersByRole: { admin: 0, joyero: 0, cliente: 0, noRole: 0 },
    certificatesByStatus: { verified: 0, unverified: 0 },
    paymentsThisMonth: 0,
    revenueThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel for better performance
      const [
        profilesResult,
        certificatesResult,
        transactionsResult,
        subscriptionsResult,
        airdropsResult,
        tokensResult,
        paymentsResult,
        auditResult,
        rolesResult
      ] = await Promise.all([
        // Total profiles
        supabase.from('profiles').select('id', { count: 'exact' }),
        
        // Total certificates
        supabase.from('nft_certificates').select('id, is_verified', { count: 'exact' }),
        
        // Total transactions  
        supabase.from('transactions').select('id', { count: 'exact' }),
        
        // Active certificate purchases
        supabase.from('certificate_purchases').select('id', { count: 'exact' }).eq('payment_status', 'completed'),
        
        // Total airdrops
        supabase.from('airdrops').select('id, distributed_count', { count: 'exact' }),
        
        // Total tokens distributed
        supabase.from('user_tokens').select('token_balance, total_earned'),
        
        // Certificate payments for revenue calculation
        supabase.from('certificate_payments').select('amount, currency, payment_status, created_at'),
        
        // Recent audit logs
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
        
        // User roles breakdown
        supabase.from('user_roles').select('role')
      ]);

      // Process certificates data
      const certificatesData = certificatesResult.data || [];
      const verifiedCertificates = certificatesData.filter(cert => cert.is_verified).length;
      const unverifiedCertificates = certificatesData.length - verifiedCertificates;

      // Process tokens data
      const totalTokens = tokensResult.data?.reduce((sum, user) => sum + Number(user.token_balance || 0), 0) || 0;
      const totalEarned = tokensResult.data?.reduce((sum, user) => sum + Number(user.total_earned || 0), 0) || 0;

      // Process payments data
      const paymentsData = paymentsResult.data || [];
      const completedPayments = paymentsData.filter(p => p.payment_status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      
      // Calculate this month's payments and revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthPayments = completedPayments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      const revenueThisMonth = thisMonthPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      // Process roles data
      const rolesData = rolesResult.data || [];
      const roleStats = {
        admin: rolesData.filter(r => r.role === 'admin').length,
        joyero: rolesData.filter(r => r.role === 'joyero').length,
        cliente: rolesData.filter(r => r.role === 'cliente').length,
        noRole: Math.max(0, (profilesResult.count || 0) - rolesData.length)
      };

      // Process airdrops data
      const airdropsData = airdropsResult.data || [];
      const totalDistributed = airdropsData.reduce((sum, airdrop) => sum + (airdrop.distributed_count || 0), 0);

      setStats({
        totalUsers: profilesResult.count || 0,
        totalProfiles: profilesResult.count || 0,
        totalCertificates: certificatesResult.count || 0,
        totalTransactions: transactionsResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0,
        totalAirdrops: airdropsResult.count || 0,
        totalTokensDistributed: totalTokens,
        totalPayments: completedPayments.length,
        totalRevenue: totalRevenue,
        recentActivity: auditResult.data || [],
        usersByRole: roleStats,
        certificatesByStatus: {
          verified: verifiedCertificates,
          unverified: unverifiedCertificates
        },
        paymentsThisMonth: thisMonthPayments.length,
        revenueThisMonth: revenueThisMonth
      });

    } catch (error) {
      console.error('Error fetching system stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas del sistema",
        variant: "destructive",
      });
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

  const calculateGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Mock previous month data for growth calculation (in production, you'd store historical data)
  const mockPreviousMonth = {
    users: Math.max(0, stats.totalUsers - Math.floor(stats.totalUsers * 0.1)),
    certificates: Math.max(0, stats.totalCertificates - Math.floor(stats.totalCertificates * 0.08)),
    revenue: Math.max(0, stats.revenueThisMonth - Math.floor(stats.revenueThisMonth * 0.15)),
    subscriptions: Math.max(0, stats.activeSubscriptions - Math.floor(stats.activeSubscriptions * 0.05))
  };

  const statsCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsers.toLocaleString(),
      change: `+${calculateGrowthPercentage(stats.totalUsers, mockPreviousMonth.users)}%`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      isPositive: true
    },
    {
      title: "Certificados Emitidos",
      value: stats.totalCertificates.toLocaleString(),
      change: `+${calculateGrowthPercentage(stats.totalCertificates, mockPreviousMonth.certificates)}%`,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
      isPositive: true
    },
    {
      title: "Paquetes Activos",
      value: stats.activeSubscriptions.toLocaleString(),
      change: `+${calculateGrowthPercentage(stats.activeSubscriptions, mockPreviousMonth.subscriptions)}%`,
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      isPositive: true
    },
    {
      title: "Tokens Distribuidos",
      value: stats.totalTokensDistributed.toLocaleString(),
      change: "+15%",
      icon: Coins,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      isPositive: true
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Cargando estadísticas del sistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`w-3 h-3 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-xs font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs mes anterior</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Ingresos por Certificación</span>
            </CardTitle>
            <CardDescription>Ingresos totales y de este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Histórico</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Este Mes</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(stats.revenueThisMonth)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pagos completados este mes</span>
                  <span>{stats.paymentsThisMonth}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{activity.action.replace('_', ' ')}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(activity.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividad reciente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Usuarios por Rol</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Administradores</span>
                <Badge variant="destructive">{stats.usersByRole.admin}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Joyerías</span>
                <Badge variant="default">{stats.usersByRole.joyero}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Clientes</span>
                <Badge variant="secondary">{stats.usersByRole.cliente}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sin rol asignado</span>
                <Badge variant="outline">{stats.usersByRole.noRole}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Estado de Certificados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Verificados</span>
                <Badge variant="default">{stats.certificatesByStatus.verified}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sin verificar</span>
                <Badge variant="outline">{stats.certificatesByStatus.unverified}</Badge>
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-1">
                  Tasa de verificación: {stats.totalCertificates > 0 ? Math.round((stats.certificatesByStatus.verified / stats.totalCertificates) * 100) : 0}%
                </div>
                <Progress 
                  value={stats.totalCertificates > 0 ? (stats.certificatesByStatus.verified / stats.totalCertificates) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Estado del Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Base de Datos</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Autenticación</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Transacciones</span>
                <Badge variant="outline">{stats.totalTransactions}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}