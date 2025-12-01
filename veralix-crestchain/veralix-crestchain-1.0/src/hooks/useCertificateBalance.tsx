import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type CertificatePurchase = Database['public']['Tables']['certificate_purchases']['Row'];

interface CertificateBalance {
  totalPurchased: number;
  totalUsed: number;
  available: number;
  lastPurchaseDate: string | null;
  purchases: CertificatePurchase[];
}

export function useCertificateBalance() {
  const [balance, setBalance] = useState<CertificateBalance>({
    totalPurchased: 0,
    totalUsed: 0,
    available: 0,
    lastPurchaseDate: null,
    purchases: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCertificateBalance();
    } else {
      resetBalance();
    }
  }, [user]);

  const resetBalance = () => {
    setBalance({
      totalPurchased: 0,
      totalUsed: 0,
      available: 0,
      lastPurchaseDate: null,
      purchases: []
    });
    setLoading(false);
  };

  const fetchCertificateBalance = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all certificate purchases from dedicated table
      const { data, error } = await supabase
        .from('certificate_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('payment_status', 'completed')
        .order('purchased_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching certificate balance:', error);
        return;
      }

      if (!data || data.length === 0) {
        resetBalance();
        return;
      }

      // Calculate totals from all purchases
      const totalPurchased = data.reduce((sum, purchase) => sum + purchase.certificates_purchased, 0);
      const totalUsed = data.reduce((sum, purchase) => sum + purchase.certificates_used, 0);
      const available = totalPurchased - totalUsed;
      
      // Get most recent purchase date
      const lastPurchaseDate = data[0]?.purchased_at || null;

      setBalance({
        totalPurchased,
        totalUsed,
        available,
        lastPurchaseDate,
        purchases: data
      });
    } catch (error) {
      console.error('Certificate balance fetch error:', error);
      resetBalance();
    } finally {
      setLoading(false);
    }
  };

  const hasAvailableCertificates = () => {
    return balance.available > 0;
  };

  const canCreateCertificates = () => {
    return balance.available > 0;
  };

  const getAvailableCertificates = () => {
    return balance.available;
  };

  const isLowBalance = () => {
    return balance.available > 0 && balance.available <= 5;
  };

  const incrementCertificateUsage = async () => {
    if (!user || balance.available <= 0) {
      throw new Error('No hay certificados disponibles');
    }

    try {
      // Find the oldest purchase with available certificates
      const purchaseWithAvailable = balance.purchases.find(
        purchase => purchase.certificates_used < purchase.certificates_purchased
      );

      if (!purchaseWithAvailable) {
        throw new Error('No se encontró un paquete con certificados disponibles');
      }

      // Increment usage for that purchase
      const { error } = await supabase
        .from('certificate_purchases')
        .update({
          certificates_used: purchaseWithAvailable.certificates_used + 1
        })
        .eq('id', purchaseWithAvailable.id);

      if (error) throw error;

      // Refresh balance
      await fetchCertificateBalance();
    } catch (error) {
      console.error('Error incrementing certificate usage:', error);
      throw error;
    }
  };

  const getPurchaseHistory = () => {
    return balance.purchases.map(purchase => ({
      id: purchase.id,
      packageName: purchase.package_name,
      certificates: purchase.certificates_purchased,
      used: purchase.certificates_used,
      remaining: purchase.certificates_remaining,
      purchaseDate: purchase.purchased_at,
      amount: purchase.amount_paid
    }));
  };

  const getUsagePercentage = () => {
    if (balance.totalPurchased === 0) return 0;
    return Math.round((balance.totalUsed / balance.totalPurchased) * 100);
  };

  return {
    balance,
    loading,
    hasAvailableCertificates,
    canCreateCertificates,
    getAvailableCertificates,
    isLowBalance,
    incrementCertificateUsage,
    getPurchaseHistory,
    getUsagePercentage,
    refetch: fetchCertificateBalance
  };
}
