import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VeralixLogo } from "@/components/ui/veralix-logo";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Link to="/" className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-fast">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </Link>
            <ThemeToggle />
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <VeralixLogo size={40} className="sm:w-12 sm:h-12" />
            <span className="text-3xl sm:text-4xl font-bold font-heading bg-gradient-gold bg-clip-text text-transparent">
              Veralix
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Certificación blockchain para joyas auténticas
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-premium border-border/50">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-heading">Iniciar Sesión</CardTitle>
            <CardDescription className="text-sm">
              Accede a tu cuenta con Google
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button 
              type="button"
              className="w-full h-14 text-base font-medium bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
                  <span>Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continuar con Google</span>
                </div>
              )}
            </Button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Autenticación segura con Google</span>
            </div>

            <Separator />

            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link 
                to="/register" 
                className="text-primary hover:text-primary-dark transition-fast font-medium"
              >
                Registrarse
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          Al iniciar sesión, aceptas nuestros{" "}
          <Link to="/terms" className="text-primary hover:text-primary-dark transition-fast">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link to="/privacy" className="text-primary hover:text-primary-dark transition-fast">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;