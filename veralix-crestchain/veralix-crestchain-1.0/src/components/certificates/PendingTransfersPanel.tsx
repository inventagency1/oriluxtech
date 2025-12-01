import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCertificateTransfers } from '@/hooks/useCertificateTransfers';
import { ArrowRight, Check, X, Clock, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Transfer {
  id: string;
  certificate_id: string;
  from_user_id: string;
  to_user_id: string;
  transfer_notes: string | null;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  nft_certificates: {
    certificate_id: string;
    jewelry_items: {
      name: string;
    };
  };
  from_user?: {
    full_name: string;
    email: string;
  };
  to_user?: {
    full_name: string;
    email: string;
  };
}

export function PendingTransfersPanel() {
  const { user } = useAuth();
  const { acceptTransfer, rejectTransfer, isLoading } = useCertificateTransfers();
  const [receivedTransfers, setReceivedTransfers] = useState<Transfer[]>([]);
  const [sentTransfers, setSentTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'accept' | 'reject';
    transferId: string;
    certificateName: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadTransfers();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadTransfers = async () => {
    try {
      setLoading(true);

      // Transferencias recibidas (pendientes)
      const { data: receivedRaw, error: receivedError } = await supabase
        .from('certificate_transfers')
        .select(`
          *,
          nft_certificates (
            certificate_id,
            jewelry_items (name)
          )
        `)
        .eq('to_user_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Cargar perfiles de remitentes
      const receivedWithProfiles = await Promise.all(
        (receivedRaw || []).map(async (transfer) => {
          const { data: fromUser } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', transfer.from_user_id)
            .single();

          return { ...transfer, from_user: fromUser };
        })
      );

      setReceivedTransfers(receivedWithProfiles as Transfer[]);

      // Transferencias enviadas (pendientes)
      const { data: sentRaw, error: sentError } = await supabase
        .from('certificate_transfers')
        .select(`
          *,
          nft_certificates (
            certificate_id,
            jewelry_items (name)
          )
        `)
        .eq('from_user_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // Cargar perfiles de destinatarios
      const sentWithProfiles = await Promise.all(
        (sentRaw || []).map(async (transfer) => {
          const { data: toUser } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', transfer.to_user_id)
            .single();

          return { ...transfer, to_user: toUser };
        })
      );

      setSentTransfers(sentWithProfiles as Transfer[]);
    } catch (error) {
      console.error('Error loading transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('certificate_transfers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'certificate_transfers',
        },
        () => {
          loadTransfers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAccept = async (transferId: string) => {
    const result = await acceptTransfer(transferId);
    if (result.success) {
      loadTransfers();
    }
    setConfirmAction(null);
  };

  const handleReject = async (transferId: string) => {
    const result = await rejectTransfer(transferId);
    if (result.success) {
      loadTransfers();
    }
    setConfirmAction(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="shadow-premium border-border/50">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando transferencias...</p>
        </CardContent>
      </Card>
    );
  }

  if (receivedTransfers.length === 0 && sentTransfers.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        {/* Transferencias Recibidas */}
        {receivedTransfers.length > 0 && (
          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-primary" />
                Transferencias Recibidas
              </CardTitle>
              <CardDescription>
                Certificados que otros usuarios quieren transferirte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {receivedTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {transfer.nft_certificates.jewelry_items.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {transfer.nft_certificates.certificate_id}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        De: <strong>{transfer.from_user?.full_name}</strong> ({transfer.from_user?.email})
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(transfer.created_at)}
                      </p>
                    </div>
                  </div>

                  {transfer.transfer_notes && (
                    <Alert>
                      <AlertDescription className="text-sm">
                        <strong>Nota:</strong> {transfer.transfer_notes}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        setConfirmAction({
                          type: 'accept',
                          transferId: transfer.id,
                          certificateName: transfer.nft_certificates.jewelry_items.name,
                        })
                      }
                      disabled={isLoading}
                      className="bg-gradient-gold hover:shadow-gold transition-premium"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setConfirmAction({
                          type: 'reject',
                          transferId: transfer.id,
                          certificateName: transfer.nft_certificates.jewelry_items.name,
                        })
                      }
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Transferencias Enviadas */}
        {sentTransfers.length > 0 && (
          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Transferencias Enviadas
              </CardTitle>
              <CardDescription>
                Esperando que el destinatario acepte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sentTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-4 space-y-2 bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {transfer.nft_certificates.jewelry_items.name}
                        </h4>
                        <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600">
                          Pendiente
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Para: <strong>{transfer.to_user?.full_name}</strong> ({transfer.to_user?.email})
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(transfer.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {confirmAction?.type === 'accept' ? 'Aceptar Transferencia' : 'Rechazar Transferencia'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'accept' ? (
                <>
                  ¿Estás seguro de que quieres aceptar la transferencia del certificado{' '}
                  <strong>{confirmAction?.certificateName}</strong>?
                  <br />
                  <br />
                  Este certificado pasará a ser tuyo y el propietario actual perderá el acceso.
                </>
              ) : (
                <>
                  ¿Estás seguro de que quieres rechazar la transferencia del certificado{' '}
                  <strong>{confirmAction?.certificateName}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction?.type === 'accept') {
                  handleAccept(confirmAction.transferId);
                } else if (confirmAction?.type === 'reject') {
                  handleReject(confirmAction.transferId);
                }
              }}
              className={
                confirmAction?.type === 'accept'
                  ? 'bg-gradient-gold hover:shadow-gold'
                  : ''
              }
            >
              {confirmAction?.type === 'accept' ? 'Aceptar' : 'Rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
