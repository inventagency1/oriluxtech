import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VeralixGradientOverlay } from "@/components/ui/veralix-gradient-overlay";
import { useSEO } from "@/utils/seoHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCertificatePDFDownload } from "@/hooks/useCertificatePDFDownload";
import {
  Download,
  Shield,
  Share2,
  Copy,
  Eye,
  Gem,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Calendar,
  Package,
  Clock
} from "lucide-react";

interface CertificateData {
  certificate_id: string;
  certificate_pdf_url: string | null;
  social_image_url: string | null;
  blockchain_verification_url?: string | null;
  transaction_hash?: string | null;
  block_number?: string | null;
  token_id?: string | null;
  contract_address?: string | null;
  blockchain_network: string;
  is_verified: boolean;
  
  // Oriluxchain fields
  orilux_blockchain_hash?: string | null;
  orilux_blockchain_status?: 'pending' | 'verified' | null;
  orilux_verification_url?: string | null;
  orilux_block_number?: number | null;
  orilux_tx_hash?: string | null;
  
  qr_code_url?: string | null;
  jewelry_items: {
    id: string;
    name: string;
    type: string;
    main_image_url: string | null;
    description: string | null;
    materials: string[] | null;
    weight: number | null;
    sale_price: number | null;
    currency: string | null;
  } | null;
  created_at: string;
}

const ViewCertificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { downloadPDF, isDownloading } = useCertificatePDFDownload();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [socialImageUrl, setSocialImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);

  // Múltiples gateways IPFS para fallback (ipfs.io primero porque permite HTML)
  const IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://w3s.link/ipfs/',
    'https://gateway.pinata.cloud/ipfs/'  // Pinata al final porque bloquea HTML
  ];

  const certificateUrl = `https://veralix.io/certificate/${id}`;

  useSEO({
    title: certificate
      ? `✓ Certificado Verificado: ${certificate.jewelry_items?.name} | Veralix`
      : "Certificado Digital NFT | Veralix",
    description: certificate
      ? `Joya certificada en blockchain con Veralix. ${certificate.jewelry_items?.name} - ID: ${certificate.certificate_id}`
      : "Certificado de autenticidad blockchain para joyas certificadas con Veralix",
    keywords: "certificado digital NFT, blockchain joyería, autenticidad verificada",
    ogImage: certificate?.social_image_url || certificate?.jewelry_items?.main_image_url || undefined,
    canonical: certificateUrl,
  });

  useEffect(() => {
    if (id) {
      fetchCertificate();
    }
  }, [id]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      setError(false);

    const { data, error: fetchError } = await supabase
      .from("nft_certificates")
      .select(
        `
        certificate_id,
        certificate_pdf_url,
        social_image_url,
        blockchain_verification_url,
        transaction_hash,
        block_number,
        token_id,
        contract_address,
        qr_code_url,
        created_at,
        blockchain_network,
        is_verified,
        orilux_blockchain_hash,
        orilux_blockchain_status,
        orilux_verification_url,
        orilux_block_number,
        orilux_tx_hash,
        jewelry_items (
          id,
          name,
          type,
          main_image_url,
          description,
          materials,
          weight,
          sale_price,
          currency
        )
      `
      )
      .eq("certificate_id", id)
      .single();

      if (fetchError || !data) {
        console.error("Error fetching certificate:", fetchError);
        setError(true);
        toast({
          title: "Certificado no encontrado",
          description: "El certificado solicitado no existe o no está disponible",
          variant: "destructive",
        });
        return;
      }

      setCertificate(data as any);

      // Transform IPFS URLs with primary gateway
      if (data?.certificate_pdf_url) {
        const ipfsHash = data.certificate_pdf_url.replace("ipfs://", "");
        setPdfUrl(`${IPFS_GATEWAYS[0]}${ipfsHash}`);
      }

      if (data?.social_image_url) {
        const ipfsHash = data.social_image_url.replace("ipfs://", "");
        setSocialImageUrl(`${IPFS_GATEWAYS[0]}${ipfsHash}`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate?.certificate_pdf_url || !pdfUrl) {
      toast({
        title: "Certificado no disponible",
        description: "El certificado aún no está disponible para descarga",
        variant: "destructive",
      });
      return;
    }

    await downloadPDF(pdfUrl, certificate.certificate_id);
  };

  const handleRetryDownload = () => {
    setCurrentGatewayIndex(0);
    setPdfError(false);
    handleDownload();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificateUrl);
    toast({
      title: "Enlace copiado",
      description: "El enlace del certificado se copió al portapapeles",
    });
  };

  const handleViewBlockchain = () => {
    if (certificate?.blockchain_verification_url) {
      window.open(certificate.blockchain_verification_url, "_blank");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado Veralix - ${certificate?.jewelry_items?.name}`,
          text: `Mira este certificado de autenticidad verificado en blockchain`,
          url: certificateUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-veralix-gold" />
            <p className="text-muted-foreground">Cargando certificado...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !certificate) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-heading font-bold">Certificado no encontrado</h2>
            <p className="text-muted-foreground">
              No pudimos encontrar el certificado solicitado. Verifica el enlace e intenta nuevamente.
            </p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const jewelry = certificate.jewelry_items;

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        {jewelry?.main_image_url ? (
          <img
            src={jewelry.main_image_url}
            alt={jewelry.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-veralix-gold/20 to-background" />
        )}
        <VeralixGradientOverlay variant="premium" opacity={40} />
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container max-w-6xl mx-auto p-6 pb-8">
            {certificate.orilux_blockchain_status === 'verified' ? (
              <Badge className="mb-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                ✅ Verificado en Oriluxchain
              </Badge>
            ) : certificate.orilux_blockchain_status === 'pending' ? (
              <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                ⏳ Minando en Blockchain...
              </Badge>
            ) : (
              <Badge className="mb-3 bg-veralix-gold text-veralix-black border-0">
                <Shield className="w-3 h-3 mr-1" />
                Certificado NFT Veralix
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
              {jewelry?.name}
            </h1>
            <p className="text-xl text-veralix-gold-light">
              Certificado #{certificate.certificate_id}
            </p>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className="container max-w-6xl mx-auto px-6 -mt-16 relative z-10 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1: Detalles de la Joya */}
          <Card className="border-veralix-gold/20 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-veralix-gold">
                <Gem className="w-5 h-5" />
                Detalles de la Pieza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Tipo</dt>
                <dd className="font-semibold text-foreground capitalize">{jewelry?.type}</dd>
              </div>
              {jewelry?.materials && jewelry.materials.length > 0 && (
                <div>
                  <dt className="text-sm text-muted-foreground">Materiales</dt>
                  <dd className="font-semibold text-foreground">
                    {jewelry.materials.join(", ")}
                  </dd>
                </div>
              )}
              {jewelry?.weight && (
                <div>
                  <dt className="text-sm text-muted-foreground">Peso</dt>
                  <dd className="font-semibold text-foreground">{jewelry.weight}g</dd>
                </div>
              )}
              {jewelry?.sale_price && (
                <div>
                  <dt className="text-sm text-muted-foreground">Valor Declarado</dt>
                  <dd className="font-semibold text-veralix-gold">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: jewelry.currency || "COP",
                      minimumFractionDigits: 0,
                    }).format(jewelry.sale_price)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Certificación
                </dt>
                <dd className="font-semibold text-foreground">
                  {new Date(certificate.created_at).toLocaleDateString("es-CO")}
                </dd>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Verificación Oriluxchain */}
          <Card className="border-veralix-gold/20 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-veralix-gold">
                <Shield className="w-5 h-5" />
                Verificación Oriluxchain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Estado de Verificación */}
              {certificate.orilux_blockchain_status === 'verified' ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-500">✅ Verificado en Blockchain</p>
                    <p className="text-xs text-muted-foreground">Certificado inmutable en Oriluxchain</p>
                  </div>
                </div>
              ) : certificate.orilux_blockchain_status === 'pending' ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                  <div>
                    <p className="font-semibold text-amber-500">⏳ Pendiente de Minería</p>
                    <p className="text-xs text-muted-foreground">El bloque está siendo procesado</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-500/10 border border-gray-500/30">
                  <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-semibold text-muted-foreground">No registrado en blockchain</p>
                    <p className="text-xs text-muted-foreground">Certificado en validación</p>
                  </div>
                </div>
              )}
              
              {/* Hash de Blockchain */}
              {certificate.orilux_blockchain_hash && (
                <div>
                  <dt className="text-sm text-muted-foreground">Blockchain Hash</dt>
                  <dd className="font-mono text-xs text-foreground flex items-center gap-2 break-all">
                    <span className="truncate flex-1">
                      {certificate.orilux_blockchain_hash.slice(0, 12)}...
                      {certificate.orilux_blockchain_hash.slice(-10)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(certificate.orilux_blockchain_hash!);
                        toast({ title: "Hash copiado al portapapeles" });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </dd>
                </div>
              )}
              
              {/* Número de Bloque */}
              {certificate.orilux_block_number && (
                <div>
                  <dt className="text-sm text-muted-foreground">Bloque</dt>
                  <dd className="font-semibold text-foreground">
                    #{certificate.orilux_block_number}
                  </dd>
                </div>
              )}
              
              {/* Red Blockchain */}
              <div>
                <dt className="text-sm text-muted-foreground">Red Blockchain</dt>
                <dd className="font-semibold text-foreground">
                  {certificate.blockchain_network || 'Crestchain'}
                </dd>
              </div>
              
              {/* Token ID (Info complementaria) */}
              {certificate.token_id && (
                <div>
                  <dt className="text-sm text-muted-foreground">Token ID</dt>
                  <dd className="font-semibold text-foreground text-xs">
                    #{certificate.token_id}
                  </dd>
                </div>
              )}
              
            </CardContent>
          </Card>

          {/* Card 3: Acciones */}
          <Card className="border-veralix-gold/20 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-veralix-gold" />
                Acciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-gradient-veralix-gold hover:shadow-veralix-gold"
                onClick={handleDownload}
                disabled={isDownloading || !pdfUrl}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </>
                )}
              </Button>
              
              {!pdfUrl && (
                <p className="text-xs text-muted-foreground text-center">
                  El certificado PDF aún no está disponible
                </p>
              )}
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  const verificationUrl = certificate.orilux_verification_url || certificate.blockchain_verification_url;
                  if (verificationUrl) {
                    window.open(verificationUrl, "_blank");
                  }
                }}
                disabled={!certificate.orilux_verification_url && !certificate.blockchain_verification_url}
              >
                <Eye className="mr-2 h-4 w-4" />
                Verificar en Oriluxchain
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                onClick={handleCopyLink}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Enlace
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Descripción */}
        {jewelry?.description && (
          <Card className="mt-6 border-veralix-gold/20">
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {jewelry.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* QR Code Section */}
        {certificate.qr_code_url && (
          <Card className="mt-6 border-veralix-gold/20">
            <CardContent className="flex flex-col items-center py-8">
              <h3 className="text-xl font-semibold mb-2">Código QR del Certificado</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                Escanea para verificar la autenticidad desde cualquier dispositivo
              </p>
              <div className="relative p-4 bg-white rounded-lg shadow-inner">
                <img
                  src={certificate.qr_code_url}
                  alt="QR Code del Certificado"
                  className="w-48 h-48"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Separator className="mb-4" />
          <p className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-veralix-gold" />
            Este certificado está respaldado por tecnología blockchain y es verificable públicamente
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default ViewCertificate;
