import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export interface AnalyticsData {
  totalSales: number;
  totalRevenue: number;
  totalCertificates: number;
  totalListings: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  recentActivity: any[];
}

export interface TimeSeriesData {
  date: string;
  sales: number;
  revenue: number;
  orders: number;
}

export function useAnalytics() {
  const { user } = useAuth();
  const { role, isJoyero, isAdmin } = useUserRole();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalRevenue: 0,
    totalCertificates: 0,
    totalListings: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    recentActivity: []
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Memoize the load function to prevent recreation
  const loadAnalytics = useCallback(async () => {
    // Prevent multiple simultaneous calls (debounce 2 seconds)
    const now = Date.now();
    if (now - lastFetch < 2000) {
      console.log('Analytics: Skipping duplicate call');
      return;
    }
    
    try {
      setLoading(true);
      setLastFetch(now);

      // Get certificates count
      let certificatesQuery = supabase
        .from('nft_certificates')
        .select('*', { count: 'exact', head: true });

      if (!isAdmin) {
        certificatesQuery = certificatesQuery.eq('user_id', user!.id);
      }

      const { count: certificatesCount } = await certificatesQuery;

      // Get listings count
      let listingsQuery = supabase
        .from('marketplace_listings')
        .select('*', { count: 'exact', head: true });

      if (!isAdmin) {
        listingsQuery = listingsQuery.eq('seller_id', user!.id);
      }

      const { count: listingsCount } = await listingsQuery;

      // Get orders data
      let ordersQuery = supabase
        .from('orders')
        .select('*');
      
      if (!isAdmin) {
        ordersQuery = ordersQuery.eq('seller_id', user!.id);
      }

      const { data: orders } = await ordersQuery;

      // Calculate metrics
      const totalOrders = orders?.length || 0;
      const completedOrders = orders?.filter(o => o.order_status === 'completed').length || 0;
      const pendingOrders = orders?.filter(o => o.order_status === 'pending').length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate = listingsCount && listingsCount > 0 ? (totalOrders / listingsCount) * 100 : 0;

      // Get recent activity
      let recentOrdersQuery = supabase
        .from('orders')
        .select(`
          *,
          marketplace_listings(jewelry_items(*))
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!isAdmin) {
        recentOrdersQuery = recentOrdersQuery.eq('seller_id', user!.id);
      }

      const { data: recentOrders } = await recentOrdersQuery;

      // Time series data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let timeSeriesQuery = supabase
        .from('orders')
        .select('created_at, total_amount, order_status')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (!isAdmin) {
        timeSeriesQuery = timeSeriesQuery.eq('seller_id', user!.id);
      }

      const { data: timeSeriesOrders } = await timeSeriesQuery;

      // Process time series data
      const dailyData: { [key: string]: { sales: number; revenue: number; orders: number } } = {};
      
      timeSeriesOrders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { sales: 0, revenue: 0, orders: 0 };
        }
        dailyData[date].orders += 1;
        if (order.order_status === 'completed') {
          dailyData[date].sales += 1;
          dailyData[date].revenue += Number(order.total_amount || 0);
        }
      });

      const timeSeries = Object.entries(dailyData)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setAnalytics({
        totalSales: completedOrders,
        totalRevenue,
        totalCertificates: certificatesCount || 0,
        totalListings: listingsCount || 0,
        totalOrders,
        pendingOrders,
        completedOrders,
        averageOrderValue,
        conversionRate,
        recentActivity: recentOrders || []
      });

      setTimeSeriesData(timeSeries);

    } catch (error) {
      console.error('Error loading analytics:', error);
      // Establecer valores por defecto en caso de error
      setAnalytics({
        totalSales: 0,
        totalRevenue: 0,
        totalCertificates: 0,
        totalListings: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        recentActivity: []
      });
      setTimeSeriesData([]);
    } finally {
      setLoading(false);
    }
  }, [user, isJoyero, isAdmin, lastFetch]);

  // Only load when user/role is available
  useEffect(() => {
    if (user && (isJoyero || isAdmin)) {
      loadAnalytics();
    }
  }, [user?.id, isJoyero, isAdmin, loadAnalytics]);

  // If user is cliente, set loading to false (they use useAdvancedAnalytics instead)
  useEffect(() => {
    if (user && !isJoyero && !isAdmin) {
      setLoading(false);
    }
  }, [user, isJoyero, isAdmin]);

  const refreshAnalytics = useCallback(() => {
    setLastFetch(0); // Reset debounce
    loadAnalytics();
  }, [loadAnalytics]);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => ({
    analytics,
    timeSeriesData,
    loading,
    refreshAnalytics
  }), [analytics, timeSeriesData, loading, refreshAnalytics]);
}
