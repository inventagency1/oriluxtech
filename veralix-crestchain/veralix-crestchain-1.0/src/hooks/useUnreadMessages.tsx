import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UnreadCount {
  orderId: string;
  count: number;
}

export const useUnreadMessages = (orderId?: string) => {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchUnreadCounts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('order_communications_unread')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_communications'
        },
        (payload) => {
          // If new message is not from current user, increment unread
          if (payload.new.sender_id !== user.id) {
            fetchUnreadCounts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUnreadCounts = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all orders for the user (as buyer or seller)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setUnreadCounts({});
        setTotalUnread(0);
        setLoading(false);
        return;
      }

      // For each order, count unread messages
      const counts: Record<string, number> = {};
      let total = 0;

      for (const order of orders) {
        const { count, error: countError } = await supabase
          .from('order_communications')
          .select('*', { count: 'exact', head: true })
          .eq('order_id', order.id)
          .neq('sender_id', user.id);

        if (!countError && count !== null) {
          counts[order.id] = count;
          total += count;
        }
      }

      setUnreadCounts(counts);
      setTotalUnread(total);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = (orderIdParam: string) => {
    return unreadCounts[orderIdParam] || 0;
  };

  const markAsRead = async (orderIdParam: string) => {
    // In a real implementation, we'd mark messages as read in the database
    // For now, we just refresh the counts
    await fetchUnreadCounts();
  };

  return {
    unreadCounts,
    totalUnread,
    loading,
    getUnreadCount,
    markAsRead,
    refresh: fetchUnreadCounts
  };
};
