import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCertificateBalance } from '@/hooks/useCertificateBalance';

interface PurchaseHistory {
  id: string;
  package_name: string;
  certificates_count: number;
  amount: number;
  currency: string;
  purchased_at: string;
  status: string;
}

export function useCertificatePurchase() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { refetch } = useCertificateBalance();

  const getPurchaseHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('certificate_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('payment_status', 'completed')
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      const history: PurchaseHistory[] = (data || []).map(purchase => ({
        id: purchase.id,
        package_name: purchase.package_name,
        certificates_count: purchase.certificates_purchased,
        amount: purchase.amount_paid,
        currency: purchase.currency,
        purchased_at: purchase.purchased_at,
        status: purchase.payment_status
      }));

      return history;

    } catch (error: any) {
      console.error('Error fetching purchase history:', error);
      toast({
        title: "Error",
        description: error.message || 'No se pudo cargar el historial de compras',
        variant: "destructive",
      });
      return [];
    }
  };

  const getTransactionDetails = async (transactionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return data;

    } catch (error: any) {
      console.error('Error fetching transaction details:', error);
      toast({
        title: "Error",
        description: error.message || 'No se pudo cargar los detalles de la transacción',
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    loading,
    getPurchaseHistory,
    getTransactionDetails
  };
}
