import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WompiPaymentData {
  amount: number;
  currency: string;
  description: string;
  orderId?: string;
  customerEmail: string;
  paymentMethod?: 'PSE' | 'CARD';
}

interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  orderId?: string;
  status?: string;
  isPaid?: boolean;
  reference?: string;
  amount?: number;
  error?: string;
}

export function useWompiPayments() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPayment = async (data: WompiPaymentData): Promise<PaymentResult> => {
    setLoading(true);
    
    try {
      // Generate unique order ID if not provided
      const orderId = data.orderId || `WOMPI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Get redirect URL (current domain)
      const redirectUrl = `${window.location.origin}/payment-return`;

      console.log('🚀 Creating Wompi payment:', {
        orderId,
        amount: data.amount,
        method: data.paymentMethod || 'PSE'
      });

      const response = await supabase.functions.invoke('wompi-payments', {
        body: {
          action: 'create-payment',
          amount: data.amount,
          currency: data.currency || 'COP',
          description: data.description,
          orderId,
          userId: user.id,
          customerEmail: data.customerEmail || user.email,
          redirectUrl,
          paymentMethod: data.paymentMethod || 'PSE'
        }
      });

      if (response.error) {
        console.error('❌ Wompi payment error:', response.error);
        throw new Error(response.error.message || 'Error creating payment');
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'Payment creation failed');
      }

      console.log('✅ Wompi payment created:', {
        transactionId: result.transactionId,
        orderId: result.orderId
      });

      toast({
        title: "Pago creado",
        description: "Redirigiendo a la pasarela de pago...",
      });

      return {
        success: true,
        paymentUrl: result.paymentUrl,
        transactionId: result.transactionId,
        orderId: result.orderId,
        status: result.status
      };

    } catch (error: any) {
      console.error('❌ Wompi payment creation failed:', error);
      
      let errorMessage = error.message || "No se pudo crear la orden de pago";
      
      if (errorMessage.includes('API keys not configured')) {
        errorMessage = '⚠️ La integración de Wompi no está configurada. Contacta al administrador.';
      } else if (errorMessage.includes('expired') || errorMessage.includes('unauthorized')) {
        errorMessage = 'Sesión expirada. Inicia sesión nuevamente';
      }
      
      toast({
        title: "Error en el pago",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId: string): Promise<PaymentResult> => {
    setLoading(true);
    
    try {
      console.log('🔍 Verifying Wompi payment for order:', orderId);

      // Get pending payment to extract transaction ID
      const { data: pendingPayment, error: pendingError } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (pendingError || !pendingPayment) {
        console.error('❌ Pending payment not found:', pendingError);
        return {
          success: false,
          error: 'Pago pendiente no encontrado'
        };
      }

      const transactionId = (pendingPayment.metadata as any)?.wompi_transaction_id;

      if (!transactionId) {
        console.error('❌ Transaction ID not found in pending payment');
        return {
          success: false,
          error: 'ID de transacción no encontrado'
        };
      }

      // Call edge function to verify with Wompi API
      const response = await supabase.functions.invoke('wompi-payments', {
        body: { 
          action: 'verify-payment',
          transactionId 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      console.log('✅ Payment verified:', {
        transactionId: result.transactionId,
        status: result.status,
        isPaid: result.isPaid
      });

      // If payment is approved, process it
      if (result.success && result.isPaid && result.status === 'APPROVED') {
        await processApprovedPayment(orderId, pendingPayment, result);
      }

      return {
        success: result.success,
        status: result.status,
        isPaid: result.isPaid,
        transactionId: result.transactionId,
        reference: result.reference,
        amount: result.amount,
        orderId: result.reference
      };

    } catch (error: any) {
      console.error('❌ Payment verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  const processApprovedPayment = async (orderId: string, pendingPayment: any, verificationData: any) => {
    try {
      console.log('💳 Processing approved payment:', orderId);

      const metadata = pendingPayment.metadata as any;

      // Create certificate purchase record
      const { error: purchaseError } = await supabase
        .from('certificate_purchases')
        .insert({
          user_id: pendingPayment.user_id,
          package_name: metadata.package_name,
          package_type: metadata.package_id,
          certificates_purchased: metadata.certificates_count,
          certificates_remaining: metadata.certificates_count,
          certificates_used: 0,
          amount_paid: pendingPayment.amount,
          currency: pendingPayment.currency,
          payment_status: 'completed',
          payment_provider: 'wompi',
          transaction_id: verificationData.transactionId,
          purchased_at: new Date().toISOString(),
          metadata: {
            ...metadata,
            wompi_transaction_id: verificationData.transactionId,
            wompi_reference: verificationData.reference,
            verified_at: new Date().toISOString()
          }
        });

      if (purchaseError) {
        console.error('❌ Error creating certificate purchase:', purchaseError);
        throw purchaseError;
      }

      // Delete pending payment
      const { error: deleteError } = await supabase
        .from('pending_payments')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) {
        console.error('⚠️ Error deleting pending payment:', deleteError);
      }

      console.log('✅ Payment processed successfully');

    } catch (error) {
      console.error('❌ Error processing payment:', error);
      toast({
        title: "Error al procesar el pago",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      });
      throw error;
    }
  };

  const redirectToPayment = (paymentUrl: string) => {
    console.log('🔗 Redirecting to Wompi:', paymentUrl);
    window.location.href = paymentUrl;
  };

  return {
    loading,
    isVerifying: loading,
    createPayment,
    verifyPayment,
    redirectToPayment
  };
}
