/**
 * @deprecated Este hook está deprecado y será eliminado en v2.0
 * 
 * MIGRACIÓN:
 * - Para balance de certificados: usar useCertificateBalance()
 * - Para historial de compras: usar useCertificatePurchase()
 * 
 * Este hook aún existe solo para compatibilidad con SubscriptionMigrationBanner
 * que verifica si el usuario tiene datos antiguos en la tabla 'subscriptions'.
 * Las queries internas NO se modificaron para mantener esta funcionalidad.
 * 
 * @see useCertificateBalance Para nueva funcionalidad de balance
 * @see useCertificatePurchase Para historial de compras
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionPlan = Database['public']['Enums']['subscription_plan'];
type SubscriptionStatus = Database['public']['Enums']['subscription_status'];

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Subscription fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // NOTE: Subscriptions can only be created via edge function using 
  // create_subscription_from_payment() SQL function after successful payment.
  // This maintains RLS security policies and ensures proper payment validation.
  // Direct INSERT to subscriptions table is blocked by RLS policies.

  const cancelSubscription = async () => {
    if (!subscription) return;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled' as SubscriptionStatus,
        canceled_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (error) throw error;

    await fetchSubscription();
  };

  const hasActivePlan = () => {
    return subscription && subscription.status === 'active';
  };

  const canCreateCertificates = () => {
    if (!subscription) return false;
    return subscription.certificates_used < subscription.certificates_limit;
  };

  const getRemainingCertificates = () => {
    if (!subscription) return 0;
    return subscription.certificates_limit - subscription.certificates_used;
  };

  const incrementCertificateUsage = async () => {
    if (!subscription) return;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        certificates_used: subscription.certificates_used + 1
      })
      .eq('id', subscription.id);

    if (error) throw error;

    await fetchSubscription();
  };

  return {
    subscription,
    loading,
    hasActivePlan,
    canCreateCertificates,
    getRemainingCertificates,
    cancelSubscription,
    incrementCertificateUsage,
    refetch: fetchSubscription
  };
}