import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { CreateOrderData } from './useOrders';

interface MarketplacePaymentData {
  orderData: CreateOrderData;
  listingName: string;
}

export const useMarketplaceWompiPayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const createOrderAndPayment = async (data: MarketplacePaymentData): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar una compra",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    
    try {
      console.log('🛍️ Creating marketplace order and payment:', data);

      // 1. Generar order number único
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 2. Crear la orden en la base de datos
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          seller_id: data.orderData.seller_id,
          marketplace_listing_id: data.orderData.marketplace_listing_id,
          order_number: orderNumber,
          total_amount: data.orderData.total_amount,
          currency: data.orderData.currency,
          shipping_address: data.orderData.shipping_address as any,
          billing_address: data.orderData.billing_address as any,
          notes: data.orderData.notes,
          payment_status: 'pending',
          order_status: 'pending',
        }])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw new Error('No se pudo crear la orden');
      }

      console.log('✅ Order created:', newOrder.id);

      // 3. Crear pending_payment
      const amountInCents = Math.round(data.orderData.total_amount * 100);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: pendingPaymentError } = await supabase
        .from('pending_payments')
        .insert({
          user_id: user.id,
          order_id: orderNumber,
          amount: amountInCents,
          currency: data.orderData.currency,
          payment_type: 'marketplace_order',
          expires_at: expiresAt.toISOString(),
          metadata: {
            listing_id: data.orderData.marketplace_listing_id,
            order_db_id: newOrder.id,
            listing_name: data.listingName,
          }
        });

      if (pendingPaymentError) {
        console.error('❌ Error creating pending payment:', pendingPaymentError);
        throw new Error('No se pudo registrar el pago pendiente');
      }

      console.log('✅ Pending payment created');

      // 4. Obtener datos del perfil para Wompi
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .single();

      const customerFullName = profile?.full_name || user.email?.split('@')[0] || 'Cliente Veralix';
      const customerEmail = profile?.email || user.email || '';

      // 5. Crear payment link con Wompi
      const redirectUrl = `${window.location.origin}/payment-return`;

      const { data: result, error: paymentLinkError } = await supabase.functions.invoke(
        'create-wompi-payment-link',
        {
          body: {
            orderId: orderNumber,
            amount: amountInCents,
            currency: data.orderData.currency,
            customerEmail,
            customerFullName,
            redirectUrl,
            paymentType: 'marketplace_order',
            description: `Compra: ${data.listingName}`,
          }
        }
      );

      if (paymentLinkError || !result?.success) {
        console.error('❌ Error creating payment link:', paymentLinkError);
        throw new Error('No se pudo generar el link de pago');
      }

      console.log('✅ Payment link created:', result.paymentUrl);

      toast({
        title: "Orden creada",
        description: "Redirigiendo a la pasarela de pago...",
      });

      return result.paymentUrl;

    } catch (error: any) {
      console.error('💥 Error in createOrderAndPayment:', error);
      toast({
        title: "Error al procesar el pago",
        description: error.message || "No se pudo crear la orden de pago",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createOrderAndPayment,
  };
};
