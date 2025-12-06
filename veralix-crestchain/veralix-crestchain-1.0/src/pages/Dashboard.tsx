import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings,
  UserCheck,
  Crown,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useOnboarding } from "@/hooks/useOnboarding";
import { JoyeroDashboard } from "@/components/JoyeroDashboard";
import { ClienteDashboard } from "@/components/ClienteDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { TokenBalance } from "@/components/TokenBalance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    role, 
    effectiveRole,
    loading: roleLoading, 
    updateRole, 
    isJoyero, 
    isCliente, 
    isAdmin,
    isRealAdmin,
    isSimulating,
    simulateRole,
    clearSimulatedRole
  } = useUserRole();
  const { toast } = useToast();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const { showOnboarding, completeOnboarding, resetOnboarding } = useOnboarding();

  // La redirección post-registro ahora se maneja en useUserRole

  const handleRoleChange = async (newRole: 'joyero' | 'cliente' | 'admin') => {
    try {
      const { error } = await updateRole(newRole);
      if (error) {
        console.error('Role change error:', error);
        toast({
          title: "Error al cambiar rol",
          description: error.message || "No se pudo cambiar el rol. Verifica tu conexión e intenta nuevamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Rol actualizado exitosamente",
          description: `Ahora tienes el rol de ${newRole}`,
        });
        setIsRoleDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error inesperado. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    }
  };


  // Show loading while role is being fetched
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show role selection if user has no role
  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <VeralixLogo size={56} className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold font-heading bg-gradient-gold bg-clip-text text-transparent mb-2">
              ¡Bienvenido a Veralix!
            </h1>
            <p className="text-muted-foreground">
              Cuéntanos un poco sobre ti para personalizar tu experiencia
            </p>
          </div>

          <Card className="shadow-premium border-border/50">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-heading">¿Qué tipo de usuario eres?</CardTitle>
              <CardDescription>
                Selecciona la opción que mejor te describa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Joyero Option */}
              <button 
                onClick={() => handleRoleChange('joyero')}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary/50 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 hover:from-amber-500/10 hover:to-yellow-500/10 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                      Soy Joyero / Joyería
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Tengo un negocio de joyería y quiero certificar mis piezas con blockchain
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Crear certificados</Badge>
                      <Badge variant="secondary" className="text-xs">Vender en marketplace</Badge>
                      <Badge variant="secondary" className="text-xs">Gestionar inventario</Badge>
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Cliente Option */}
              <button 
                onClick={() => handleRoleChange('cliente')}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary/50 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                      Soy Cliente / Comprador
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Quiero comprar joyas certificadas y verificar su autenticidad
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Verificar certificados</Badge>
                      <Badge variant="secondary" className="text-xs">Explorar marketplace</Badge>
                      <Badge variant="secondary" className="text-xs">Mis colecciones</Badge>
                    </div>
                  </div>
                </div>
              </button>

              {/* Help text */}
              <div className="pt-4 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Podrás cambiar esto más adelante en configuración
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <OnboardingModal open={showOnboarding} onComplete={completeOnboarding} />
      <OnboardingChecklist />
      
      <DashboardLayout 
        title="Dashboard" 
        description={isAdmin ? 'Panel de Administración' : isJoyero ? 'Panel de Joyero' : isCliente ? 'Panel de Cliente' : 'Bienvenido'}
      >
        {/* Admin Role Simulation Dialog */}
        {isRealAdmin && (
          <div className="mb-6 flex justify-end">
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={isSimulating ? "ring-2 ring-amber-500" : ""}>
                  <Settings className="w-4 h-4 mr-2" />
                  {isSimulating ? `Simulando: ${effectiveRole}` : 'Simular Rol'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Simular Vista de Rol</DialogTitle>
                  <DialogDescription>
                    Prueba la experiencia de usuario de cada rol sin cambiar tu rol real de admin
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {isSimulating && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
                      ⚠️ Estás en modo simulación. Tu rol real sigue siendo Admin.
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => { clearSimulatedRole(); setIsRoleDialogOpen(false); }}
                    className="w-full h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    disabled={!isSimulating}
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-semibold">Vista Administrador</div>
                        <div className="text-sm opacity-90">Tu rol real - Control total</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => { simulateRole('joyero'); setIsRoleDialogOpen(false); }}
                    className="w-full h-16 bg-gradient-gold hover:shadow-gold transition-premium"
                    disabled={effectiveRole === 'joyero'}
                  >
                    <div className="flex items-center space-x-3">
                      <Crown className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-semibold">Simular Joyero</div>
                        <div className="text-sm opacity-90">Ver como joyero - Crear certificados</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => { simulateRole('cliente'); setIsRoleDialogOpen(false); }}
                    variant="outline"
                    className="w-full h-16"
                    disabled={effectiveRole === 'cliente'}
                  >
                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-semibold">Simular Cliente</div>
                        <div className="text-sm opacity-70">Ver como cliente - Solo lectura</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            {isAdmin ? <AdminDashboard /> : isJoyero ? <JoyeroDashboard /> : isCliente ? <ClienteDashboard /> : null}
          </div>
          
          {/* Token Balance Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-24">
              <TokenBalance />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
