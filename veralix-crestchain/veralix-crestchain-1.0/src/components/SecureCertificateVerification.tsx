import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertificateVerificationData {
  certificate_id: string;
  is_verified: boolean;
  verification_date: string | null;
  jewelry_name?: string;
  jewelry_type?: string;
  created_at: string;
}

export function SecureCertificateVerification() {
  const [certificateId, setCertificateId] = useState('');
  const [verificationData, setVerificationData] = useState<CertificateVerificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const verifyCertificate = async () => {
    if (!certificateId.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un ID de certificado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use secure public view that exposes only safe, non-sensitive data
      const { data, error } = await supabase
        .from('certificate_verification')
        .select(`
          certificate_id,
          jewelry_item_id,
          is_verified,
          verification_date,
          created_at
        `)
        .eq('certificate_id', certificateId.trim())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        toast({
          title: "Certificado no encontrado",
          description: "No existe un certificado con ese ID",
          variant: "destructive",
        });
        setVerificationData(null);
        return;
      }

      // Fetch jewelry details separately (only public data)
      let jewelryName = null;
      let jewelryType = null;
      
      if (data.jewelry_item_id) {
        const { data: jewelryData } = await supabase
          .from('jewelry_items')
          .select('name, type')
          .eq('id', data.jewelry_item_id)
          .maybeSingle();
        
        if (jewelryData) {
          jewelryName = jewelryData.name;
          jewelryType = jewelryData.type;
        }
      }

      // Only expose safe, non-sensitive data
      const safeData: CertificateVerificationData = {
        certificate_id: data.certificate_id,
        is_verified: data.is_verified,
        verification_date: data.verification_date,
        jewelry_name: jewelryName || undefined,
        jewelry_type: jewelryType || undefined,
        created_at: data.created_at,
      };

      setVerificationData(safeData);
      
      toast({
        title: "Verificación completada",
        description: `Certificado ${data.is_verified ? 'verificado' : 'no verificado'}`,
        variant: data.is_verified ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error verifying certificate:', error);
      toast({
        title: "Error de verificación",
        description: "Ocurrió un error al verificar el certificado",
        variant: "destructive",
      });
      setVerificationData(null);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verificado
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          No Verificado
        </Badge>
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Verificación de Certificado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="Ingresa el ID del certificado (ej: VRX-001)"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && verifyCertificate()}
            />
            <Button 
              onClick={verifyCertificate} 
              disabled={loading || !certificateId.trim()}
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </Button>
          </div>

          {verificationData && (
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Resultado de Verificación</h3>
                    {getVerificationBadge(verificationData.is_verified)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">ID del Certificado:</span>
                      <p className="font-mono">{verificationData.certificate_id}</p>
                    </div>
                    
                    {verificationData.jewelry_name && (
                      <div>
                        <span className="font-medium text-gray-600">Joya:</span>
                        <p>{verificationData.jewelry_name}</p>
                      </div>
                    )}
                    
                    {verificationData.jewelry_type && (
                      <div>
                        <span className="font-medium text-gray-600">Tipo:</span>
                        <p className="capitalize">{verificationData.jewelry_type}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium text-gray-600">Fecha de Emisión:</span>
                      <p>{new Date(verificationData.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                    
                    {verificationData.is_verified && verificationData.verification_date && (
                      <div>
                        <span className="font-medium text-gray-600">Fecha de Verificación:</span>
                        <p>{new Date(verificationData.verification_date).toLocaleDateString('es-ES')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}