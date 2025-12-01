import { Alert, AlertDescription } from "@/components/ui/alert";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import { ShieldAlert, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AccessDeniedAlertProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export const AccessDeniedAlert = ({ 
  title = "Acceso Restringido",
  message = "No tienes los permisos necesarios para acceder a esta sección.",
  showBackButton = true
}: AccessDeniedAlertProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent shadow-lg">
          {/* Logo y título */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="mb-4 relative">
              <VeralixLogo size={64} />
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border-2 border-gold/30">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold font-heading text-foreground mb-2">
              {title}
            </h3>
          </div>
          
          <AlertDescription className="text-center space-y-4">
            <p className="text-muted-foreground">
              {message}
            </p>
            
            {/* Info adicional */}
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <Lock className="h-4 w-4 mx-auto mb-2 text-gold" />
              <p>
                Esta sección está protegida y requiere permisos especiales.
                Si crees que deberías tener acceso, contacta al administrador.
              </p>
            </div>
            
            {/* Botones de acción */}
            {showBackButton && (
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => window.history.back()}
                >
                  Volver
                </Button>
                <Button 
                  className="flex-1 bg-gold hover:bg-gold/90 text-background" 
                  asChild
                >
                  <Link to="/dashboard">
                    Ir al Dashboard
                  </Link>
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
