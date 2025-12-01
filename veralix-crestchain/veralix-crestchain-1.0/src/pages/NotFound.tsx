import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, Mail, ArrowLeft } from "lucide-react";
import { VeralixLogo } from "@/components/ui/veralix-logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <VeralixLogo size={64} />
          </div>
          
          <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Página No Encontrada</h2>
          <p className="text-muted-foreground mb-2">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Ruta intentada: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ir al Dashboard
              </Button>
            </Link>
          </div>

          <div className="border-t pt-8 mt-8">
            <h3 className="font-semibold mb-4">Páginas Populares</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Link to="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">
                Marketplace
              </Link>
              <Link to="/verify" className="text-muted-foreground hover:text-primary transition-colors">
                Verificar Joya
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                Precios
              </Link>
              <Link to="/perfil" className="text-muted-foreground hover:text-primary transition-colors">
                Perfil
              </Link>
              <Link to="/certificados" className="text-muted-foreground hover:text-primary transition-colors">
                Certificados
              </Link>
              <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                Ayuda
              </Link>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <a href="mailto:soporte@veralix.io" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              Contactar Soporte
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
