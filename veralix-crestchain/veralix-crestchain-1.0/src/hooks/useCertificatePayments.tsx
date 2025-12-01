import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBoldPayments } from './useBoldPayments';
import type { Database } from '@/integrations/supabase/types';

type CertificatePaymentRow = Database['public']['Tables']['certificate_payments']['Row'];
type CertificatePaymentInsert = Database['public']['Tables']['certificate_payments']['Insert'];

export interface PaymentInitiationData {
  jewelryItemId: string;
  jewelryName: string;
  jewelryType: string;
  amount: number;
  currency: string;
  pricingId: string;
  clientCategory: string;
  discountApplied: number;
}

export function useCertificatePayments() {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<CertificatePaymentRow[]>([]);
  const { createPaymentIntent, verifyPayment, redirectToPayment } = useBoldPayments();
  const { toast } = useToast();

  // Iniciar proceso de pago para un certificado
  const initiatePayment = async (paymentData: PaymentInitiationData) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Generar order ID único
      const orderId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Crear registro de pago en la base de datos
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('certificate_payments')
        .insert({
          user_id: user.id,
          jewelry_item_id: paymentData.jewelryItemId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          bold_order_id: orderId,
          applied_pricing_id: paymentData.pricingId,
          client_category_applied: paymentData.clientCategory as any,
          discount_applied: paymentData.discountApplied,
          payment_status: 'pending',
          metadata: {
            jewelry_name: paymentData.jewelryName,
            jewelry_type: paymentData.jewelryType
          }
        })
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      // Crear intención de pago con Bold.co
      const paymentResult = await createPaymentIntent({
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: `Certificado NFT - ${paymentData.jewelryName}`,
        planId: 'certificate-payment',
        subscriptionData: {
          payment_record_id: paymentRecord.id,
          jewelry_item_id: paymentData.jewelryItemId,
          jewelry_name: paymentData.jewelryName,
          type: 'certificate_payment'
        }
      });

      if (!paymentResult.success || !paymentResult.paymentUrl) {
        throw new Error(paymentResult.error || 'Error al crear la orden de pago');
      }

      // Actualizar el registro con la URL de pago
      await supabase
        .from('certificate_payments')
        .update({
          bold_payment_url: paymentResult.paymentUrl,
          bold_transaction_id: paymentResult.transactionId
        })
        .eq('id', paymentRecord.id);

      toast({
        title: "Pago iniciado",
        description: "Se ha creado la orden de pago. Serás redirigido a Bold.co",
      });

      return {
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        paymentId: paymentRecord.id,
        orderId
      };

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Error en el pago",
        description: error.message || "No se pudo iniciar el proceso de pago",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Verificar estado del pago
  const checkPaymentStatus = async (orderId: string) => {
    try {
      setLoading(true);

      const { data: paymentRecord, error: recordError } = await supabase
        .from('certificate_payments')
        .select('*')
        .eq('bold_order_id', orderId)
        .single();

      if (recordError) {
        throw recordError;
      }

      // Si ya está pagado, no verificar nuevamente
      if (paymentRecord.payment_status === 'completed') {
        return {
          success: true,
          status: 'completed',
          payment: paymentRecord
        };
      }

      // Verificar con Bold.co
      const verificationResult = await verifyPayment(orderId);

      if (verificationResult.success && verificationResult.status === 'approved') {
        // Actualizar estado en la base de datos
        const { data: updatedPayment, error: updateError } = await supabase
          .from('certificate_payments')
          .update({
            payment_status: 'completed',
            paid_at: new Date().toISOString()
          })
          .eq('id', paymentRecord.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return {
          success: true,
          status: 'completed',
          payment: updatedPayment
        };
      }

      return {
        success: true,
        status: verificationResult.status || 'pending',
        payment: paymentRecord
      };

    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message,
        status: 'error'
      };
    } finally {
      setLoading(false);
    }
  };

  // Cargar pagos del usuario
  const loadUserPayments = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('certificate_payments')
        .select(`
          *,
          jewelry_items (
            id,
            name,
            type,
            materials,
            sale_price,
            currency
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPayments(data || []);

    } catch (error: any) {
      console.error('Error loading payments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar si una joya tiene pago pendiente o completado
  const getPaymentForJewelry = async (jewelryItemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('certificate_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('jewelry_item_id', jewelryItemId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;

    } catch (error: any) {
      console.error('Error checking jewelry payment:', error);
      return null;
    }
  };

  return {
    loading,
    payments,
    initiatePayment,
    checkPaymentStatus,
    loadUserPayments,
    getPaymentForJewelry,
    redirectToPayment
  };
}