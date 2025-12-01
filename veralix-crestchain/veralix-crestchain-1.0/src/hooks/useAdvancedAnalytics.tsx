import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TopProduct {
  id: string;
  name: string;
  image_url: string;
  sales: number;
  revenue: number;
  rating: number;
  views: number;
  conversion: number;
}

export interface ConversionFunnel {
  views: number;
  likes: number;
  orders: number;
  completed: number;
}

export interface CollectionStats {
  totalValue: number;
  totalItems: number;
  certificatesOwned: number;
  byType: { type: string; count: number; value: number }[];
}

export interface PlatformMetrics {
  totalUsers: number;
  activeJewelers: number;
  activeClients: number;
  gmv: number;
  averageOrderValue: number;
  topJewelers: { id: string; name: string; revenue: number; rating: number }[];
}

export const useAdvancedAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [collectionStats, setCollectionStats] = useState<CollectionStats | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);

  // Top Selling Products (para joyerías)
  const fetchTopProducts = useCallback(async (limit = 5) => {
    if (!user) return;

    const { data: listings, error } = await supabase
      .from('marketplace_listings')
      .select(`
        id,
        jewelry_item_id,
        price,
        views,
        likes,
        average_rating,
        jewelry_items!inner(name, main_image_url)
      `)
      .eq('seller_id', user.id)
      .eq('status', 'active')
      .order('views', { ascending: false })
      .limit(limit);

    if (error || !listings) return;

    // Calcular ventas por producto
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('marketplace_listing_id, quantity, total_price')
      .in('marketplace_listing_id', listings.map(l => l.id));

    const productsWithSales = listings.map(listing => {
      const sales = orderItems?.filter(oi => oi.marketplace_listing_id === listing.id) || [];
      const totalSales = sales.reduce((sum, s) => sum + s.quantity, 0);
      const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_price), 0);
      const conversion = listing.views > 0 ? (totalSales / listing.views) * 100 : 0;

      return {
        id: listing.id,
        name: listing.jewelry_items.name,
        image_url: listing.jewelry_items.main_image_url || '',
        sales: totalSales,
        revenue: totalRevenue,
        rating: Number(listing.average_rating) || 0,
        views: listing.views,
        conversion: Number(conversion.toFixed(2))
      };
    });

    setTopProducts(productsWithSales.sort((a, b) => b.revenue - a.revenue));
  }, [user]);

  // Conversion Funnel (para joyerías)
  const fetchConversionFunnel = useCallback(async () => {
    if (!user) return;

    const { data: listings } = await supabase
      .from('marketplace_listings')
      .select('id, views, likes')
      .eq('seller_id', user.id);

    const totalViews = listings?.reduce((sum, l) => sum + l.views, 0) || 0;
    const totalLikes = listings?.reduce((sum, l) => sum + l.likes, 0) || 0;

    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_status')
      .eq('seller_id', user.id);

    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(o => o.order_status === 'completed').length || 0;

    setConversionFunnel({
      views: totalViews,
      likes: totalLikes,
      orders: totalOrders,
      completed: completedOrders
    });
  }, [user]);

  // Collection Stats (para clientes)
  const fetchCollectionStats = useCallback(async () => {
    if (!user) return;

    // Obtener órdenes completadas del cliente
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        order_items!inner(
          jewelry_item_id,
          total_price,
          jewelry_items!inner(type)
        )
      `)
      .eq('buyer_id', user.id)
      .eq('order_status', 'completed');

    const totalValue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const totalItems = orders?.reduce((sum, o) => sum + o.order_items.length, 0) || 0;

    // Certificados en posesión
    const { data: certificates } = await supabase
      .from('nft_certificates')
      .select('id')
      .eq('owner_id', user.id);

    const certificatesOwned = certificates?.length || 0;

    // Distribución por tipo
    const typeMap = new Map<string, { count: number; value: number }>();
    orders?.forEach(order => {
      order.order_items.forEach(item => {
        const type = item.jewelry_items.type;
        const current = typeMap.get(type) || { count: 0, value: 0 };
        typeMap.set(type, {
          count: current.count + 1,
          value: current.value + Number(item.total_price)
        });
      });
    });

    const byType = Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      ...data
    }));

    setCollectionStats({
      totalValue,
      totalItems,
      certificatesOwned,
      byType
    });
  }, [user]);

  // Platform Metrics (para admins)
  const fetchPlatformMetrics = useCallback(async () => {
    // Total usuarios
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Joyerías activas (con al menos un listing)
    const { data: activeJewelersData } = await supabase
      .from('marketplace_listings')
      .select('seller_id')
      .eq('status', 'active');

    const uniqueJewelers = new Set(activeJewelersData?.map(l => l.seller_id) || []);
    const activeJewelers = uniqueJewelers.size;

    // Clientes activos (con al menos una orden)
    const { data: activeClientsData } = await supabase
      .from('orders')
      .select('buyer_id');

    const uniqueClients = new Set(activeClientsData?.map(o => o.buyer_id) || []);
    const activeClients = uniqueClients.size;

    // GMV (Gross Merchandise Value)
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('order_status', 'completed');

    const gmv = completedOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const averageOrderValue = completedOrders && completedOrders.length > 0
      ? gmv / completedOrders.length
      : 0;

    // Top Jewelers - obtener sellers de órdenes completadas
    const { data: sellerOrders } = await supabase
      .from('orders')
      .select('seller_id, total_amount')
      .eq('order_status', 'completed');

    const sellerMap = new Map<string, { revenue: number }>();
    sellerOrders?.forEach(order => {
      const current = sellerMap.get(order.seller_id) || { revenue: 0 };
      sellerMap.set(order.seller_id, {
        revenue: current.revenue + Number(order.total_amount)
      });
    });

    // Obtener nombres de los sellers
    const sellerIds = Array.from(sellerMap.keys());
    const { data: sellerProfiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', sellerIds);

    const profileMap = new Map(
      sellerProfiles?.map(p => [p.user_id, p.full_name || 'Usuario']) || []
    );

    const topJewelers = Array.from(sellerMap.entries())
      .map(([id, data]) => ({ 
        id, 
        name: profileMap.get(id) || 'Usuario',
        revenue: data.revenue,
        rating: 0 
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setPlatformMetrics({
      totalUsers: totalUsers || 0,
      activeJewelers,
      activeClients,
      gmv,
      averageOrderValue,
      topJewelers
    });
  }, []);

  const loadAll = useCallback(async (role: string) => {
    setLoading(true);
    try {
      if (role === 'joyero') {
        await Promise.all([fetchTopProducts(), fetchConversionFunnel()]);
      } else if (role === 'cliente') {
        await fetchCollectionStats();
      } else if (role === 'admin') {
        await fetchPlatformMetrics();
      }
    } finally {
      setLoading(false);
    }
  }, [fetchTopProducts, fetchConversionFunnel, fetchCollectionStats, fetchPlatformMetrics]);

  return {
    loading,
    topProducts,
    conversionFunnel,
    collectionStats,
    platformMetrics,
    loadAll,
    refreshTopProducts: fetchTopProducts,
    refreshFunnel: fetchConversionFunnel,
    refreshCollection: fetchCollectionStats,
    refreshPlatform: fetchPlatformMetrics
  };
};
