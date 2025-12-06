import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAudit } from './useAudit';

interface TransferData {
  certificateId: string;
  recipientEmail: string;
  notes?: string;
}

export function useCertificateTransfers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logAction } = useAudit();
  const [isLoading, setIsLoading] = useState(false);

  const initiateTransfer = useCallback(async ({ certificateId, recipientEmail, notes }: TransferData) => {
    if (!user) return { error: 'Usuario no autenticado' };

    setIsLoading(true);
    try {
      // 1. Verificar que el usuario es el owner del certificado
      const { data: certificate, error: certError } = await supabase
        .from('nft_certificates')
        .select('id, owner_id, certificate_id, property_id')
        .eq('id', certificateId)
        .single();

      if (certError || !certificate) {
        throw new Error('Certificado no encontrado');
      }

      if (certificate.owner_id !== user.id) {
        throw new Error('No tienes permisos para transferir este certificado');
      }

      // 2. Buscar el usuario destinatario por email
      const { data: recipientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .eq('email', recipientEmail)
        .single();

      if (profileError || !recipientProfile) {
        throw new Error('Usuario destinatario no encontrado');
      }

      if (recipientProfile.user_id === user.id) {
        throw new Error('No puedes transferir un certificado a ti mismo');
      }

      // 3. Verificar que no hay transferencia pendiente
      const { data: existingTransfer } = await supabase
        .from('certificate_transfers')
        .select('id')
        .eq('certificate_id', certificateId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingTransfer) {
        throw new Error('Ya existe una transferencia pendiente para este certificado');
      }

      // 4. Crear registro de transferencia
      const { error: transferError } = await supabase
        .from('certificate_transfers')
        .insert({
          certificate_id: certificateId,
          from_user_id: user.id,
          to_user_id: recipientProfile.user_id,
          transfer_notes: notes,
          status: 'pending'
        });

      if (transferError) throw transferError;

      // 5. Obtener información del remitente
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .single();

      // 6. Enviar emails
      await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          template: 'certificate-transfer-initiated',
          data: {
            certificateId: certificate.certificate_id,
            jewelryName: 'Pieza de joyería',
            senderName: senderProfile?.full_name || 'Usuario',
            senderEmail: user.email,
            recipientName: recipientProfile.full_name || 'Usuario',
            recipientEmail: recipientProfile.email,
            transferNotes: notes,
            transferDate: new Date().toLocaleDateString('es-CO'),
            certificateUrl: `${window.location.origin}/verify/${certificate.certificate_id}`,
          }
        }
      });

      await supabase.functions.invoke('send-email', {
        body: {
          to: recipientProfile.email,
          template: 'certificate-transfer-received',
          data: {
            certificateId: certificate.certificate_id,
            jewelryName: 'Pieza de joyería',
            senderName: senderProfile?.full_name || 'Usuario',
            senderEmail: user.email,
            recipientName: recipientProfile.full_name || 'Usuario',
            transferNotes: notes,
            transferDate: new Date().toLocaleDateString('es-CO'),
            certificateUrl: `${window.location.origin}/verify/${certificate.certificate_id}`,
          }
        }
      });

      // 7. Log de auditoría
      await logAction(
        'certificate_transfer',
        'certificate',
        certificateId,
        {
          action: 'initiated',
          to_user: recipientProfile.user_id,
          certificate_id: certificate.certificate_id
        }
      );

      toast({
        title: "Transferencia iniciada",
        description: `Se ha enviado la solicitud a ${recipientEmail}`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error al iniciar transferencia:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar la transferencia",
        variant: "destructive",
      });
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, logAction]);

  const acceptTransfer = useCallback(async (transferId: string) => {
    if (!user) return { error: 'Usuario no autenticado' };

    setIsLoading(true);
    try {
      // 1. Obtener detalles de la transferencia
      const { data: transfer, error: transferError } = await supabase
        .from('certificate_transfers')
        .select(`
          *,
          nft_certificates (
            id,
            certificate_id,
            property_id
          ),
          from_user:profiles!certificate_transfers_from_user_id_fkey(full_name, email)
        `)
        .eq('id', transferId)
        .eq('to_user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (transferError || !transfer) {
        throw new Error('Transferencia no encontrada o no tienes permisos');
      }

      // 2. Actualizar owner_id en nft_certificates
      const { error: updateError } = await supabase
        .from('nft_certificates')
        .update({
          owner_id: user.id,
          transferred_at: new Date().toISOString()
        })
        .eq('id', transfer.certificate_id);

      if (updateError) throw updateError;

      // 3. Actualizar estado de transferencia
      const { error: statusError } = await supabase
        .from('certificate_transfers')
        .update({ status: 'accepted' })
        .eq('id', transferId);

      if (statusError) throw statusError;

      // 4. Log de auditoría
      await logAction(
        'certificate_transfer',
        'certificate',
        transfer.certificate_id,
        {
          action: 'accepted',
          from_user: transfer.from_user_id,
          certificate_id: transfer.nft_certificates.certificate_id
        }
      );

      toast({
        title: "Transferencia aceptada",
        description: "El certificado ahora es tuyo",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error al aceptar transferencia:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo aceptar la transferencia",
        variant: "destructive",
      });
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, logAction]);

  const rejectTransfer = useCallback(async (transferId: string) => {
    if (!user) return { error: 'Usuario no autenticado' };

    setIsLoading(true);
    try {
      // 1. Verificar que la transferencia existe y es para el usuario
      const { data: transfer, error: transferError } = await supabase
        .from('certificate_transfers')
        .select('*, nft_certificates(certificate_id)')
        .eq('id', transferId)
        .eq('to_user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (transferError || !transfer) {
        throw new Error('Transferencia no encontrada o no tienes permisos');
      }

      // 2. Actualizar estado
      const { error: statusError } = await supabase
        .from('certificate_transfers')
        .update({ status: 'rejected' })
        .eq('id', transferId);

      if (statusError) throw statusError;

      // 3. Log de auditoría
      await logAction(
        'certificate_transfer',
        'certificate',
        transfer.certificate_id,
        {
          action: 'rejected',
          from_user: transfer.from_user_id,
          certificate_id: transfer.nft_certificates.certificate_id
        }
      );

      toast({
        title: "Transferencia rechazada",
        description: "Has rechazado la transferencia",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error al rechazar transferencia:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo rechazar la transferencia",
        variant: "destructive",
      });
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, logAction]);

  return {
    initiateTransfer,
    acceptTransfer,
    rejectTransfer,
    isLoading
  };
}
