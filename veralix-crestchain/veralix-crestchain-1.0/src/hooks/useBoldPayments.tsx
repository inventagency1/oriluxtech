import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentIntentData {
  amount: number;
  currency: string;
  description: string;
  planId: string;
  subscriptionData: any;
  orderId?: string; // Opcional: si no se proporciona, se generará uno automático
}

interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  paymentLink?: string; // Bold payment link ID (LNK_*)
  transactionId?: string;
  orderId?: string;
  status?: string;
  isPaid?: boolean;
  amount?: number;
  reference?: string;
  error?: string;
}

export function useBoldPayments() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPaymentIntent = async (data: PaymentIntentData): Promise<PaymentResult> => {
    setLoading(true);
    
    try {
      // Use provided orderId or generate a unique one
      const orderId = data.orderId || `VRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await supabase.functions.invoke('bold-payments', {
        body: {
          action: 'create-payment-intent',
          ...data,
          orderId,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (response.error) {
        console.error('Payment intent error:', response.error);
        throw new Error(response.error.message || 'Error creating payment intent');
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'Payment creation failed');
      }

      return {
        success: true,
        paymentUrl: result.paymentUrl,
        paymentLink: result.paymentLink,
        transactionId: result.transactionId || result.paymentLink,
        orderId: result.orderId || orderId
      };

    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      
      // Improve error messages
      let errorMessage = error.message || "No se pudo crear la orden de pago";
      
      if (errorMessage.includes('Bold API key not configured')) {
        errorMessage = '⚠️ La integración de pagos Bold.co no está configurada. Contacta al administrador para configurar la API Key.';
      } else if (errorMessage.includes('Bold API error: 403')) {
        errorMessage = '🔑 La API Key de Bold.co es inválida o no tiene permisos. Verifica tu API Key en el dashboard de Bold.co.';
      } else if (errorMessage.includes('Bold API error')) {
        errorMessage = '❌ Error de conexión con Bold.co. Verifica que la API Key sea correcta y tenga los permisos necesarios.';
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
    try {
      const response = await supabase.functions.invoke('bold-payments', {
        body: { 
          action: 'verify-payment',
          orderId 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;

    } catch (error: any) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const redirectToPayment = (paymentUrl: string) => {
    // Open payment URL in same window to handle the payment flow
    window.location.href = paymentUrl;
  };

  return {
    loading,
    createPaymentIntent,
    verifyPayment,
    redirectToPayment
  };
}