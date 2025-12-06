import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Gem, 
  Search, 
  Download, 
  Eye, 
  Calendar,
  MoreHorizontal,
  Copy,
  Share,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { JewelryImage } from "@/components/jewelry/JewelryImage";
import { CertificateTransferModal } from "@/components/certificates/CertificateTransferModal";
import { PendingTransfersPanel } from "@/components/certificates/PendingTransfersPanel";

const Certificates = () => {
  const { user } = useAuth();
  const { role, isJoyero } = useUserRole();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const [transferModal, setTransferModal] = useState<{
    open: boolean;
    certificateId: string;
    certificateName: string;
  }>({
    open: false,
    certificateId: '',
    certificateName: '',
  });

  useEffect(() => {
    if (user) {
      loadCertificates();
    }
  }, [user, role, currentPage]);

  const loadCertificates = async () => {
    if (!user?.id) {
      console.log('No user ID, skipping certificate load');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading certificates for user:', user.id);

      // Get paginated data
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      console.log('Fetching certificates for user:', user.id, 'page:', currentPage);

      // Query ONLY certificates - NO joins
      const { data: certsData, error: certsError } = await supabase
        .from('nft_certificates')
        .select('id, certificate_id, property_id, user_id, owner_id, created_at, is_verified, blockchain_network, transaction_hash, token_id, metadata_uri, certificate_pdf_url, qr_code_url, social_image_url')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (certsError) {
        console.error('Certificates query error:', certsError);
        throw certsError;
      }

      console.log('Raw certificates:', certsData);

      // Fetch jewelry items for these certificates
      let data = certsData || [];
      if (data.length > 0) {
        const jewelryIds = data.map(c => c.property_id).filter(Boolean);
        const { data: jewelryData, error: jewelryError } = await supabase
          .from('jewelry_items')
          .select('id, user_id, name, type, materials, sale_price, currency, status, images_count, main_image_url, image_urls')
          .in('id', jewelryIds);

        if (jewelryError) {
          console.error('Jewelry query error:', jewelryError);
        } else {
          // Merge jewelry data into certificates
          data = data.map(cert => ({
            ...cert,
            jewelry_items: jewelryData?.find(j => j.id === cert.property_id) || null
          }));
        }
      }

      const error = null;

      if (error) {
        console.error('Query error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      // Filter client-side if needed
      const filteredData = data?.filter(cert => 
        cert.user_id === user.id || cert.owner_id === user.id
      ) || [];

      console.log('All certificates from RLS:', data?.length || 0);
      console.log('Filtered for user:', filteredData.length);
      console.log('Certificates:', filteredData);

      setTotalCount(filteredData.length);
      setCertificates(filteredData);
    } catch (error: any) {
      console.error('Error loading certificates:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      toast({
        title: "Error",
        description: error?.message || "No se pudieron cargar los certificados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (isVerified: boolean, jewelryStatus?: string) => {
    if (isVerified) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">Certificado</Badge>;
    }
    
    switch (jewelryStatus) {
      case "draft":
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Pendiente</Badge>;
      case "pending":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Procesando</Badge>;
      default:
        return <Badge variant="secondary">Sin certificar</Badge>;
    }
  };

  // Mapear certificados con información de joyas (memoizado)
  const mappedCertificates = useMemo(() => certificates.map(cert => ({
    id: cert.certificate_id,
    jewelry_item_id: cert.jewelry_items?.id,
    user_id: cert.jewelry_items?.user_id,
    name: cert.jewelry_items?.name || 'Joya sin nombre',
    type: cert.jewelry_items?.type || 'Sin tipo',
    status: cert.is_verified ? 'certificado' : cert.jewelry_items?.status || 'pendiente',
    date: new Date(cert.created_at).toLocaleDateString('es-CO'),
    value: cert.jewelry_items?.sale_price ? 
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: cert.jewelry_items?.currency || 'COP',
        minimumFractionDigits: 0
      }).format(cert.jewelry_items.sale_price) : 'Sin precio',
    materials: cert.jewelry_items?.materials || [],
    blockchain: cert.blockchain_network || 'CrestChain',
    txHash: cert.transaction_hash || '',
    nftId: cert.token_id || '',
    customer: isJoyero ? 'Cliente confidencial' : 'Mi certificado',
    images_count: cert.jewelry_items?.images_count || 0,
    main_image_url: cert.jewelry_items?.main_image_url,
    image_urls: cert.jewelry_items?.image_urls,
    isVerified: cert.is_verified,
    verificationDate: cert.verification_date,
    certificatePdfUrl: cert.certificate_pdf_url,
    verificationUrl: cert.verification_url,
    qrCodeUrl: cert.qr_code_url
  })), [certificates, isJoyero]);

  const filteredCertificates = useMemo(() => mappedCertificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || cert.status === filterStatus;
    const matchesType = filterType === "all" || cert.type.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  }), [mappedCertificates, searchTerm, filterStatus, filterType]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Hash copiado al portapapeles",
    });
  };

  const downloadCertificate = (pdfUrl: string | null, certificateId: string) => {
    if (!pdfUrl) {
      toast({
        title: "PDF no disponible",
        description: "Este certificado no tiene PDF generado",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convertir IPFS URL a gateway público
      let downloadUrl = pdfUrl;
      if (pdfUrl.startsWith('ipfs://')) {
        const ipfsHash = pdfUrl.replace('ipfs://', '');
        downloadUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
      }
      
      // Abrir en nueva pestaña
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Descargando certificado",
        description: "El PDF se abrirá en una nueva pestaña",
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el certificado",
        variant: "destructive",
      });
    }
  };

  const shareCertificate = async (verificationUrl: string | null, certificateName: string) => {
    if (!verificationUrl) {
      toast({
        title: "URL no disponible",
        description: "Este certificado no tiene URL de verificación",
        variant: "destructive",
      });
      return;
    }

    try {
      if (navigator.share) {
        // API Web Share (móviles)
        await navigator.share({
          title: `Certificado NFT: ${certificateName}`,
          text: `Verifica la autenticidad de ${certificateName}`,
          url: verificationUrl,
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(verificationUrl);
        toast({
          title: "¡Enlace copiado!",
          description: "URL de verificación copiada al portapapeles",
        });
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast({
        title: "Error al compartir",
        description: "No se pudo compartir el certificado",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: mappedCertificates.length,
    certificados: mappedCertificates.filter(c => c.status === "certificado").length,
    pendientes: mappedCertificates.filter(c => c.status === "pendiente").length,
    procesando: mappedCertificates.filter(c => c.status === "procesando").length
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading mb-2">
              {isJoyero ? 'Mis Certificados NFT' : 'Certificados de Mis Joyas'}
            </h1>
            <p className="text-muted-foreground">
              {isJoyero ? 
                'Gestiona todos los certificados que has creado' :
                'Consulta los certificados de autenticidad de tus joyas'
              }
            </p>
          </div>
          
          <Button asChild className="bg-gradient-gold hover:shadow-gold transition-premium mt-4 md:mt-0">
            <Link to="/nueva-joya">
              <Gem className="w-4 h-4 mr-2" />
              Nuevo Certificado
            </Link>
          </Button>
        </div>

        {/* Pending Transfers Panel */}
        <PendingTransfersPanel />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-premium transition-premium">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold mb-1">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-crypto transition-premium">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{stats.certificados}</div>
              <div className="text-sm text-muted-foreground">Certificados</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-premium transition-premium">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pendientes}</div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-crypto transition-premium">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{stats.procesando}</div>
              <div className="text-sm text-muted-foreground">Procesando</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-premium border-border/50 mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, ID o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="certificado">Certificados</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="procesando">Procesando</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Anillo">Anillos</SelectItem>
                  <SelectItem value="Collar">Collares</SelectItem>
                  <SelectItem value="Pulsera">Pulseras</SelectItem>
                  <SelectItem value="Pendientes">Pendientes</SelectItem>
                  <SelectItem value="Reloj">Relojes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Certificates List */}
        <div className="space-y-4">
          {filteredCertificates.map((cert) => (
            <Card key={cert.id} className="shadow-premium border-border/50 hover:shadow-gold transition-premium">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start space-x-4 flex-1">
                 {cert.images_count > 0 ? (
                  <JewelryImage 
                    jewelry={{
                      id: cert.jewelry_item_id,
                      user_id: cert.user_id,
                      name: cert.name,
                      main_image_url: cert.main_image_url,
                      images_count: cert.images_count
                    }}
                    size="thumbnail"
                    className="w-12 h-12 rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gem className="w-6 h-6 text-primary-foreground" />
                  </div>
                )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold font-heading truncate">{cert.name}</h3>
                        {getStatusBadge(cert.isVerified, cert.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center space-x-4">
                          <span>ID: {cert.id}</span>
                          <span>Cliente: {cert.customer}</span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {cert.date}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {cert.materials.map((material, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
                        
                        {cert.txHash && (
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-primary">✓ Blockchain: {cert.blockchain}</span>
                            <button
                              onClick={() => copyToClipboard(cert.txHash)}
                              className="flex items-center text-muted-foreground hover:text-foreground"
                            >
                              <span className="font-mono">{cert.txHash.slice(0, 10)}...</span>
                              <Copy className="w-3 h-3 ml-1" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between lg:justify-end space-x-2">
                    <div className="text-right lg:mr-4">
                      <div className="font-semibold">{cert.value}</div>
                      <div className="text-xs text-muted-foreground">{cert.images_count} imágenes</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/verify/${cert.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      
                      {cert.isVerified && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadCertificate(cert.certificatePdfUrl, cert.id)}
                            disabled={!cert.certificatePdfUrl}
                            title={cert.certificatePdfUrl ? "Descargar PDF" : "PDF no disponible"}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (cert.qrCodeUrl) window.open(cert.qrCodeUrl, '_blank');
                            }}
                            disabled={!cert.qrCodeUrl}
                            title={cert.qrCodeUrl ? "Ver Código QR" : "QR no disponible"}
                          >
                            QR
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => shareCertificate(cert.verificationUrl, cert.name)}
                            title="Compartir certificado"
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setTransferModal({
                              open: true,
                              certificateId: cert.jewelry_item_id,
                              certificateName: cert.name,
                            })}
                            title="Transferir certificado"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          <DropdownMenuItem onClick={() => copyToClipboard(cert.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar ID
                          </DropdownMenuItem>
                          {cert.txHash && (
                            <DropdownMenuItem onClick={() => copyToClipboard(cert.txHash)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar TX Hash
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link to={`/verify/${cert.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver verificador
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCertificates.length === 0 && !isLoading && (
          <Card className="shadow-premium border-border/50 text-center py-12">
            <CardContent>
              <Gem className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">
                {searchTerm ? "No se encontraron certificados" : 
                  isJoyero ? "No tienes certificados creados" : "No tienes certificados"
                }
              </CardTitle>
              <CardDescription className="mb-4">
                {searchTerm ? "Prueba ajustando los filtros de búsqueda" :
                  isJoyero ? "Comienza registrando tu primera joya para crear certificados NFT" :
                  "Los certificados de tus joyas aparecerán aquí cuando las registres"
                }
              </CardDescription>
              {!searchTerm && isJoyero && (
                <Button asChild className="bg-gradient-gold hover:shadow-gold transition-premium">
                  <Link to="/nueva-joya">
                    Crear Primer Certificado
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="shadow-premium border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-72" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredCertificates.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} de {totalCount} certificados
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.ceil(totalCount / pageSize))].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === Math.ceil(totalCount / pageSize) ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      <CertificateTransferModal
        open={transferModal.open}
        onOpenChange={(open) => setTransferModal({ ...transferModal, open })}
        certificateId={transferModal.certificateId}
        certificateName={transferModal.certificateName}
        onSuccess={() => loadCertificates()}
      />
    </AppLayout>
  );
};

export default Certificates;