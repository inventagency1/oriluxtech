import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gem, 
  Plus, 
  Shield, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  Download,
  ShoppingBag
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/RoleGuard";
import { useAudit } from "@/hooks/useAudit";
import { CertificateBalanceStatus } from "@/components/CertificateBalanceStatus";
import { CertificateGenerationButton } from "@/components/CertificateGenerationButton";
import { MyListings } from "@/components/marketplace/MyListings";
import { JoyeroOrdersPanel } from "@/components/marketplace/JoyeroOrdersPanel";
import { CertificateStatusPanel } from "@/components/certificates/CertificateStatusPanel";
import { RequireWhatsAppModal } from "@/components/RequireWhatsAppModal";

export const JoyeroDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logAction } = useAudit();
  const [searchTerm, setSearchTerm] = useState("");
  const [jewelryItems, setJewelryItems] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresWhatsApp, setRequiresWhatsApp] = useState(false);
  const [stats, setStats] = useState({
    totalJewelry: 0,
    certificatedToday: 0,
    pendingCertifications: 0,
    totalValue: "COP $0"
  });

  useEffect(() => {
    if (user) {
      // Log dashboard access
      logAction('profile_view', 'user', user.id, {
        dashboard_type: 'joyero',
        message: 'Joyero accessed dashboard'
      });
      checkWhatsAppRequirement();
      loadDashboardData();
    }
  }, [user, logAction]);

  const checkWhatsAppRequirement = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', user?.id)
        .single();

      // Verificar si no tiene teléfono o está vacío
      if (!profile?.phone || profile.phone.trim() === '') {
        setRequiresWhatsApp(true);
      }
    } catch (error) {
      console.error('Error checking WhatsApp requirement:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Cargar joyas del joyero
      const { data: jewelry, error: jewelryError } = await supabase
        .from('jewelry_items')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (jewelryError) {
        console.error('Error loading jewelry:', jewelryError);
        toast({
          title: "Error",
          description: "No se pudieron cargar las joyas",
          variant: "destructive",
        });
        return;
      }

      // Cargar certificados del joyero
      const { data: certs, error: certsError } = await supabase
        .from('nft_certificates')
        .select('*, jewelry_items(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (certsError) {
        console.error('Error loading certificates:', certsError);
        toast({
          title: "Error", 
          description: "No se pudieron cargar los certificados",
          variant: "destructive",
        });
        return;
      }

      setJewelryItems(jewelry || []);
      setCertificates(certs || []);

      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const certificatedToday = certs?.filter(cert => 
        cert.created_at.split('T')[0] === today && cert.is_verified
      ).length || 0;

      const pendingCertifications = jewelry?.filter(item => 
        item.status === 'draft' || item.status === 'pending'
      ).length || 0;

      const totalValue = jewelry?.reduce((sum, item) => {
        return sum + (item.sale_price || 0);
      }, 0) || 0;

      setStats({
        totalJewelry: jewelry?.length || 0,
        certificatedToday,
        pendingCertifications,
        totalValue: new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(totalValue)
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Combinar joyas con sus certificados para mostrar
  const recentJewelry = jewelryItems.slice(0, 10).map(item => {
    const certificate = certificates.find(cert => cert.jewelry_item_id === item.id);
    return {
      id: item.id, // Usar el ID real de la joya, no del certificado
      jewelryItemId: item.id, // Agregar ID específico para el certificado
      certificate: certificate, // Incluir todo el certificado para acceso al PDF
      name: item.name,
      type: item.type,
      status: certificate?.is_verified ? 'certificado' : 
              item.status === 'draft' ? 'pendiente' : 'procesando',
      date: new Date(item.created_at).toLocaleDateString('es-CO'),
      value: item.sale_price ? 
        new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: item.currency || 'COP',
          minimumFractionDigits: 0
        }).format(item.sale_price) : 'Sin precio',
      materials: item.materials || []
    };
  });

  // Filtrar joyas por búsqueda
  const filteredJewelry = recentJewelry.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.materials.some(material => 
      material.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "certificado":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Certificado</Badge>;
      case "pendiente":
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">Procesando</Badge>;
    }
  };

  return (
    <>
      {/* Modal bloqueante para WhatsApp */}
      {requiresWhatsApp && user && (
        <RequireWhatsAppModal 
          userId={user.id}
          onComplete={() => {
            setRequiresWhatsApp(false);
            loadDashboardData();
          }}
        />
      )}
      
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-1 md:mb-2">
          Panel de Joyerías 💎
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gestiona tu inventario de joyas y genera certificados NFT
        </p>
        {isLoading && (
          <div className="mt-3 md:mt-4">
            <Badge variant="secondary" className="text-xs">Cargando datos...</Badge>
          </div>
        )}
      </div>

      {/* Balance y Estado de Certificados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CertificateBalanceStatus />
        <CertificateStatusPanel />
      </div>

      {/* Stats Cards - Premium Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { title: "Total Joyas", value: stats.totalJewelry, icon: Gem, subtitle: "En inventario" },
          { title: "Certificadas Hoy", value: stats.certificatedToday, icon: CheckCircle, subtitle: "Nuevos certificados", trend: stats.certificatedToday > 0 },
          { title: "Pendientes", value: stats.pendingCertifications, icon: Clock, subtitle: "Por certificar" },
          { title: "Valor Total", value: stats.totalValue, icon: BarChart3, subtitle: "Inventario total" }
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
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {stat.trend && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                      <span className="text-base">↗</span>
                      Activo
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <Link to="/nueva-joya" className="block">
          <Card className="hover:shadow-gold transition-premium group cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center group-hover:shadow-gold transition-premium">
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="font-heading">Registrar Nueva Joya</CardTitle>
                  <CardDescription>
                    Crea un nuevo certificado NFT para una pieza de joyería
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/certificados" className="block">
          <Card className="hover:shadow-crypto transition-premium group cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-gradient-crypto rounded-lg flex items-center justify-center group-hover:shadow-crypto transition-premium">
                   <Shield className="w-6 h-6 text-primary-foreground" />
                 </div>
                <div>
                  <CardTitle className="font-heading">Gestionar Certificados</CardTitle>
                  <CardDescription>
                    Ver y administrar todos tus certificados NFT
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Marketplace Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Link to="/mi-marketplace" className="block">
          <Card className="hover:shadow-premium transition-premium group cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-premium">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="font-heading">Mi Marketplace</CardTitle>
                  <CardDescription>
                    Gestiona tus productos en venta y ve tus estadísticas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/crear-listado" className="block">
          <Card className="hover:shadow-gold transition-premium group cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center group-hover:shadow-gold transition-premium">
                   <Plus className="w-6 h-6 text-primary-foreground" />
                 </div>
                <div>
                  <CardTitle className="font-heading">Vender Joya</CardTitle>
                  <CardDescription>
                    Crear un nuevo listado en el marketplace
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Nueva sección para Pedidos */}
        <Card className="hover:shadow-crypto transition-premium group cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-crypto rounded-lg flex items-center justify-center group-hover:shadow-crypto transition-premium">
                <ShoppingBag className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="font-heading">Mis Pedidos</CardTitle>
                <CardDescription>
                  Gestiona los pedidos recibidos de tus ventas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Orders Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Panel de Pedidos</span>
              </CardTitle>
              <CardDescription>
                Gestión completa de pedidos recibidos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <JoyeroOrdersPanel />
        </CardContent>
      </Card>

      {/* Recent Jewelry */}
      <Tabs defaultValue="recent" className="w-full">
        <div className="flex flex-col gap-4 mb-4 md:mb-6">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <TabsList className="inline-flex md:grid md:grid-cols-3 w-full h-auto min-w-full">
              <TabsTrigger value="recent" className="flex-1 md:flex-none px-3 py-2 text-xs sm:text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Recientes
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex-1 md:flex-none px-3 py-2 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Pendientes
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex-1 md:flex-none px-3 py-2 text-xs sm:text-sm">
                <ShoppingBag className="w-4 h-4 mr-2" />
                En Venta
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar joyas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>

        <TabsContent value="recent">
          <div className="space-y-4">
            {filteredJewelry.length === 0 && !isLoading ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Gem className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">
                    {searchTerm ? "No se encontraron joyas" : "No tienes joyas registradas"}
                  </CardTitle>
                  <CardDescription className="mb-4">
                    {searchTerm ? 
                      "Prueba con otro término de búsqueda" :
                      "Comienza registrando tu primera joya para generar certificados NFT"
                    }
                  </CardDescription>
                  {!searchTerm && (
                    <Button asChild className="bg-gradient-gold hover:shadow-gold transition-premium">
                      <Link to="/nueva-joya">
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Primera Joya
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredJewelry.map((item) => (
              <Card key={item.id} className="hover:shadow-premium transition-premium">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center">
                        <Gem className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold font-heading">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {item.id} • {item.type} • {item.date}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {item.materials.map((material, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-lg mb-2">{item.value}</div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                  
                   {/* Mostrar componente de certificación si está pendiente */}
                   {item.status === 'pendiente' && (
                     <div className="mt-4 pt-4 border-t">
                      <CertificateGenerationButton 
                        jewelryItemId={item.jewelryItemId}
                        jewelryName={item.name}
                        jewelryType={item.type}
                        currentStatus={item.status}
                        onStatusUpdate={loadDashboardData}
                      />
                     </div>
                   )}
                   
                   {/* Mostrar botón de descarga del PDF si está certificado */}
                   {item.status === 'certificado' && item.certificate?.certificate_pdf_url && (
                     <div className="mt-4 pt-4 border-t">
                       <Button
                         variant="outline"
                         size="sm"
                         className="w-full"
                         onClick={() => {
                            const pdfUrl = item.certificate.certificate_pdf_url;
                            if (pdfUrl?.startsWith('ipfs://')) {
                              const ipfsHash = pdfUrl.replace('ipfs://', '');
                              // Usar ipfs.io gateway (permite HTML)
                              window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank');
                           } else if (pdfUrl) {
                             window.open(pdfUrl, '_blank');
                           }
                         }}
                       >
                         <Download className="w-4 h-4 mr-2" />
                         Descargar Certificado PDF
                       </Button>
                     </div>
                   )}
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          {stats.pendingCertifications === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="mb-2">¡Todo al día!</CardTitle>
                <CardDescription className="mb-4">
                  No tienes certificaciones pendientes
                </CardDescription>
                <Button asChild className="bg-gradient-gold hover:shadow-gold transition-premium">
                  <Link to="/nueva-joya">
                    Registrar Nueva Joya
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle className="mb-2">{stats.pendingCertifications} Certificaciones Pendientes</CardTitle>
                <CardDescription className="mb-4">
                  Tienes joyas que requieren completar su proceso de certificación
                </CardDescription>
                <Button asChild className="bg-gradient-gold hover:shadow-gold transition-premium">
                  <Link to="/certificados">
                    Ver Pendientes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="marketplace">
          <MyListings showHeader={false} />
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
};