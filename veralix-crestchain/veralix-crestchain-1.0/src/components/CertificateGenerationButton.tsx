import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Loader2, 
  CheckCircle, 
  ExternalLink,
  Copy,
  QrCode,
  AlertCircle,
  Package,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNFTCertificate } from '@/hooks/useNFTCertificate';
import { useCertificateBalance } from '@/hooks/useCertificateBalance';
import { useToast } from '@/hooks/use-toast';

interface CertificateGenerationButtonProps {
  jewelryItemId: string;
  jewelryName: string;
  jewelryType: string;
  currentStatus: string;
  onStatusUpdate?: () => void;
}

export function CertificateGenerationButton({ 
  jewelryItemId, 
  jewelryName, 
  jewelryType,
  currentStatus,
  onStatusUpdate 
}: CertificateGenerationButtonProps) {
  const { generateCertificate, loading } = useNFTCertificate();
  const { 
    balance,
    hasAvailableCertificates,
    getAvailableCertificates,
    isLowBalance,
    loading: balanceLoading 
  } = useCertificateBalance();
  const { toast } = useToast();
  
  const [certificateResult, setCertificateResult] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleGenerateCertificate = async () => {
    // Validar balance antes de generar
    if (!hasAvailableCertificates()) {
      toast({
        variant: "destructive",
        title: "Sin certificados disponibles",
        description: "Necesitas comprar un pack de certificados para continuar",
      });
      return;
    }

    try {
      const result = await generateCertificate(jewelryItemId);
      
      if (result.success) {
        setCertificateResult(result);
        onStatusUpdate?.();
        
        toast({
          title: "¡Certificado generado!",
          description: `Certificado creado exitosamente. Te quedan ${getAvailableCertificates() - 1} certificados`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al generar certificado",
        description: error.message || "Ocurrió un error inesperado",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${type} copiado al portapapeles`,
    });
  };

  const openVerificationUrl = (url: string) => {
    window.open(url, '_blank');
  };

  if (!isInitialized || balanceLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado 1: Ya certificado - Mostrar detalles
  if (certificateResult?.success) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">¡Certificado Generado!</CardTitle>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Certificado Creado
            </Badge>
          </div>
          <CardDescription>
            Certificado NFT creado exitosamente para "{jewelryName}"
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ID del Certificado</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  {certificateResult.certificate.id}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(certificateResult.certificate.id, "ID del certificado")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hash de Transacción</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  {certificateResult.certificate.transactionHash.slice(0, 20)}...
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(certificateResult.certificate.transactionHash, "Hash de transacción")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openVerificationUrl(certificateResult.certificate.certificateViewUrl || certificateResult.certificate.verificationUrl)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Certificado PDF
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => openVerificationUrl(certificateResult.certificate.blockchainVerificationUrl || certificateResult.certificate.verificationUrl.replace('/certificate/', '/verify/'))}
            >
              <Shield className="w-4 h-4 mr-2" />
              Ver Blockchain
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => openVerificationUrl(certificateResult.certificate.qrCodeUrl)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Código QR
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado 2: Ya certificado anteriormente
  if (currentStatus === 'certified' || currentStatus === 'certificado') {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Certificado NFT Generado</CardTitle>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Certificado
            </Badge>
          </div>
          <CardDescription>
            El certificado NFT para "{jewelryName}" ha sido generado exitosamente
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Estado 3: Sin certificados disponibles - Redirigir a compra
  if (!hasAvailableCertificates()) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Sin certificados disponibles</CardTitle>
          </div>
          <CardDescription>
            Necesitas comprar un pack de certificados para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm">
              Los certificados se compran en paquetes y se descuentan automáticamente cuando generas un certificado NFT.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-primary" />
              <span className="font-semibold">Certificados disponibles: 0</span>
            </div>
          </div>

          <Button 
            asChild
            className="w-full"
            size="lg"
          >
            <Link to="/pricing">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Comprar Pack de Certificados
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Estado 4: Tiene certificados - Permitir generar
  const availableCerts = getAvailableCertificates();
  const isLow = isLowBalance();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Generar Certificado NFT</span>
          <Badge variant={isLow ? "destructive" : "secondary"} className="ml-2">
            {availableCerts} {availableCerts === 1 ? 'certificado' : 'certificados'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Crea un certificado digital único para {jewelryName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLow && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ¡Quedan pocos certificados! Considera comprar más para no quedarte sin disponibilidad.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold">Información del Certificado</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p><strong>Artículo:</strong> {jewelryName}</p>
            <p><strong>Tipo:</strong> {jewelryType}</p>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Se descontará 1 certificado de tu pack</p>
              <p className="text-muted-foreground">
                Después de generar te quedarán <strong>{availableCerts - 1}</strong> certificados disponibles
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleGenerateCertificate}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando certificado...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              Generar Certificado NFT
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          El certificado se generará inmediatamente y se descontará de tu pack automáticamente.
        </p>
      </CardContent>
    </Card>
  );
}
