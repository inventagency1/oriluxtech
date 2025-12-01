import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  user_type?: string | null;
  company_name?: string | null;
  interest_reason?: string | null;
  status: string;
  notified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaitlistFormData {
  email: string;
  full_name: string;
  phone?: string;
  user_type: 'joyero' | 'cliente' | 'otro';
  company_name?: string;
  interest_reason?: string;
}

interface WaitlistFilters {
  status?: string;
  user_type?: string;
  search?: string;
}

export const useWaitlist = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    converted: 0,
    joyeros: 0,
    clientes: 0
  });
  const { toast } = useToast();

  const submitWaitlistEntry = async (data: WaitlistFormData) => {
    try {
      const { error } = await supabase
        .from('waitlist_entries')
        .insert([data]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este email ya está registrado en la lista de espera');
        }
        throw error;
      }

      toast({
        title: "¡Gracias por registrarte!",
        description: "Te notificaremos cuando Veralix esté disponible",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error submitting waitlist entry:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar en la lista de espera",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const getWaitlistEntries = async (filters?: WaitlistFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('waitlist_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.user_type) {
        query = query.eq('user_type', filters.user_type);
      }

      if (filters?.search) {
        query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEntries(data || []);
      calculateStats(data || []);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de espera",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: WaitlistEntry[]) => {
    setStats({
      total: data.length,
      pending: data.filter(e => e.status === 'pending').length,
      contacted: data.filter(e => e.status === 'contacted').length,
      converted: data.filter(e => e.status === 'converted').length,
    joyeros: data.filter(e => e.user_type === 'joyero').length,
      clientes: data.filter(e => e.user_type === 'cliente').length
    });
  };

  const updateEntryStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('waitlist_entries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, status } : entry
      ));

      toast({
        title: "Estado actualizado",
        description: `El lead fue marcado como ${status}`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating entry status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const exportWaitlistToCSV = () => {
    const headers = ['Email', 'Nombre', 'Teléfono', 'Tipo', 'Empresa', 'Estado', 'Fecha'];
    const rows = entries.map(entry => [
      entry.email,
      entry.full_name,
      entry.phone || '',
      entry.user_type || '',
      entry.company_name || '',
      entry.status,
      new Date(entry.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `veralix-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "CSV exportado",
      description: "El archivo fue descargado exitosamente",
    });
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('waitlist_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== id));

      toast({
        title: "Lead eliminado",
        description: "El registro fue eliminado de la waitlist",
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  return {
    entries,
    loading,
    stats,
    submitWaitlistEntry,
    getWaitlistEntries,
    updateEntryStatus,
    exportWaitlistToCSV,
    deleteEntry
  };
};
