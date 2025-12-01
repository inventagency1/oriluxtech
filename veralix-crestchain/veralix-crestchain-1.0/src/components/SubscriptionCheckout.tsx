/**
 * @deprecated Este archivo está deprecado y será eliminado en una versión futura.
 * Usar en su lugar: CertificateBundleCheckout
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowLeft, CreditCard, Shield, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useBoldPayments } from "@/hooks/useBoldPayments";
import { DevelopmentNotice } from "@/components/DevelopmentNotice";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  certificates_limit: number;
  popular?: boolean;
}

interface SubscriptionCheckoutProps {
  plan: SubscriptionPlan;
  onBack: () => void;
}

export function SubscriptionCheckout({ plan, onBack }: SubscriptionCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createPaymentIntent, redirectToPayment, loading: paymentLoading } = useBoldPayments();

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para suscribirte",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const amount = parseFloat(plan.price.replace('.', ''));
      const tax = Math.round(amount * 0.19);
      const totalAmount = amount + tax;

      // Create payment intent with Bold.co
      const paymentResult = await createPaymentIntent({
        amount: totalAmount,
        currency: 'COP',
        description: `Suscripción ${plan.name} - Veralix`,
        planId: plan.id,
        subscriptionData: {
          certificates_limit: plan.certificates_limit,
          price_per_month: amount,
          plan_name: plan.name,
          billing_period: plan.period
        }
      });

      if (paymentResult.success && paymentResult.paymentUrl) {
        // Store payment info temporarily (opcional, para tracking)
        localStorage.setItem('veralix_pending_payment', JSON.stringify({
          orderId: paymentResult.orderId,
          planId: plan.id,
          planName: plan.name,
          amount: totalAmount
        }));

        // Redirect to Bold.co payment page
        redirectToPayment(paymentResult.paymentUrl);
      } else {
        // Handle specific error messages
        let errorMessage = paymentResult.error || 'Error creating payment';
        
        if (errorMessage.includes('Bold API key not configured')) {
          errorMessage = 'La integración de pagos aún no está configurada. Por favor contacta al administrador.';
        } else if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
          errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        }
        
        throw new Error(errorMessage);
      }

    } catch (error: any) {
      console.error('Subscription error:', error);
      
      let errorMessage = error.message || "No se pudo procesar el pago. Inténtalo de nuevo.";
      
      // Handle session expiration
      if (error.message?.includes('expired') || error.message?.includes('unauthorized')) {
        errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
        // Optionally redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
      toast({
        title: "Error en el pago",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = parseFloat(plan.price.replace('.', ''));
  const tax = Math.round(subtotal * 0.19); // 19% IVA
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-accent transition-fast"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a planes
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Plan Summary */}
          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-heading">Resumen del Plan</CardTitle>
                {plan.popular && (
                  <Badge className="bg-gradient-gold text-primary-foreground">
                    Más Popular
                  </Badge>
                )}
              </div>
              <CardDescription>Confirma los detalles de tu suscripción</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-accent/30 rounded-lg">
                <h3 className="text-xl font-semibold font-heading mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-end justify-center">
                  <span className="text-sm text-muted-foreground">COP $</span>
                  <span className="text-3xl font-bold font-heading mx-1">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Características incluidas:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-heading flex items-center">
                <CreditCard className="w-6 h-6 mr-2" />
                Finalizar Suscripción
              </CardTitle>
              <CardDescription>Complete los detalles de su suscripción</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Development Notice */}
              <DevelopmentNotice 
                title="Pagos en Configuración"
                description="La integración con Bold.co está siendo configurada. Una vez completada, podrás procesar pagos reales."
              />

              {/* Pricing Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Plan {plan.name} (mensual)</span>
                  <span>COP ${plan.price}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA (19%)</span>
                  <span>COP ${tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>COP ${total.toLocaleString()}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-accent/30 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Pago seguro con Bold.co</p>
                    <p className="text-muted-foreground">
                      Serás redirigido a Bold.co para completar tu pago de forma segura. Aceptamos tarjetas de crédito, débito y transferencias bancarias.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Terms */}
              <div className="text-xs text-muted-foreground space-y-2">
                <p>• Tu suscripción se renovará automáticamente cada mes</p>
                <p>• Puedes cancelar en cualquier momento desde tu dashboard</p>
                <p>• Los certificados no utilizados no se acumulan al siguiente período</p>
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={loading || paymentLoading}
                className="w-full h-12 bg-gradient-gold hover:shadow-gold transition-premium"
              >
                {loading || paymentLoading ? (
                  "Creando orden de pago..."
                ) : (
                  <>
                    Proceder al Pago
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}