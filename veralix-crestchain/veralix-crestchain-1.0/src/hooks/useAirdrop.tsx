import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Airdrop = Database['public']['Tables']['airdrops']['Row'];
type AirdropInsert = Database['public']['Tables']['airdrops']['Insert'];

export function useAirdrop() {
  console.log('useAirdrop hook started');
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  console.log('useAirdrop user:', user?.id);

  useEffect(() => {
    console.log('useAirdrop useEffect triggered, user:', !!user);
    if (user) {
      fetchAirdrops();
    }
  }, [user]);

  const fetchAirdrops = async () => {
    try {
      console.log('fetchAirdrops started');
      setLoading(true);
      const { data, error } = await supabase
        .from('airdrops')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('fetchAirdrops data:', data, 'error:', error);

      if (error) {
        console.error('Error fetching airdrops:', error);
        return;
      }

      setAirdrops(data || []);
      console.log('fetchAirdrops completed, airdrops set to:', data?.length);
    } catch (error) {
      console.error('Airdrop fetch error:', error);
    } finally {
      setLoading(false);
      console.log('fetchAirdrops loading set to false');
    }
  };

  const createAirdrop = async (airdropData: Omit<AirdropInsert, 'created_by'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('airdrops')
      .insert({
        ...airdropData,
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    setAirdrops(prev => [data, ...prev]);
    return data;
  };

  const updateAirdrop = async (id: string, updates: Partial<AirdropInsert>) => {
    const { data, error } = await supabase
      .from('airdrops')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setAirdrops(prev => prev.map(a => a.id === id ? data : a));
    return data;
  };

  const toggleAirdropStatus = async (id: string, newStatus: string) => {
    return updateAirdrop(id, { status: newStatus });
  };

  const distributeAirdrop = async (airdropId: string, recipientUserIds: string[]) => {
    if (!user) throw new Error('User not authenticated');

    // Call the database function to distribute tokens
    const { data, error } = await supabase.rpc('distribute_airdrop_tokens', {
      _airdrop_id: airdropId,
      _recipient_user_ids: recipientUserIds
    });

    if (error) throw error;

    // Type assertion since we know the structure of our function response
    const result = data as { success: boolean; error?: string; claims_created?: number };

    if (!result.success) {
      throw new Error(result.error || 'Failed to distribute tokens');
    }

    // Refresh airdrops to get updated counts
    await fetchAirdrops();
    return result;
  };

  const canDistributeAirdrop = async (airdropId: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('can_distribute_airdrop', {
      _airdrop_id: airdropId
    });

    if (error) {
      console.error('Error checking distribution eligibility:', error);
      return false;
    }

    return data || false;
  };

  const getUserTokenBalance = async (userId?: string): Promise<number> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return 0;

    const { data, error } = await supabase
      .from('user_tokens')
      .select('token_balance')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }

    return data?.token_balance || 0;
  };

  const getUserAirdropClaims = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return [];

    const { data, error } = await supabase
      .from('airdrop_claims')
      .select(`
        *,
        airdrops (
          title,
          description,
          token_amount
        )
      `)
      .eq('user_id', targetUserId)
      .order('claimed_at', { ascending: false });

    if (error) {
      console.error('Error fetching airdrop claims:', error);
      return [];
    }

    return data || [];
  };

  return {
    airdrops,
    loading,
    createAirdrop,
    updateAirdrop,
    toggleAirdropStatus,
    distributeAirdrop,
    canDistributeAirdrop,
    getUserTokenBalance,
    getUserAirdropClaims,
    refetch: fetchAirdrops
  };
}