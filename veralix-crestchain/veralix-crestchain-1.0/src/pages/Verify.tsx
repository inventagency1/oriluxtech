import React, { useState, useEffect } from "react";
import { useSEO, StructuredData } from "@/utils/seoHelpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Gem, 
  Search, 
  QrCode, 
  ArrowLeft,
  XCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QRScanner } from "@/components/QRScanner";
import { VerificationDetails } from "@/components/VerificationDetails";
import { AppLayout } from "@/components/layout/AppLayout";

const Verify = () => {
  const { id: urlId } = useParams();
  const [verificationId, setVerificationId] = useState(urlId || "");
  
  useSEO({
    title: 'Verificar Autenticidad de Joyas | Certificación NFT Blockchain',
    description: 'Verifica la autenticidad de joyas certificadas con NFT en blockchain. Sistema seguro de verificación instantánea con código QR. Comprueba certificados digitales.',
    keywords: 'verificar joya NFT, autenticidad blockchain, verificación certificado digital, QR joyería, comprobar autenticidad',
    canonical: 'https://veralix.io/verificar'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (urlId) {
      handleVerification();
    }
  }, [urlId]);

  const handleVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const idToVerify = e ? verificationId.trim() : urlId?.trim();
    
    if (!idToVerify) {
      toast({
        title: "Error",
        description: "Por favor ingresa un ID de verificación válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setVerificationResult(null);

    try {
      // Buscar certificado por certificate_id (sin join)
      const { data: certData, error } = await supabase
        .from('nft_certificates')
        .select('*')
        .eq('certificate_id', idToVerify)
        .single();

      if (error || !certData) {
        setNotFound(true);
        toast({
          title: "Certificado no encontrado",
          description: "El ID proporcionado no corresponde a ningún certificado válido",
          variant: "destructive",
        });
        return;
      }

      // Fetch jewelry item separately
      let jewelryData = null;
      if (certData.property_id) {
        const { data: jewelry } = await supabase
          .from('jewelry_items')
          .select('name, type, materials, weight, dimensions, origin, craftsman, description, sale_price, currency')
          .eq('id', certData.property_id)
          .single();
        jewelryData = jewelry;
      }

      const data: any = { ...certData, jewelry_items: jewelryData };

      // Mapear datos para la vista
      const verificationData = {
        id: data.certificate_id,
        name: data.jewelry_items?.name || 'Joya sin nombre',
        status: data.is_verified ? "certificado" : "pendiente",
        blockchain: data.blockchain_network,
        certificationDate: data.verification_date ? 
          new Date(data.verification_date).toLocaleDateString('es-CO') : 
          new Date(data.created_at).toLocaleDateString('es-CO'),
        jewelry: {
          type: data.jewelry_items?.type || 'Sin especificar',
          materials: data.jewelry_items?.materials || [],
          weight: data.jewelry_items?.weight ? `${data.jewelry_items.weight}g` : 'No especificado',
          origin: data.jewelry_items?.origin || 'No especificado',
          artisan: data.jewelry_items?.craftsman || 'No especificado',
          description: data.jewelry_items?.description || 'Sin descripción disponible',
          value: data.jewelry_items?.sale_price ? 
            new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: data.jewelry_items?.currency || 'COP',
              minimumFractionDigits: 0
            }).format(data.jewelry_items.sale_price) : 'Precio no disponible'
        },
        blockchain_data: {
          tokenId: data.crestchain_token_id || data.token_id || 'Pendiente',
          contractAddress: data.crestchain_contract_address || data.contract_address || '0x419C2C5189A357914469CEBCB2d7c8c7A1bCD1Ee',
          transactionHash: data.crestchain_tx_hash || data.transaction_hash || 'Pendiente',
          blockNumber: data.crestchain_block_number || data.block_number || 'Pendiente',
          network: 'CrestChain Mainnet'
        },
        isVerified: data.is_verified
      };

      setVerificationResult(verificationData);
      
      if (data.is_verified) {
        toast({
          title: "Verificación exitosa",
          description: "La joya ha sido autenticada correctamente",
        });
      } else {
        toast({
          title: "Certificado en proceso",
          description: "El certificado existe pero aún no está completamente verificado",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error verifying certificate:', error);
      toast({
        title: "Error de verificación",
        description: "Ocurrió un error al verificar el certificado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = (result: string) => {
    setVerificationId(result);
    setShowQRScanner(false);
    // Auto-verify after QR scan
    handleVerification();
  };

  return (
    <AppLayout>
      <StructuredData 
        type="Service" 
        data={{
          name: 'Verificación de Autenticidad de Joyas',
          description: 'Servicio de verificación blockchain instantánea para joyas certificadas con NFT',
          provider: {
            '@type': 'Organization',
            name: 'Veralix'
          },
          serviceType: 'Verificación Blockchain',
          areaServed: 'Global'
        }} 
      />
      
      <div className="container mx-auto max-w-6xl">
        {showQRScanner ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                Escanear <span className="bg-gradient-crypto bg-clip-text text-transparent">Código QR</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Apunta tu cámara hacia el código QR del certificado
              </p>
            </div>
            <QRScanner 
              onScan={handleQRScan} 
              onClose={() => setShowQRScanner(false)}
              className="shadow-premium"
            />
          </div>
        ) : !verificationResult ? (
          <>
            {/* Verification Form */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                Verificar <span className="bg-gradient-crypto bg-clip-text text-transparent">Autenticidad</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ingresa el ID único de la joya o escanea el código QR para verificar su autenticidad en blockchain
              </p>
            </div>

            <Card className="max-w-2xl mx-auto shadow-premium">
              <CardHeader className="text-center">
                   <CardTitle className="text-2xl font-heading flex items-center justify-center">
                     <Search className="w-6 h-6 mr-2 text-primary" />
                     Verificar Joya
                   </CardTitle>
                <CardDescription>
                  Proceso de verificación seguro usando tecnología blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verificationId" className="text-sm font-medium">
                      ID de Verificación *
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="verificationId"
                        placeholder="Ej: VRX-001, VRX-ABC123..."
                        value={verificationId}
                        onChange={(e) => setVerificationId(e.target.value)}
                        className="pl-10 text-lg h-12"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El ID se encuentra en el certificado o etiqueta de la joya
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-crypto hover:shadow-crypto transition-premium h-12 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verificando en blockchain..." : "Verificar Autenticidad"}
                  </Button>
                </form>

                <Separator />

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-premium"
                    onClick={() => setShowQRScanner(true)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Escanear Código QR
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    También puedes escanear el código QR de la joya
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : notFound ? (
          <>
            {/* Not Found Result */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                ❌ Certificado <span className="bg-gradient-destructive bg-clip-text text-transparent">No Encontrado</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                El ID proporcionado no corresponde a ningún certificado válido en nuestro sistema
              </p>
            </div>

            <Card className="max-w-2xl mx-auto shadow-premium border-destructive/20">
              <CardContent className="pt-6 text-center">
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold font-heading mb-2">Certificado No Válido</h3>
                <p className="text-muted-foreground mb-6">
                  Por favor verifica el ID e intenta nuevamente. Asegúrate de que el código esté completo y sea correcto.
                </p>
                <Button 
                  onClick={() => {
                    setNotFound(false);
                    setVerificationId("");
                  }}
                  variant="outline"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Intentar Nuevamente
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Verification Result */}
            <div className="mb-6">
              <Link to="/verify" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-fast mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Nueva verificación
              </Link>
              
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                  {verificationResult?.isVerified ? (
                    <>✅ Joya <span className="bg-gradient-gold bg-clip-text text-transparent">Autenticada</span></>
                  ) : (
                    <>🔄 Certificado <span className="bg-gradient-crypto bg-clip-text text-transparent">En Proceso</span></>
                  )}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {verificationResult?.isVerified ? 
                    "Esta joya ha sido verificada exitosamente en blockchain" :
                    "Este certificado está registrado pero aún en proceso de verificación"
                  }
                </p>
              </div>
            </div>

            <VerificationDetails data={verificationResult} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Verify;