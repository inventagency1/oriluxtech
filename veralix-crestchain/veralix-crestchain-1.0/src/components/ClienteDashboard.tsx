import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gem, 
  Shield, 
  Search,
  CheckCircle,
  Clock,
  Eye,
  ShoppingBag
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/RoleGuard";
import { useAudit } from "@/hooks/useAudit";
import { BuyerOrdersPanel } from "@/components/marketplace/BuyerOrdersPanel";

export const ClienteDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logAction } = useAudit();
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    verifiedCertificates: 0,
    recentCertificates: 0
  });

  useEffect(() => {
    if (user) {
      // Log dashboard access
      logAction('certificates_view', 'user', user.id, {
        dashboard_type: 'cliente',
        message: 'Cliente accessed dashboard to view certificates'
      });
      loadCertificates();
    }
  }, [user, logAction]);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);

      // Cargar certificados del cliente (sin join)
      const { data: certsRaw, error } = await supabase
        .from('nft_certificates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading certificates:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los certificados",
          variant: "destructive",
        });
        return;
      }

      // Fetch jewelry items separately
      const jewelryIds = (certsRaw || []).map(c => c.property_id).filter(Boolean);
      let jewelryMap: Record<string, any> = {};
      
      if (jewelryIds.length > 0) {
        const { data: jewelryData } = await supabase
          .from('jewelry_items')
          .select('*')
          .in('id', jewelryIds);
        
        jewelryMap = (jewelryData || []).reduce((acc: any, j: any) => ({ ...acc, [j.id]: j }), {});
      }

      const certs = (certsRaw || []).map(cert => ({
        ...cert,
        jewelry_items: jewelryMap[cert.property_id] || null
      }));

      setCertificates(certs || []);

      // Calcular estadísticas
      const totalCertificates = certs?.length || 0;
      const verifiedCertificates = certs?.filter(cert => cert.is_verified).length || 0;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCertificates = certs?.filter(cert => 
        new Date(cert.created_at) > thirtyDaysAgo
      ).length || 0;

      setStats({
        totalCertificates,
        verifiedCertificates,
        recentCertificates
      });

    } catch (error) {
      console.error('Error loading certificates:', error);
      toast({
        title: "Error",
        description: "Error al cargar los certificados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Preparar datos de certificados para mostrar
  const certificatesList = certificates.map(cert => ({
    id: cert.certificate_id,
    jewelryName: cert.jewelry_items?.name || 'Joya sin nombre',
    jewelryType: cert.jewelry_items?.type || 'Tipo no especificado',
    isVerified: cert.is_verified,
    verificationDate: cert.verification_date,
    createdDate: new Date(cert.created_at).toLocaleDateString('es-CO'),
    materials: cert.jewelry_items?.materials || [],
    value: cert.jewelry_items?.sale_price ? 
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: cert.jewelry_items?.currency || 'COP',
        minimumFractionDigits: 0
      }).format(cert.jewelry_items.sale_price) : 'Sin precio'
  }));

  // Filtrar certificados por búsqueda
  const filteredCertificates = certificatesList.filter(cert =>
    cert.jewelryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.jewelryType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.materials.some(material => 
      material.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusBadge = (isVerified: boolean, verificationDate: string | null) => {
    if (isVerified && verificationDate) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">Verificado</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Pendiente</Badge>;
  };

  return (
    <div className="space-y-3 w-full">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-heading mb-1">
          Mis Certificados NFT 💎
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Consulta y verifica los certificados de autenticidad de tus joyas
        </p>
        {isLoading && (
          <div className="mt-1">
            <Badge variant="secondary" className="text-xs">Cargando certificados...</Badge>
          </div>
        )}
      </div>

      {/* Stats Cards - Premium Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
        {[
          { title: "Total Certificados", value: stats.totalCertificates, icon: Gem, subtitle: "Joyas certificadas" },
          { title: "Verificados", value: stats.verifiedCertificates, icon: CheckCircle, subtitle: "Autenticidad confirmada", trend: stats.verifiedCertificates > 0 },
          { title: "Recientes", value: stats.recentCertificates, icon: Clock, subtitle: "Últimos 30 días" }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title}
              className="group relative overflow-hidden shadow-veralix-premium border-border/50 hover:shadow-veralix-gold hover:scale-[1.02] transition-premium animate-fade-scale"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-veralix-gold opacity-0 group-hover:opacity-5 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-heading bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {stat.trend && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                      <span className="text-base">↗</span>
                      {Math.round((stats.verifiedCertificates / Math.max(stats.totalCertificates, 1)) * 100)}%
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>


      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <RoleGuard requiredPermission="verify_certificates">
          <Link to="/verify" className="block">
            <Card className="hover:shadow-crypto transition-premium group cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-gradient-crypto rounded-lg flex items-center justify-center group-hover:shadow-crypto transition-premium">
                     <Shield className="w-6 h-6 text-primary-foreground" />
                   </div>
                  <div>
                    <CardTitle className="font-heading">Verificar Certificado</CardTitle>
                    <CardDescription>
                      Verifica la autenticidad de cualquier joya usando su código único
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </RoleGuard>

        <RoleGuard requiredPermission="view_own_certificates">
          <Link to="/certificados" className="block">
            <Card className="hover:shadow-gold transition-premium group cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center group-hover:shadow-gold transition-premium">
                    <Eye className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="font-heading">Ver Todos los Certificados</CardTitle>
                    <CardDescription>
                      Explora todos tus certificados NFT en detalle
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </RoleGuard>

        <Link to="/marketplace" className="block">
          <Card className="hover:shadow-premium transition-premium group cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:shadow-premium transition-premium">
                  <ShoppingBag className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="font-heading">Marketplace</CardTitle>
                  <CardDescription>
                    Compra joyas certificadas de joyerías verificadas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="certificates" className="w-full">
        <div className="flex flex-col gap-4 mb-4 md:mb-6">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <TabsList className="inline-flex w-auto md:w-full md:grid md:grid-cols-3 h-auto min-w-full">
              <TabsTrigger value="certificates" className="px-4 py-2 text-xs md:text-sm whitespace-nowrap">Mis Certificados</TabsTrigger>
              <TabsTrigger value="verified" className="px-4 py-2 text-xs md:text-sm whitespace-nowrap">Verificados</TabsTrigger>
              <TabsTrigger value="orders" className="px-4 py-2 text-xs md:text-sm whitespace-nowrap">Mis Compras</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar certificados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <TabsContent value="certificates">
          <div className="space-y-4">
            {filteredCertificates.length === 0 && !isLoading ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">
                    {searchTerm ? "No se encontraron certificados" : "No tienes certificados"}
                  </CardTitle>
                  <CardDescription className="mb-4">
                    {searchTerm ? 
                      "Prueba con otro término de búsqueda" :
                      "Cuando adquieras joyas certificadas aparecerán aquí"
                    }
                  </CardDescription>
                  {!searchTerm && (
                    <Button asChild className="bg-gradient-crypto hover:shadow-crypto transition-premium">
                      <Link to="/verify">
                        <Shield className="w-4 h-4 mr-2" />
                        Verificar Certificado
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredCertificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-premium transition-premium">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-crypto rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold font-heading">{cert.jewelryName}</h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {cert.id} • {cert.jewelryType} • {cert.createdDate}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {cert.materials.map((material, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-lg mb-2">{cert.value}</div>
                        {getStatusBadge(cert.isVerified, cert.verificationDate)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="verified">
          <div className="space-y-4">
            {filteredCertificates.filter(cert => cert.isVerified).length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="mb-2">No hay certificados verificados</CardTitle>
                  <CardDescription className="mb-4">
                    Los certificados verificados aparecerán aquí una vez completado el proceso
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              filteredCertificates
                .filter(cert => cert.isVerified)
                .map((cert) => (
                  <Card key={cert.id} className="hover:shadow-premium transition-premium">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold font-heading">{cert.jewelryName}</h3>
                            <p className="text-sm text-muted-foreground">
                              ID: {cert.id} • {cert.jewelryType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Verificado: {new Date(cert.verificationDate!).toLocaleDateString('es-CO')}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {cert.materials.map((material, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-lg mb-2">{cert.value}</div>
                          <Badge className="bg-primary/20 text-primary border-primary/30">Verificado</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <BuyerOrdersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};