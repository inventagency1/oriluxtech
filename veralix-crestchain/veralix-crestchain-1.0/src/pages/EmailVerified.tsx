import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { VeralixLogo } from "@/components/ui/veralix-logo";

const EmailVerified = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente después de 3 segundos
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <VeralixLogo size={64} />
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">¡Email Verificado!</CardTitle>
          <CardDescription>
            Tu cuenta ha sido verificada exitosamente. Serás redirigido al dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="w-full"
          >
            Ir al Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Redirigiendo automáticamente en 3 segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerified;
