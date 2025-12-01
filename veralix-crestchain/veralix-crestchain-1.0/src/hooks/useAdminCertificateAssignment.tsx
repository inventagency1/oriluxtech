import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignmentData {
  targetEmail: string;
  certificatesCount: number;
  packageName?: string;
  paymentType: 'external' | 'free_trial' | 'promotional' | 'compensation';
  paymentReference?: string;
  paymentMethod?: 'transfer' | 'cash' | 'check' | 'other';
  amountPaid?: number;
  currency?: string;
  notes?: string;
  invoiceNumber?: string;
}

interface Assignment {
  id: string;
  target_user_email: string;
  assigned_by_admin_email: string;
  package_name: string;
  certificates_count: number;
  payment_type: string;
  payment_reference: string | null;
  payment_method: string | null;
  amount_paid: number;
  currency: string;
  notes: string | null;
  invoice_number: string | null;
  is_income: boolean;
  created_at: string;
}

interface IncomeSummary {
  total_income: number;
  total_assignments: number;
  total_certificates_assigned: number;
  by_payment_type: Record<string, number>;
  by_month: Array<{
    month: string;
    income: number;
    assignments: number;
    certificates: number;
  }>;
}

export function useAdminCertificateAssignment() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [incomeSummary, setIncomeSummary] = useState<IncomeSummary | null>(null);
  const { toast } = useToast();

  const assignCertificates = async (data: AssignmentData) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('admin_assign_certificates', {
        p_target_email: data.targetEmail,
        p_certificates_count: data.certificatesCount,
        p_package_name: data.packageName || 'Paquete de Prueba',
        p_payment_type: data.paymentType,
        p_payment_reference: data.paymentReference || null,
        p_payment_method: data.paymentMethod || null,
        p_amount_paid: data.amountPaid || 0,
        p_currency: data.currency || 'COP',
        p_notes: data.notes || null,
        p_invoice_number: data.invoiceNumber || null
      });

      if (error) throw error;

      const response = result as { success: boolean; error?: string; message?: string; data?: any };

      if (!response.success) {
        throw new Error(response.error || 'Error al asignar certificados');
      }

      toast({
        title: "Certificados asignados",
        description: `Se asignaron ${data.certificatesCount} certificados a ${data.targetEmail}`,
      });

      // Refrescar lista de asignaciones
      await fetchAssignments();

      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error assigning certificates:', error);
      toast({
        title: "Error",
        description: error.message || 'No se pudieron asignar los certificados',
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (limit = 50, offset = 0) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('get_admin_assignments', {
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;

      const response = result as { success: boolean; assignments: Assignment[]; total: number; error?: string };

      if (!response.success) {
        throw new Error(response.error || 'Error al obtener asignaciones');
      }

      setAssignments(response.assignments || []);
      return { success: true, assignments: response.assignments, total: response.total };
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: error.message || 'No se pudieron cargar las asignaciones',
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeSummary = async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('get_admin_income_summary', {
        p_start_date: startDate?.toISOString() || null,
        p_end_date: endDate?.toISOString() || null
      });

      if (error) throw error;

      const response = result as { success: boolean; summary: IncomeSummary; error?: string };

      if (!response.success) {
        throw new Error(response.error || 'Error al obtener resumen de ingresos');
      }

      setIncomeSummary(response.summary);
      return { success: true, summary: response.summary };
    } catch (error: any) {
      console.error('Error fetching income summary:', error);
      toast({
        title: "Error",
        description: error.message || 'No se pudo cargar el resumen de ingresos',
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuarios por email para autocompletado
  const searchUsers = async (query: string) => {
    if (!query || query.length < 3) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, business_name')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,business_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  return {
    loading,
    assignments,
    incomeSummary,
    assignCertificates,
    fetchAssignments,
    fetchIncomeSummary,
    searchUsers
  };
}
