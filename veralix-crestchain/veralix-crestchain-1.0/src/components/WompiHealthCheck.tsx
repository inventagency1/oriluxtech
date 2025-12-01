import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from "lucide-react";

export function WompiHealthCheck() {
  const [status, setStatus] = useState<'checking' | 'loaded' | 'error'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 15; // Aumentado de 5 a 15 para dar más tiempo

  const checkWidget = () => {
    console.log('🔍 [HEALTH] Checking Wompi Widget availability...');
    
    if (typeof window !== 'undefined' && window.WidgetCheckout) {
      console.log('✅ [HEALTH] Wompi Widget loaded successfully');
      setStatus('loaded');
      return true;
    }
    
    console.warn('⚠️ [HEALTH] Wompi Widget not available yet');
    return false;
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let checkCount = 0;

    const scheduleCheck = () => {
      if (checkCount >= maxRetries) {
        console.error('❌ [HEALTH] Max retries reached, Wompi Widget failed to load');
        setStatus('error');
        return;
      }

      timeoutId = setTimeout(() => {
        checkCount++;
        setRetryCount(checkCount);
        
        if (!checkWidget()) {
          scheduleCheck();
        }
      }, 1000);
    };

    // Initial check
    if (!checkWidget()) {
      scheduleCheck();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleRetry = () => {
    console.log('🔄 [HEALTH] Manual retry triggered');
    setStatus('checking');
    setRetryCount(0);
    window.location.reload();
  };

  if (status === 'loaded') {
    return (
      <Alert className="bg-success/10 border-success">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">Sistema de pago listo</AlertTitle>
        <AlertDescription>
          El widget de Wompi se cargó correctamente y está listo para procesar pagos.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar el sistema de pago</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            No se pudo cargar el widget de Wompi después de {maxRetries} intentos.
            Esto puede deberse a:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            <li>Problemas de conexión a internet</li>
            <li>Bloqueador de anuncios o extensiones del navegador</li>
            <li>Configuración de seguridad del navegador</li>
            <li>Script de Wompi temporalmente no disponible</li>
          </ul>
          <Button 
            onClick={handleRetry} 
            variant="destructive" 
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar página
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <Loader2 className="h-4 w-4 animate-spin" />
      <AlertTitle>Cargando sistema de pago</AlertTitle>
      <AlertDescription>
        Verificando disponibilidad del widget de Wompi... (Intento {retryCount}/{maxRetries})
      </AlertDescription>
    </Alert>
  );
}
