/**
 * @deprecated Este hook está deprecado y será eliminado en v2.0
 * Sistema de suscripciones eliminado. Usar useCertificateBalance() en su lugar.
 * Este hook permanece solo para evitar errores en imports legacy.
 */
import { useToast } from '@/hooks/use-toast';

export function useSubscriptionManagement() {
  const { toast } = useToast();
  
  const cancelSubscription = async () => {
    toast({
      title: "Función no disponible",
      description: "El sistema de suscripciones ha sido reemplazado por paquetes prepagados de certificados.",
      variant: "destructive",
    });
    return { success: false };
  };

  const reactivateSubscription = async () => {
    toast({
      title: "Función no disponible", 
      description: "Por favor, compra un nuevo paquete de certificados en la página de precios.",
      variant: "destructive",
    });
    return { success: false };
  };

  return { 
    loading: false, 
    cancelSubscription, 
    reactivateSubscription 
  };
}
