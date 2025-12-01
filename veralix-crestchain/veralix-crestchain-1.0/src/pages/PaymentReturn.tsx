import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWompiPayments } from '@/hooks/useWompiPayments';
import { useCertificateBalance } from '@/hooks/useCertificateBalance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'pending';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { verifyPayment, isVerifying } = useWompiPayments();
  const { refetch: refetchCertificateBalance } = useCertificateBalance();
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('verifying');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/payment-return');
      return;
    }

    // Wompi redirige con el parámetro 'order' que incluimos en el redirectUrl
    const orderId = searchParams.get('orderId') || searchParams.get('order');
    // Wompi también incluye 'id' (transaction ID) en la URL
    const transactionId = searchParams.get('id');

    console.log('💳 Payment return from Wompi:', { 
      orderId, 
      transactionId,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (orderId) {
      verifyPaymentStatus(orderId);
    } else {
      console.error('❌ No order ID in URL params');
      setPaymentStatus('failed');
      toast({
        title: "Error",
        description: "No se encontró el ID de la orden",
        variant: "destructive"
      });
    }
  }, [user, searchParams]);

  const verifyPaymentStatus = async (orderId: string) => {
    try {
      console.log('🔍 Verifying Wompi payment for order:', orderId);
      const result = await verifyPayment(orderId);

      console.log('📥 Wompi verification result:', result);

      if (result.success) {
        // Estados de Wompi: APPROVED, PENDING, DECLINED, VOIDED, ERROR
        const status = result.status;
        
        if (result.isPaid && status === 'APPROVED') {
          setPaymentStatus('success');
          setOrderDetails({
            orderId: result.reference || orderId,
            amount: result.amount,
            transactionId: result.transactionId
          });
          
          // Refrescar balance de certificados
          await refetchCertificateBalance();
          
          toast({
            title: "¡Pago exitoso!",
            description: "Tu paquete de certificados ha sido activado correctamente.",
          });
        } else if (status === 'PENDING') {
          setPaymentStatus('pending');
          setOrderDetails({
            orderId: result.reference || orderId,
            amount: result.amount,
            transactionId: result.transactionId
          });
          
          toast({
            title: "Pago pendiente",
            description: "Tu pago está siendo procesado. Te notificaremos cuando se complete.",
            variant: "default",
          });
        } else {
          // DECLINED, VOIDED, ERROR
          setPaymentStatus('failed');
          toast({
            title: "Pago no completado",
            description: `Estado: ${status}. Por favor intenta nuevamente.`,
            variant: "destructive",
          });
        }
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Error de verificación",
          description: result.error || "No pudimos verificar el pago.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Error verifying payment:', error);
      setPaymentStatus('failed');
      toast({
        title: "Error de verificación",
        description: "No pudimos verificar el estado del pago.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'verifying':
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-16 w-16 text-green-600" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-destructive" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-orange-600" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'verifying':
        return 'Verificando pago...';
      case 'success':
        return '¡Pago exitoso!';
      case 'failed':
        return 'Pago fallido';
      case 'pending':
        return 'Pago pendiente';
    }
  };

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'verifying':
        return 'Estamos confirmando tu pago con Bold.co. Esto puede tomar unos segundos.';
      case 'success':
        return 'Tu paquete de certificados ha sido activado correctamente. Ya puedes comenzar a generar certificados NFT.';
      case 'failed':
        return 'No pudimos procesar tu pago. Por favor, intenta nuevamente o contacta soporte.';
      case 'pending':
        return 'Tu pago está siendo procesado. Te notificaremos cuando se complete.';
    }
  };

  const getStatusVariant = () => {
    switch (paymentStatus) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl mb-2">{getStatusTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Badge variant={getStatusVariant()}>
              {paymentStatus === 'verifying' && 'Verificando'}
              {paymentStatus === 'success' && 'Completado'}
              {paymentStatus === 'failed' && 'Fallido'}
              {paymentStatus === 'pending' && 'En proceso'}
            </Badge>
          </div>

          {orderDetails && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <h3 className="font-semibold mb-3">Detalles de la orden</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Paquete:</span>
                <span className="font-medium">{orderDetails.planName || orderDetails.packageName}</span>
                <span className="text-muted-foreground">Monto:</span>
                <span className="font-medium">{orderDetails.amount} COP</span>
                {(orderDetails.certificatesLimit || orderDetails.certificates) && (
                  <>
                    <span className="text-muted-foreground">Certificados incluidos:</span>
                    <span className="font-medium">{orderDetails.certificatesLimit || orderDetails.certificates}</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {paymentStatus === 'success' && (
              <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full">
                Ir al Dashboard
              </Button>
            )}

            {paymentStatus === 'failed' && (
              <>
                <Button onClick={() => navigate('/pricing')} size="lg" className="w-full">
                  Intentar Nuevamente
                </Button>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                  Volver al Dashboard
                </Button>
              </>
            )}

            {paymentStatus === 'pending' && (
              <>
                <Button 
                  onClick={() => {
                    const orderId = searchParams.get('orderId') || searchParams.get('order_id');
                    if (orderId) verifyPaymentStatus(orderId);
                  }}
                  disabled={isVerifying}
                  size="lg" 
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar Estado'
                  )}
                </Button>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                  Volver al Dashboard
                </Button>
              </>
            )}

            {paymentStatus === 'verifying' && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>No cierres esta ventana</span>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@veralix.io" className="text-primary hover:underline">
              Contacta soporte
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReturn;
