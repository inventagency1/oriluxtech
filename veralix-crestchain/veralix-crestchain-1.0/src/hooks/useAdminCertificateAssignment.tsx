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

  const reduceCertificates = async (targetUserId: string, targetEmail: string, certificatesCount: number, reason: string) => {
    setLoading(true);
    try {
      console.log('Reducing certificates for:', { targetUserId, targetEmail, certificatesCount });
      
      // Obtener el perfil del usuario
      let userId = targetUserId;
      if (!userId && targetEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', targetEmail)
          .single();
        
        if (profile) {
          userId = profile.user_id;
        }
      }

      if (!userId) {
        throw new Error('Usuario no encontrado');
      }

      // Obtener los paquetes de certificados del usuario con balance disponible
      const { data: purchases, error: purchaseError } = await supabase
        .from('certificate_purchases')
        .select('id, certificates_remaining, certificates_used')
        .eq('user_id', userId)
        .eq('payment_status', 'completed')
        .gt('certificates_remaining', 0)
        .order('purchased_at', { ascending: true });

      if (purchaseError) {
        console.error('Error fetching purchases:', purchaseError);
      }

      // También obtener asignaciones manuales para calcular balance total
      const { data: manualAssignments, error: assignError } = await (supabase as any)
        .from('admin_certificate_assignments')
        .select('certificates_count')
        .eq('target_user_id', userId);

      if (assignError) {
        console.error('Error fetching manual assignments:', assignError);
      }

      // Calcular balance de purchases
      const purchaseBalance = purchases?.reduce((sum, p) => sum + (p.certificates_remaining || 0), 0) || 0;
      
      // Calcular balance de asignaciones manuales
      const manualBalance = manualAssignments?.reduce((sum: number, a: any) => sum + (a.certificates_count || 0), 0) || 0;
      
      // Balance total
      const totalBalance = purchaseBalance + manualBalance;
      console.log('Current balance:', { totalBalance, purchaseBalance, manualBalance, purchases, manualAssignments });

      if (totalBalance < certificatesCount) {
        throw new Error(`El usuario solo tiene ${totalBalance} certificados disponibles`);
      }

      // Primero reducir de los paquetes de compra (FIFO)
      let remaining = certificatesCount;
      for (const purchase of purchases || []) {
        if (remaining <= 0) break;
        
        const toReduce = Math.min(remaining, purchase.certificates_remaining || 0);
        const newRemaining = (purchase.certificates_remaining || 0) - toReduce;
        const newUsed = (purchase.certificates_used || 0) + toReduce;
        
        const { error: updateError } = await supabase
          .from('certificate_purchases')
          .update({ 
            certificates_remaining: newRemaining,
            certificates_used: newUsed
          })
          .eq('id', purchase.id);

        if (updateError) {
          console.error('Error updating purchase:', updateError);
          throw updateError;
        }
        
        remaining -= toReduce;
      }

      // Si aún quedan certificados por reducir, se registra como reducción manual
      // (el registro en admin_certificate_assignments con valor negativo ya se hace abajo)

      const newBalance = totalBalance - certificatesCount;

      // Registrar la reducción en admin_certificate_assignments con cantidad negativa
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', adminUser?.id)
        .single();

      const { error: logError } = await (supabase as any)
        .from('admin_certificate_assignments')
        .insert({
          target_user_id: userId,
          target_user_email: targetEmail,
          assigned_by_admin_id: adminUser?.id,
          assigned_by_admin_email: adminProfile?.email || 'admin',
          package_name: 'Reducción de certificados',
          certificates_count: -certificatesCount,
          payment_type: 'compensation',
          amount_paid: 0,
          currency: 'COP',
          notes: reason,
          is_income: false
        });

      if (logError) {
        console.error('Error logging reduction:', logError);
      }

      toast({
        title: "Certificados reducidos",
        description: `Se quitaron ${certificatesCount} certificados a ${targetEmail}. Nuevo balance: ${newBalance}`,
      });

      await fetchAssignments();
      return { success: true, newBalance };
    } catch (error: any) {
      console.error('Error reducing certificates:', error);
      toast({
        title: "Error",
        description: error.message || 'No se pudieron reducir los certificados',
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Obtener balance de certificados de un usuario
  const getUserCertificateBalance = async (email: string, detailed: boolean = false) => {
    try {
      // Primero obtener el perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, business_name')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        return { success: false, balance: 0, error: 'Usuario no encontrado' };
      }

      // Obtener balance de certificate_purchases
      const { data: purchases, error: purchaseError } = await supabase
        .from('certificate_purchases')
        .select('id, package_name, certificates_purchased, certificates_remaining, certificates_used, purchased_at, amount_paid, currency, payment_status')
        .eq('user_id', profile.user_id)
        .order('purchased_at', { ascending: false });

      if (purchaseError) {
        console.error('Error fetching purchases:', purchaseError);
      }

      // También obtener asignaciones manuales de admin_certificate_assignments
      const { data: manualAssignments, error: assignError } = await (supabase as any)
        .from('admin_certificate_assignments')
        .select('id, package_name, certificates_count, created_at, payment_type, amount_paid, currency')
        .eq('target_user_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (assignError) {
        console.error('Error fetching manual assignments:', assignError);
      }

      // Calcular balance de purchases
      const completedPurchases = purchases?.filter(p => p.payment_status === 'completed') || [];
      const purchaseBalance = completedPurchases.reduce((sum, p) => sum + (p.certificates_remaining || 0), 0);
      
      // Calcular balance de asignaciones manuales (sumar positivos, restar negativos)
      const manualBalance = manualAssignments?.reduce((sum: number, a: any) => sum + (a.certificates_count || 0), 0) || 0;
      
      // Balance total
      const totalBalance = purchaseBalance + manualBalance;
      const totalPurchased = completedPurchases.reduce((sum, p) => sum + (p.certificates_purchased || 0), 0);
      const totalUsed = completedPurchases.reduce((sum, p) => sum + (p.certificates_used || 0), 0);

      // Combinar historial para vista detallada
      const combinedHistory = detailed ? [
        ...(purchases || []).map(p => ({
          ...p,
          type: 'purchase',
          date: p.purchased_at
        })),
        ...(manualAssignments || []).map((a: any) => ({
          id: a.id,
          package_name: a.package_name,
          certificates_purchased: a.certificates_count,
          certificates_remaining: a.certificates_count,
          certificates_used: 0,
          purchased_at: a.created_at,
          amount_paid: a.amount_paid,
          currency: a.currency,
          payment_status: a.certificates_count > 0 ? 'assigned' : 'reduced',
          type: 'manual'
        }))
      ].sort((a, b) => new Date(b.date || b.purchased_at).getTime() - new Date(a.date || a.purchased_at).getTime()) : undefined;

      return { 
        success: true, 
        balance: totalBalance,
        totalPurchased: totalPurchased + (manualAssignments?.filter((a: any) => a.certificates_count > 0).reduce((sum: number, a: any) => sum + a.certificates_count, 0) || 0),
        totalUsed,
        manualBalance,
        purchaseBalance,
        name: profile?.full_name || profile?.business_name || email,
        email: email,
        purchases: combinedHistory
      };
    } catch (error: any) {
      console.error('Error getting user balance:', error);
      return { success: false, balance: 0, error: error.message };
    }
  };

  return {
    loading,
    assignments,
    incomeSummary,
    assignCertificates,
    reduceCertificates,
    getUserCertificateBalance,
    fetchAssignments,
    fetchIncomeSummary,
    searchUsers
  };
}
