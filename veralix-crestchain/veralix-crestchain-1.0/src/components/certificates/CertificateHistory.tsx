import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Download, 
  Eye, 
  Calendar,
  Filter,
  SortAsc,
  ChevronDown,
  Gem,
  ExternalLink,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCertificateHistory } from "@/hooks/useCertificateHistory";
import { CertificateStats } from "./CertificateStats";
import { CertificateTimeline } from "./CertificateTimeline";
import { JewelryImage } from "@/components/jewelry/JewelryImage";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export const CertificateHistory = () => {
  const { certificates, stats, isLoading } = useCertificateHistory();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set());

  const toggleExpanded = (certId: string) => {
    const newExpanded = new Set(expandedCerts);
    if (newExpanded.has(certId)) {
      newExpanded.delete(certId);
    } else {
      newExpanded.add(certId);
    }
    setExpandedCerts(newExpanded);
  };

  // Filter certificates
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.certificate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.jewelry_items?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "verified" && cert.is_verified) ||
      (filterStatus === "pending" && !cert.is_verified) ||
      (filterStatus === "transferred" && (cert.transfers_count || 0) > 0);
    
    const matchesType = 
      filterType === "all" || 
      cert.jewelry_items?.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort certificates
  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "date-asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "value-desc":
        return (b.jewelry_items?.sale_price || 0) - (a.jewelry_items?.sale_price || 0);
      case "value-asc":
        return (a.jewelry_items?.sale_price || 0) - (b.jewelry_items?.sale_price || 0);
      case "name":
        return (a.jewelry_items?.name || "").localeCompare(b.jewelry_items?.name || "");
      default:
        return 0;
    }
  });

  const formatCurrency = (value: number | null, currency: string = 'COP') => {
    if (!value) return 'Sin precio';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-10 w-10 rounded-full mb-3" />
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <CertificateStats stats={stats} />

      {/* Filters and Search */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="verified">Verificados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="transferred">Transferidos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Más recientes</SelectItem>
                <SelectItem value="date-asc">Más antiguos</SelectItem>
                <SelectItem value="value-desc">Mayor valor</SelectItem>
                <SelectItem value="value-asc">Menor valor</SelectItem>
                <SelectItem value="name">Nombre (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificate List */}
      <div className="space-y-4">
        {sortedCertificates.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <CardTitle className="mb-2">No se encontraron certificados</CardTitle>
              <CardDescription>
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Aún no tienes certificados creados"}
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          sortedCertificates.map((cert) => {
            const isExpanded = expandedCerts.has(cert.id);
            
            return (
              <Collapsible
                key={cert.id}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(cert.id)}
              >
                <Card className="border-border/50 hover:shadow-premium transition-premium">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Main Info */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-4 flex-1">
                          {cert.jewelry_items?.images_count > 0 ? (
                            <JewelryImage 
                              jewelry={{
                                id: cert.jewelry_item_id,
                                user_id: cert.user_id,
                                name: cert.jewelry_items.name,
                                main_image_url: cert.jewelry_items.main_image_url,
                                images_count: cert.jewelry_items.images_count
                              }}
                              size="thumbnail"
                              className="w-16 h-16 rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-gold rounded-lg flex items-center justify-center flex-shrink-0">
                              <Gem className="w-8 h-8 text-primary-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold font-heading text-lg mb-1">
                                  {cert.jewelry_items?.name || 'Sin nombre'}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  {cert.is_verified ? (
                                    <Badge className="bg-primary/20 text-primary border-primary/30">
                                      ✓ Certificado
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Pendiente</Badge>
                                  )}
                                  <Badge variant="outline">{cert.jewelry_items?.type}</Badge>
                                  {(cert.transfers_count || 0) > 0 && (
                                    <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                                      {cert.transfers_count} transferencia(s)
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-semibold text-lg">
                                  {formatCurrency(cert.jewelry_items?.sale_price, cert.jewelry_items?.currency)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {cert.jewelry_items?.images_count || 0} imagen(es)
                                </div>
                              </div>
                            </div>

                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">ID:</span>
                                <code className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[120px] inline-block">{cert.certificate_id}</code>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Creado: {formatDate(cert.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm">
                              {isExpanded ? "Ocultar detalles" : "Ver detalles"}
                              <ChevronDown className={cn(
                                "w-4 h-4 ml-2 transition-transform",
                                isExpanded && "rotate-180"
                              )} />
                            </Button>
                          </CollapsibleTrigger>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/verify/${cert.certificate_id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            {cert.is_verified && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadCertificate(cert.certificate_pdf_url, cert.certificate_id)}
                                disabled={!cert.certificate_pdf_url}
                                title={cert.certificate_pdf_url ? "Descargar PDF" : "PDF no disponible"}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <CollapsibleContent className="space-y-4">
                        <div className="border-t pt-4">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Detalles del Certificado
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Blockchain:</span>
                                  <span className="font-medium">{cert.blockchain_network}</span>
                                </div>
                                {cert.transaction_hash && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">TX Hash:</span>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                      {cert.transaction_hash.slice(0, 10)}...
                                    </code>
                                  </div>
                                )}
                                {cert.jewelry_items?.materials && (
                                  <div>
                                    <span className="text-muted-foreground block mb-1">Materiales:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {cert.jewelry_items.materials.map((material, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {material}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-3 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Timeline de Eventos
                              </h4>
                              <CertificateTimeline 
                                createdAt={cert.created_at}
                                verificationDate={cert.verification_date}
                                lastTransfer={cert.last_transfer}
                                isVerified={cert.is_verified}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/verify/${cert.certificate_id}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver en Verificador
                              </Link>
                            </Button>
                            {cert.is_verified && (
                              <Button 
                                size="sm" 
                                className="bg-gradient-gold hover:shadow-gold transition-premium"
                                onClick={() => downloadCertificate(cert.certificate_pdf_url, cert.certificate_id)}
                                disabled={!cert.certificate_pdf_url}
                                title={cert.certificate_pdf_url ? "Descargar PDF" : "PDF no disponible"}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar PDF
                              </Button>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </CardContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
};
