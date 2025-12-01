import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DirectPaymentData {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerFullName: string;
  redirectUrl: string;
}

export const useWompiDirectPayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPaymentLink = async (data: DirectPaymentData): Promise<string | null> => {
    setLoading(true);
    
    try {
      console.log('🔗 Creating direct payment link:', data);

      const { data: result, error } = await supabase.functions.invoke(
        'create-wompi-payment-link',
        {
          body: data
        }
      );

      if (error) {
        console.error('❌ Error creating payment link:', error);
        throw new Error(error.message || 'Error al crear link de pago');
      }

      if (!result?.success || !result?.paymentUrl) {
        throw new Error('No se recibió URL de pago');
      }

      console.log('✅ Payment link created:', result.paymentUrl);
      return result.paymentUrl;

    } catch (error: any) {
      console.error('💥 Error in createPaymentLink:', error);
      toast({
        title: "Error al crear link de pago",
        description: error.message || "No se pudo generar el link de pago",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const redirectToPayment = (paymentUrl: string) => {
    console.log('🌐 Redirecting to payment:', paymentUrl);
    window.location.href = paymentUrl;
  };

  return {
    loading,
    createPaymentLink,
    redirectToPayment
  };
};
