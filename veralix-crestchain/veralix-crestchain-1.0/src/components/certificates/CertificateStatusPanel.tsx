import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: string;
  certificate_id: string;
  jewelry_item_id: string;
  is_verified: boolean;
  created_at: string;
  jewelry_items?: {
    name: string;
    type: string;
  };
}

export const CertificateStatusPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingCerts, setPendingCerts] = useState<Certificate[]>([]);
  const [recentCerts, setRecentCerts] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar certificados iniciales
  const loadCertificates = async () => {
    if (!user?.id) return;

    try {
      // Cargar certificados recientes (últimas 24 horas)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recent, error: recentError } = await supabase
        .from('nft_certificates')
        .select('*, jewelry_items(name, type)')
        .eq('user_id', user.id)
        .eq('is_verified', true)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) {
        console.error('Error loading recent certificates:', recentError);
      } else {
        setRecentCerts(recent || []);
      }

      // Cargar certificados pendientes/en proceso
      const { data: pending, error: pendingError } = await supabase
        .from('nft_certificates')
        .select('*, jewelry_items(name, type)')
        .eq('user_id', user.id)
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (pendingError) {
        console.error('Error loading pending certificates:', pendingError);
      } else {
        setPendingCerts(pending || []);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar Realtime para escuchar cambios
  useEffect(() => {
    if (!user?.id) return;

    loadCertificates();

    // Suscribirse a cambios en la tabla nft_certificates
    const channel = supabase
      .channel('certificate-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'nft_certificates',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Nuevo certificado creado:', payload);
          
          // Recargar certificados
          loadCertificates();
          
          toast({
            title: "🎉 Certificado en proceso",
            description: "Se está generando tu certificado NFT",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'nft_certificates',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Certificado actualizado:', payload);
          
          const newData = payload.new as Certificate;
          
          // Si se verificó el certificado, mostrar notificación de éxito
          if (newData.is_verified) {
            toast({
              title: "✅ Certificado generado",
              description: "Tu certificado NFT está listo para descargar",
              action: (
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/verify/${newData.certificate_id}`}>
                    Ver Certificado
                  </Link>
                </Button>
              ),
            });
          }
          
          // Recargar certificados
          loadCertificates();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando estado...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const hasCertificates = pendingCerts.length > 0 || recentCerts.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Estado de Certificados
        </CardTitle>
        <CardDescription>
          Monitoreo en tiempo real de tus certificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Certificados en Proceso */}
        {pendingCerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              En Proceso ({pendingCerts.length})
            </h4>
            <div className="space-y-2">
              {pendingCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {cert.jewelry_items?.name || 'Joya'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cert.jewelry_items?.type || 'Tipo desconocido'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Generando...
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificados Completados Recientemente */}
        {recentCerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Completados Hoy ({recentCerts.length})
            </h4>
            <div className="space-y-2">
              {recentCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {cert.jewelry_items?.name || 'Joya'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(cert.created_at).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/verify/${cert.certificate_id}`}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {!hasCertificates && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay certificados recientes</p>
            <p className="text-xs mt-1">
              Genera tu primer certificado para verlo aquí
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
