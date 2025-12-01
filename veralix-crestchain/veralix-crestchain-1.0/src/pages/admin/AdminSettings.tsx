import { AppLayout } from "@/components/layout/AppLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingManagement } from "@/components/admin/PricingManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { AirdropManagement } from "@/components/admin/AirdropManagement";
import { SystemStats } from "@/components/admin/SystemStats";
import { PackageManagement } from "@/components/admin/PackageManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, DollarSign, Tag, Gift, BarChart, Package, Users } from "lucide-react";
import { MaintenanceModeToggle } from "@/components/admin/MaintenanceModeToggle";
import { WaitlistManagement } from "@/components/admin/WaitlistManagement";
import { BlockchainNetworkSwitch } from "@/components/admin/BlockchainNetworkSwitch";

const AdminSettings = () => {
  return (
    <AppLayout>
      <RoleGuard 
        requiredRole="admin" 
        showWarning 
        fallback={
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
            <p className="text-muted-foreground">
              Solo los administradores pueden acceder a esta página.
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configuración del Sistema</h1>
            <p className="text-muted-foreground">
              Gestiona la configuración global de Veralix
            </p>
          </div>

          <Tabs defaultValue="stats" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Paquetes</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Precios</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Categorías</span>
              </TabsTrigger>
              <TabsTrigger value="airdrops" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Airdrops</span>
              </TabsTrigger>
              <TabsTrigger value="waitlist" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Waitlist</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-6">
              <SystemStats />
            </TabsContent>

            <TabsContent value="packages" className="space-y-6">
              <PackageManagement />
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Precios</CardTitle>
                  <CardDescription>
                    Configura los precios de certificación por tipo de joya y categoría de cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Categorías</CardTitle>
                  <CardDescription>
                    Administra las categorías de clientes y sus beneficios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="airdrops" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Airdrops</CardTitle>
                  <CardDescription>
                    Crea y administra campañas de distribución de tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AirdropManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="waitlist" className="space-y-6">
              <WaitlistManagement />
            </TabsContent>

            <TabsContent value="general" className="space-y-6">
              <BlockchainNetworkSwitch />
              
              <MaintenanceModeToggle />
              
              <Card>
                <CardHeader>
                  <CardTitle>Configuración General</CardTitle>
                  <CardDescription>
                    Ajustes generales del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">📧 Configuración de emails (Resend API Key configurado)</p>
                    <p className="mb-2">💳 Configuración de pagos (Bold Payments integrado)</p>
                    <p>📊 Configuración de analytics (Sistema de auditoría activo)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RoleGuard>
    </AppLayout>
  );
};

export default AdminSettings;
