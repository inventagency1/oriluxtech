import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Gem, 
  Palette, 
  MapPin, 
  ExternalLink,
  Download,
  Share2,
  Copy,
  FileText,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { JewelryImage } from '@/components/jewelry/JewelryImage';
import { JewelryImageGallery } from '@/components/jewelry/JewelryImageGallery';

interface VerificationDetailsProps {
  data: {
    id: string;
    name: string;
    isVerified: boolean;
    certificationDate: string;
    jewelry: {
      type: string;
      materials: string[];
      weight: string;
      origin: string;
      artisan: string;
      description: string;
      value: string;
    };
    blockchain_data: {
      tokenId: string;
      contractAddress: string;
      transactionHash: string;
      blockNumber: string;
    };
  };
}

export function VerificationDetails({ data }: VerificationDetailsProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.id);
    toast({
      title: "ID copiado",
      description: "El ID del certificado se ha copiado al portapapeles",
    });
  };

  const handleCopyTxHash = () => {
    navigator.clipboard.writeText(data.blockchain_data.transactionHash);
    toast({
      title: "Hash copiado",
      description: "El hash de la transacción se ha copiado al portapapeles",
    });
  };

  const handleCopyContract = () => {
    navigator.clipboard.writeText(data.blockchain_data.contractAddress);
    toast({
      title: "Contrato copiado",
      description: "La dirección del contrato se ha copiado al portapapeles",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Enlace copiado",
      description: "El enlace de verificación se ha copiado al portapapeles",
    });
  };

  const handleViewCertificate = () => {
    const certificateUrl = `/certificate/${data.id}`;
    navigate(certificateUrl);
  };

  const handleDownload = () => {
    toast({
      title: "Certificado descargado",
      description: "El certificado PDF se ha descargado exitosamente",
    });
  };

  const openExplorer = () => {
    if (data.blockchain_data.transactionHash !== 'Pendiente') {
      window.open(`https://scan.crestchain.pro/tx/${data.blockchain_data.transactionHash}`, '_blank');
    }
  };

  const openExplorerAddress = () => {
    if (data.blockchain_data.contractAddress !== 'Pendiente') {
      window.open(`https://scan.crestchain.pro/address/${data.blockchain_data.contractAddress}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Header Premium Veralix */}
      <Card className="shadow-premium border-2 border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold glow-gold">
                <Gem className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold font-heading text-gradient-gold">{data.name}</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Certificado ID:</span>
                  <code className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-md text-sm font-mono font-bold text-primary">{data.id}</code>
                  <Button variant="ghost" size="sm" onClick={handleCopyId} className="h-7 w-7 p-0 hover:bg-primary/10">
                    <Copy className="w-3.5 h-3.5 text-primary" />
                  </Button>
                </div>
              </div>
            </div>
            
            <Badge className={
              data.isVerified 
                ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-700 border-2 border-green-500/40 text-base px-5 py-2.5 shadow-lg"
                : "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-700 border-2 border-yellow-500/40 text-base px-5 py-2.5 shadow-lg"
            }>
              {data.isVerified ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Verificado en Blockchain
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Procesando Verificación
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={handleShare} variant="outline" size="sm" className="border-primary/30 hover:bg-primary/5 hover:border-primary/50">
              <Share2 className="w-4 h-4 mr-2" />
              Compartir Certificado
            </Button>
            {data.isVerified && (
              <Button onClick={handleDownload} className="bg-gradient-gold hover:shadow-gold transition-premium text-white font-semibold">
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Jewelry Details Premium */}
        <Card className="shadow-premium border-primary/10 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="bg-gradient-gold rounded-t-lg">
            <CardTitle className="font-heading flex items-center text-white">
              <Gem className="w-5 h-5 mr-2" />
              Detalles de la Joya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Jewelry Image Placeholder */}
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center mb-4">
              <Gem className="w-16 h-16 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                <Label className="text-xs uppercase tracking-wider text-primary font-semibold">Tipo</Label>
                <p className="font-bold capitalize text-lg mt-1">{data.jewelry.type}</p>
              </div>
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                <Label className="text-xs uppercase tracking-wider text-primary font-semibold">Peso</Label>
                <p className="font-bold text-lg mt-1">{data.jewelry.weight}</p>
              </div>
              <div className="bg-gradient-gold p-3 rounded-lg shadow-gold col-span-2">
                <Label className="text-xs uppercase tracking-wider text-white font-semibold">Valor Estimado</Label>
                <p className="font-bold text-white text-2xl mt-1">{data.jewelry.value}</p>
              </div>
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 col-span-2">
                <Label className="text-xs uppercase tracking-wider text-primary font-semibold">Origen</Label>
                <p className="font-bold flex items-center mt-1 text-lg">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  {data.jewelry.origin}
                </p>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <Label className="text-xs uppercase tracking-wider text-primary font-semibold mb-3 block">Materiales Preciosos</Label>
              <div className="flex flex-wrap gap-2">
                {data.jewelry.materials.map((material: string, index: number) => (
                  <Badge key={index} className="bg-gradient-gold text-white border-none px-3 py-1.5">
                    <Palette className="w-3.5 h-3.5 mr-1.5" />
                    {material}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <Label className="text-xs uppercase tracking-wider text-primary font-semibold">Artesano/Joyería</Label>
              <p className="font-semibold text-lg mt-1">{data.jewelry.artisan}</p>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <Label className="text-xs uppercase tracking-wider text-primary font-semibold mb-2 block">Descripción</Label>
              <p className="text-sm leading-relaxed">{data.jewelry.description}</p>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
              <Label className="text-xs uppercase tracking-wider text-primary font-semibold">Fecha de Certificación</Label>
              <p className="font-bold text-lg mt-1">{data.certificationDate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Details Premium - CrestChain */}
        <Card className="shadow-premium border-emerald-500/20 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-lg relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBsMjAgMjBIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30"></div>
            <CardTitle className="font-heading flex items-center text-white relative z-10">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="block">CrestChain Mainnet</span>
                <span className="text-xs font-normal opacity-80">Chain ID: 85523 • Verificación Inmutable</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Network Badge */}
            <div className="flex items-center justify-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-semibold text-sm">Red Principal Activa</span>
              <span className="text-xs text-emerald-500/70">• scan.crestchain.pro</span>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-emerald-500/20 backdrop-blur">
                <Label className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2 block">🎫 Token ID (NFT)</Label>
                <p className="font-mono text-lg font-bold text-white bg-slate-900/50 px-3 py-2 rounded border border-emerald-500/10">
                  #{data.blockchain_data.tokenId}
                </p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg border border-emerald-500/20 backdrop-blur">
                <Label className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2 block">📜 Smart Contract</Label>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-xs font-medium text-emerald-300 bg-slate-900/50 px-3 py-2 rounded border border-emerald-500/10 flex-1 break-all">
                    {data.blockchain_data.contractAddress}
                  </p>
                  {data.blockchain_data.contractAddress !== 'Pendiente' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleCopyContract} className="hover:bg-emerald-500/20 text-emerald-400">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={openExplorerAddress} className="hover:bg-emerald-500/20 text-emerald-400">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg border border-emerald-500/20 backdrop-blur">
                <Label className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2 block">🔗 Transaction Hash</Label>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-xs font-medium text-emerald-300 bg-slate-900/50 px-3 py-2 rounded border border-emerald-500/10 flex-1 break-all">
                    {data.blockchain_data.transactionHash}
                  </p>
                  {data.blockchain_data.transactionHash !== 'Pendiente' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleCopyTxHash} className="hover:bg-emerald-500/20 text-emerald-400">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={openExplorer} className="hover:bg-emerald-500/20 text-emerald-400">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-emerald-500/20 backdrop-blur">
                  <Label className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2 block">⛓️ Block</Label>
                  <p className="font-mono text-lg font-bold text-white">
                    #{data.blockchain_data.blockNumber}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-emerald-500/20 backdrop-blur">
                  <Label className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2 block">⚡ Gas Token</Label>
                  <p className="font-mono text-lg font-bold text-white">
                    TCT
                  </p>
                </div>
              </div>
            </div>

            {data.isVerified && (
              <div className="mt-6 p-5 bg-gradient-to-r from-green-500/15 to-green-600/10 border-2 border-green-500/30 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3 text-green-700 mb-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold text-lg">Verificación Blockchain Completa</span>
                </div>
                <p className="text-sm text-green-600 leading-relaxed">
                  Esta joya ha sido registrada como NFT y verificada exitosamente en blockchain. 
                  La autenticidad está garantizada por tecnología inmutable.
                </p>
              </div>
            )}

            {!data.isVerified && (
              <div className="mt-6 p-5 bg-gradient-to-r from-yellow-500/15 to-yellow-600/10 border-2 border-yellow-500/30 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3 text-yellow-700 mb-2">
                  <Clock className="w-6 h-6" />
                  <span className="font-bold text-lg">Certificado en Proceso</span>
                </div>
                <p className="text-sm text-yellow-600 leading-relaxed">
                  El certificado NFT está siendo procesado en la blockchain. 
                  La verificación completa estará disponible en breve.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate PDF Access Card */}
        <Card className="shadow-premium border-primary/10 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="bg-gradient-gold rounded-t-lg">
            <CardTitle className="font-heading flex items-center text-white">
              <FileText className="w-5 h-5 mr-2" />
              Acceder al Certificado Digital
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Visualiza el certificado oficial en formato PDF o descárgalo para tus registros.
            </p>
            
            <Button 
              className="w-full bg-gradient-gold hover:scale-105 transition-transform" 
              size="lg"
              onClick={handleViewCertificate}
            >
              <Eye className="mr-2 h-5 w-5" />
              Ver Certificado Digital Completo
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              size="lg"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-5 w-5" />
              Descargar PDF
            </Button>

            <Button 
              variant="outline" 
              className="w-full"
              size="lg"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Compartir Verificación
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}