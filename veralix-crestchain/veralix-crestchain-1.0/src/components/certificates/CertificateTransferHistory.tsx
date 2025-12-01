import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, User, Calendar, FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Transfer {
  id: string;
  from_user_id: string;
  to_user_id: string;
  certificate_id: string;
  transfer_notes?: string;
  created_at: string;
  from_user?: {
    full_name: string;
    email: string;
  };
  to_user?: {
    full_name: string;
    email: string;
  };
}

interface Certificate {
  id: string;
  certificate_id: string;
  jewelry_item_id: string;
  is_verified: boolean;
  created_at: string;
}

interface CertificateTransferHistoryProps {
  certificateId: string;
  className?: string;
}

export const CertificateTransferHistory = ({ 
  certificateId, 
  className 
}: CertificateTransferHistoryProps) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchTransferHistory();
    setupRealtimeSubscription();
  }, [certificateId]);

  const fetchTransferHistory = async () => {
    try {
      setLoading(true);

      // Fetch certificate details
      const { data: certData, error: certError } = await supabase
        .from('nft_certificates')
        .select('*')
        .eq('id', certificateId)
        .single();

      if (certError) throw certError;
      setCertificate(certData);

      // Fetch transfer history
      const { data: transfersData, error: transfersError } = await supabase
        .from('certificate_transfers')
        .select('*')
        .eq('certificate_id', certificateId)
        .order('created_at', { ascending: false });

      if (transfersError) throw transfersError;

      // Fetch user profiles for all transfers
      const transfersWithProfiles = await Promise.all(
        (transfersData || []).map(async (transfer) => {
          const [fromUser, toUser] = await Promise.all([
            supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', transfer.from_user_id)
              .maybeSingle(),
            supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', transfer.to_user_id)
              .maybeSingle()
          ]);

          return {
            ...transfer,
            from_user: fromUser.data || { full_name: 'Usuario', email: '' },
            to_user: toUser.data || { full_name: 'Usuario', email: '' }
          };
        })
      );

      setTransfers(transfersWithProfiles);
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      toast.error('Error al cargar el historial de transferencias');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`certificate_transfers:${certificateId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'certificate_transfers',
          filter: `certificate_id=eq.${certificateId}`
        },
        () => {
          fetchTransferHistory();
          toast.info('Nueva transferencia registrada');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!certificate) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          Certificado no encontrado
        </CardContent>
      </Card>
    );
  }

  const visibleTransfers = expanded ? transfers : transfers.slice(0, 3);
  const hasMore = transfers.length > 3;

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Historial de Transferencias</span>
            </CardTitle>
            <CardDescription>
              Certificado {certificate.certificate_id} • {transfers.length} transferencia(s)
            </CardDescription>
          </div>
          {certificate.is_verified && (
            <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30">
              Verificado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {transfers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay transferencias registradas</p>
            <p className="text-sm mt-1">Este certificado no ha sido transferido aún</p>
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="space-y-6">
              {visibleTransfers.map((transfer, index) => (
                <div key={transfer.id} className="relative">
                  {/* Timeline line */}
                  {index < visibleTransfers.length - 1 && (
                    <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
                  )}

                  <div className="flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-background">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    </div>

                    {/* Transfer content */}
                    <div className="flex-1 bg-muted/30 rounded-lg p-4 space-y-3">
                      {/* Users */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(transfer.from_user?.full_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {transfer.from_user?.full_name || 'Usuario'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              De: {transfer.from_user?.email}
                            </p>
                          </div>
                        </div>

                        <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {transfer.to_user?.full_name || 'Usuario'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              A: {transfer.to_user?.email}
                            </p>
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(transfer.to_user?.full_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>

                      {/* Date and notes */}
                      <Separator />
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(transfer.created_at)}</span>
                        </div>
                        
                        {transfer.transfer_notes && (
                          <Badge variant="outline" className="text-xs">
                            {transfer.transfer_notes}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show more/less button */}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="w-full"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Mostrar {transfers.length - 3} más
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {/* Certificate info footer */}
        <Separator />
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>Creado: {formatDate(certificate.created_at)}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/verify?id=${certificate.certificate_id}`, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Ver Certificado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
