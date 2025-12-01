import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  marketplace_listing_id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: string;
  payment_reference?: string;
  bold_payment_id?: string;
  bold_transaction_id?: string;
  wompi_transaction_id?: string;
  wompi_status?: string;
  shipping_address?: Address;
  billing_address?: Address;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
  // Related data
  listing?: {
    id: string;
    jewelry_item: {
      id: string;
      name: string;
      type: string;
      materials: string[];
      images_count: number;
    };
    seller: {
      full_name: string;
      business_name?: string;
      email: string;
    };
  };
  buyer?: {
    full_name: string;
    email: string;
  };
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  marketplace_listing_id: string;
  jewelry_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CreateOrderData {
  marketplace_listing_id: string;
  seller_id: string;
  total_amount: number;
  currency: string;
  shipping_address: Address;
  billing_address: Address;
  notes?: string;
}

// Global debounce variables shared across all hook instances
let globalFetchPromise: Promise<Order[]> | null = null;
let globalLastFetch = 0;

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize fetch function to prevent recreation
  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    const now = Date.now();
    
    // If there's an ongoing fetch, wait for it
    if (globalFetchPromise) {
      console.log('Orders: Waiting for existing fetch to complete');
      try {
        const result = await globalFetchPromise;
        setOrders(result);
        setLoading(false);
      } catch (err) {
        console.error('Error waiting for orders:', err);
        setLoading(false);
      }
      return;
    }
    
    // Global debounce of 3 seconds
    if (now - globalLastFetch < 3000) {
      console.log('Orders: Skipping duplicate call (global debounce)');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      globalLastFetch = now;

      // Create shared promise
      globalFetchPromise = (async () => {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('buyer_id', user?.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        const formattedOrders: Order[] = (ordersData || []).map(order => ({
          ...order,
          payment_status: order.payment_status as Order['payment_status'],
          order_status: order.order_status as Order['order_status'],
          shipping_address: (order.shipping_address as unknown) as Address,
          billing_address: (order.billing_address as unknown) as Address,
        }));

        return formattedOrders;
      })();

      const result = await globalFetchPromise;
      setOrders(result);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar las órdenes');
      // Toast removed to prevent spam
    } finally {
      setLoading(false);
      globalFetchPromise = null; // Clear global promise
    }
  }, [user]);

  // Only fetch when user is available
  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  const fetchOrdersBySeller = useCallback(async (sellerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const formattedOrders: Order[] = (ordersData || []).map(order => ({
        ...order,
        payment_status: order.payment_status as Order['payment_status'],
        order_status: order.order_status as Order['order_status'],
        shipping_address: (order.shipping_address as unknown) as Address,
        billing_address: (order.billing_address as unknown) as Address,
      }));

      setOrders(formattedOrders);
    } catch (err) {
      console.error('Error fetching orders by seller:', err);
      setError('Error al cargar las órdenes del vendedor');
      toast.error('Error al cargar las órdenes del vendedor');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Add timestamps based on status changes
      if (updates.order_status === 'delivered') {
        updateData.completed_at = new Date().toISOString();
      } else if (updates.order_status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      // Remove nested objects that don't belong in the orders table
      delete updateData.listing;
      delete updateData.buyer;
      delete updateData.items;

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('seller_id', user.id); // Ensure user can only update their own orders as seller

      if (error) throw error;

      // Update local state
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData }
          : order
      );
      setOrders(updatedOrders);

      toast.success('Orden actualizada exitosamente');
      return { success: true, data: null };
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Error al actualizar la orden');
      return { success: false, error: err };
    }
  };

  const createCommunication = async (orderId: string, messageData: {
    message: string;
    message_type: string;
  }) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const { data, error } = await supabase
        .from('order_communications')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          message: messageData.message,
          message_type: messageData.message_type,
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Mensaje enviado exitosamente');
      return { success: true, data };
    } catch (err) {
      console.error('Error creating communication:', err);
      toast.error('Error al enviar mensaje');
      return { success: false, error: err };
    }
  };

  const createOrder = async (orderData: CreateOrderData) => {
    if (!user) {
      toast.error('Debes iniciar sesión para realizar una compra');
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      // Generate order number
      const { data: orderNumber, error: numberError } = await supabase
        .rpc('generate_order_number');

      if (numberError) throw numberError;

      const newOrder = {
        order_number: orderNumber || `ORD-${Date.now()}`,
        buyer_id: user.id,
        seller_id: orderData.seller_id,
        marketplace_listing_id: orderData.marketplace_listing_id,
        total_amount: orderData.total_amount,
        currency: orderData.currency,
        shipping_address: orderData.shipping_address as any,
        billing_address: orderData.billing_address as any,
        notes: orderData.notes,
        payment_status: 'pending' as const,
        order_status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select(`
          *,
          listing:marketplace_listings(
            id,
            jewelry_item:jewelry_items(
              id,
              name,
              type
            )
          )
        `)
        .single();

      if (error) throw error;

      // Create order item
      await supabase
        .from('order_items')
        .insert({
          order_id: data.id,
          marketplace_listing_id: orderData.marketplace_listing_id,
          jewelry_item_id: (data as any).listing.jewelry_item.id,
          quantity: 1,
          unit_price: orderData.total_amount,
          total_price: orderData.total_amount
        });

      // Send notification to seller
      await supabase
        .from('notifications')
        .insert({
          user_id: orderData.seller_id,
          type: 'new_order',
          title: 'Nueva orden recibida',
          message: `Has recibido una nueva orden`,
          action_url: `/orders/${data.id}`,
          data: {
            order_id: data.id,
            order_number: data.order_number,
            buyer_id: user.id
          }
        });

      // Fetch buyer and seller profiles for emails
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('user_id', user.id)
        .single();

      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('user_id', orderData.seller_id)
        .single();

      // Send order confirmation emails
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'order_confirmation',
          orderId: data.id,
          orderNumber: data.order_number,
          buyerEmail: buyerProfile?.email,
          buyerName: buyerProfile?.full_name,
          sellerEmail: sellerProfile?.email,
          sellerName: sellerProfile?.full_name,
          jewelryName: (data as any).listing.jewelry_item.name,
          amount: orderData.total_amount,
          currency: orderData.currency,
          shippingAddress: orderData.shipping_address
        }
      });

      if (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail order creation if email fails
      }

      toast.success('Orden creada exitosamente');
      await fetchOrders();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error('Error al crear la orden');
      return { success: false, error: err };
    }
  };

  const initiatePayment = async (orderId: string, paymentMethod: 'bold' | 'wompi' | 'manual' = 'wompi') => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('Initiating payment for order:', orderId);

      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          orderId,
          paymentMethod,
          returnUrl: `${window.location.origin}/payment-return`
        }
      });

      if (error) throw error;

      return {
        success: data.success,
        paymentUrl: data.paymentUrl,
        reference: data.reference
      };
    } catch (error) {
      console.error('Error initiating payment:', error);
      return { success: false, error };
    }
  };

  const updateOrderStatus = async (orderId: string, orderStatus: Order['order_status']) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const updateData: any = {
        order_status: orderStatus,
        updated_at: new Date().toISOString()
      };

      // Add completion/cancellation timestamps
      if (orderStatus === 'delivered') {
        updateData.completed_at = new Date().toISOString();
      } else if (orderStatus === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Fetch order details with profiles for email
      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          *,
          listing:marketplace_listings(
            jewelry_item:jewelry_items(name)
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderData) {
        const { data: buyerProfile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', orderData.buyer_id)
          .single();

        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', orderData.seller_id)
          .single();

        // Send status update email
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'order_status_update',
            orderId: orderId,
            orderNumber: orderData.order_number,
            buyerEmail: buyerProfile?.email,
            sellerEmail: sellerProfile?.email,
            jewelryName: (orderData as any).listing?.jewelry_item?.name,
            orderStatus: orderStatus,
            previousStatus: orderData.order_status
          }
        }).catch(err => {
          console.error('Error sending status update email:', err);
          // Don't fail status update if email fails
        });
      }

      // Update local state
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData }
          : order
      );
      setOrders(updatedOrders);

      toast.success('Estado de orden actualizado');
      return { success: true, data: null };
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Error al actualizar el estado de la orden');
      return { success: false, error: err };
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status'], paymentData?: {
    payment_method?: string;
    payment_reference?: string;
    bold_payment_id?: string;
    bold_transaction_id?: string;
  }) => {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
        ...paymentData
      };

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Send payment confirmation email if payment completed
      if (paymentStatus === 'completed') {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderData) {
          const { data: buyerProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('user_id', orderData.buyer_id)
            .single();

          await supabase.functions.invoke('send-email', {
            body: {
              type: 'payment_confirmation',
              orderId: orderId,
              orderNumber: orderData.order_number,
              buyerEmail: buyerProfile?.email,
              buyerName: buyerProfile?.full_name,
              amount: orderData.total_amount,
              currency: orderData.currency,
              paymentReference: paymentData?.payment_reference,
              paymentMethod: paymentData?.payment_method
            }
          }).catch(err => {
            console.error('Error sending payment confirmation email:', err);
            // Don't fail payment update if email fails
          });
        }
      }

      // Update local state
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData }
          : order
      );
      setOrders(updatedOrders);

      return { success: true, data: null };
    } catch (err) {
      console.error('Error updating payment status:', err);
      return { success: false, error: err };
    }
  };

  const cancelOrder = async (orderId: string, reason?: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const updateData = {
        order_status: 'cancelled' as const,
        payment_status: 'cancelled' as const,
        cancelled_at: new Date().toISOString(),
        notes: reason ? `Cancelado: ${reason}` : 'Orden cancelada',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`); // Allow both buyer and seller to cancel

      if (error) throw error;

      // Update local state
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData }
          : order
      );
      setOrders(updatedOrders);

      // Send cancellation email to both buyer and seller
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select(`
            *,
            listing:marketplace_listings(
              jewelry_item:jewelry_items(name)
            )
          `)
          .eq('id', orderId)
          .single();

        if (orderData) {
          const { data: buyerProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('user_id', orderData.buyer_id)
            .single();

          const { data: sellerProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('user_id', orderData.seller_id)
            .single();

          const cancelledBy = user.id === orderData.buyer_id ? 'buyer' : 
                             user.id === orderData.seller_id ? 'seller' : 'system';

          const emailData = {
            orderNumber: orderData.order_number,
            buyerName: buyerProfile?.full_name || 'Comprador',
            sellerName: sellerProfile?.full_name || 'Vendedor',
            totalAmount: orderData.total_amount.toString(),
            currency: orderData.currency,
            cancelledBy,
            cancellationReason: reason,
            refundInfo: orderData.payment_status === 'completed' 
              ? 'El reembolso será procesado en 5-10 días hábiles.'
              : undefined,
            orderDate: new Date(orderData.created_at).toLocaleDateString('es-CO'),
          };

          // Send to buyer
          if (buyerProfile?.email) {
            await supabase.functions.invoke('send-email', {
              body: {
                type: 'order_cancelled',
                to: buyerProfile.email,
                data: { ...emailData, recipientRole: 'buyer' }
              }
            });
          }

          // Send to seller
          if (sellerProfile?.email) {
            await supabase.functions.invoke('send-email', {
              body: {
                type: 'order_cancelled',
                to: sellerProfile.email,
                data: { ...emailData, recipientRole: 'seller' }
              }
            });
          }
        }
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
      }

      toast.success('Orden cancelada exitosamente');
      return { success: true, data: null };
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error('Error al cancelar la orden');
      return { success: false, error: err };
    }
  };

  // Memoize filtered results
  const buyerOrders = useMemo(() => 
    orders.filter(order => order.buyer_id === user?.id),
    [orders, user?.id]
  );

  const sellerOrders = useMemo(() => 
    orders.filter(order => order.seller_id === user?.id),
    [orders, user?.id]
  );

  const getBuyerOrders = useCallback(() => buyerOrders, [buyerOrders]);
  const getSellerOrders = useCallback(() => sellerOrders, [sellerOrders]);

  const getOrdersByStatus = useCallback((status: Order['order_status']) => {
    return orders.filter(order => order.order_status === status);
  }, [orders]);

  const getOrdersByPaymentStatus = useCallback((status: Order['payment_status']) => {
    return orders.filter(order => order.payment_status === status);
  }, [orders]);

  const formatPrice = useCallback((price: number, currency: string = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  return useMemo(() => ({
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrdersBySeller,
    createOrder,
    initiatePayment,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    createCommunication,
    getBuyerOrders,
    getSellerOrders,
    getOrdersByStatus,
    getOrdersByPaymentStatus,
    formatPrice
  }), [
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrdersBySeller,
    getBuyerOrders,
    getSellerOrders,
    getOrdersByStatus,
    getOrdersByPaymentStatus,
    formatPrice
  ]);
};