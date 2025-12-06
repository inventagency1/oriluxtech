import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowLeft, Shield, Sparkles, RefreshCw, Zap, Link2, CreditCard, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWompiWidget } from "@/hooks/useWompiWidget";
import { useWompiDirectPayment } from "@/hooks/useWompiDirectPayment";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QRBancolombiaPayment } from "@/components/QRBancolombiaPayment";

interface CertificatePackage {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  certificates: number;
  savings?: number;
  pricePerCert: number;
  popular?: boolean;
}

interface CertificateBundleCheckoutProps {
  pkg: CertificatePackage;
  onBack: () => void;
}

export function CertificateBundleCheckout({ pkg, onBack }: CertificateBundleCheckoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openCheckout } = useWompiWidget();
  const { createPaymentLink, redirectToPayment, loading: directPaymentLoading } = useWompiDirectPayment();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'direct' | 'widget'>('qr');
  const [showQRPayment, setShowQRPayment] = useState(false);
  
  // Wompi public key - PRODUCCIÓN
  const WOMPI_PUBLIC_KEY = "pub_prod_XHaKFhY9SF4YB3GSxBhm7olkCxr7aiOQ";

  const handleDirectPayment = async () => {
    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para comprar certificados",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(pkg.price.replace(/\./g, ''));
      const tax = Math.round(amount * 0.19);
      const totalAmount = amount + tax;

      // Generate unique order ID
      const orderId = `VRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Store pending payment
      const { error: pendingError } = await supabase
        .from('pending_payments')
        .insert({
          order_id: orderId,
          user_id: user.id,
          amount: totalAmount,
          currency: 'COP',
          payment_type: 'certificate_package',
          metadata: {
            package_id: pkg.id,
            package_name: pkg.name,
            certificates_count: pkg.certificates,
            base_amount: amount,
            tax_amount: tax,
            price_per_certificate: pkg.pricePerCert,
            payment_method: 'direct_api'
          }
        });

      if (pendingError) {
        console.error('Error storing pending payment:', pendingError);
        throw new Error('Error al preparar el pago');
      }

      // Create payment link
      const paymentUrl = await createPaymentLink({
        orderId,
        amount: totalAmount * 100, // in cents
        currency: 'COP',
        customerEmail: user.email || '',
        customerFullName: user.user_metadata?.full_name || '',
        redirectUrl: `${window.location.origin}/payment-return?orderId=${orderId}`
      });

      if (paymentUrl) {
        redirectToPayment(paymentUrl);
      }

    } catch (error: any) {
      console.error('Error in handleDirectPayment:', error);
      toast({
        title: "Error en el pago",
        description: error.message || "No se pudo iniciar el proceso de pago",
        variant: "destructive",
      });
    }
  };

  const handleWidgetPayment = async () => {
    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para comprar certificados",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const amount = parseFloat(pkg.price.replace(/\./g, ''));
      const tax = Math.round(amount * 0.19);
      const totalAmount = amount + tax;

      // Generate unique order ID
      const orderId = `VRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Store pending payment
      const { error: pendingError } = await supabase
        .from('pending_payments')
        .insert({
          order_id: orderId,
          user_id: user.id,
          amount: totalAmount,
          currency: 'COP',
          payment_type: 'certificate_package',
          metadata: {
            package_id: pkg.id,
            package_name: pkg.name,
            certificates_count: pkg.certificates,
            base_amount: amount,
            tax_amount: tax,
            price_per_certificate: pkg.pricePerCert,
            payment_method: 'widget'
          }
        });

      if (pendingError) {
        console.error('Error storing pending payment:', pendingError);
        throw new Error('Error al preparar el pago');
      }

      // Open Wompi widget
      await openCheckout({
        currency: 'COP',
        amountInCents: totalAmount * 100,
        reference: orderId,
        publicKey: WOMPI_PUBLIC_KEY,
        redirectUrl: `${window.location.origin}/payment-return?orderId=${orderId}`,
        customerEmail: user.email || '',
        customerFullName: user.user_metadata?.full_name || ''
      });

    } catch (error: any) {
      console.error('Error in handleWidgetPayment:', error);
      toast({
        title: "Error en el pago",
        description: error.message || "No se pudo iniciar el proceso de pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate values
  const amount = parseFloat(pkg.price.replace(/\./g, ''));
  const tax = Math.round(amount * 0.19);
  const totalAmount = amount + tax;

  const handlePurchase = () => {
    if (paymentMethod === 'qr') {
      setShowQRPayment(true);
    } else if (paymentMethod === 'direct') {
      handleDirectPayment();
    } else {
      handleWidgetPayment();
    }
  };

  // Si está mostrando el pago QR, renderizar ese componente
  if (showQRPayment) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <QRBancolombiaPayment
          monto={totalAmount}
          paqueteId={pkg.id}
          paqueteNombre={pkg.name}
          certificados={pkg.certificates}
          onSuccess={() => navigate('/dashboard')}
          onCancel={() => setShowQRPayment(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="space-y-6">
        {/* Navigation & Bold mode badge */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a paquetes
          </Button>
          
          <Badge variant="outline" className="gap-1.5">
            <Zap className="w-3 h-3" />
            Wompi Modo Prueba
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Package Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {pkg.description}
                    </CardDescription>
                  </div>
                  {pkg.popular && (
                    <Badge variant="premium" className="gap-1">
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Breakdown */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Precio base</span>
                    <span className="font-medium">${amount.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Precio por certificado</span>
                    <span>${pkg.pricePerCert.toLocaleString('es-CO')} COP</span>
                  </div>
                  {pkg.savings && pkg.savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-500">
                      <span>Ahorro total</span>
                      <span className="font-medium">-${pkg.savings.toLocaleString('es-CO')} COP</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Lo que incluye:</p>
                  <div className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Payment Form */}
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Método de Pago</CardTitle>
                <CardDescription className="text-sm">
                  Selecciona cómo deseas pagar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value as 'qr' | 'direct' | 'widget')}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 rounded-lg border-2 border-primary p-4 cursor-pointer bg-primary/5 transition-colors">
                    <RadioGroupItem value="qr" id="qr" className="mt-1" />
                    <Label htmlFor="qr" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Building2 className="h-4 w-4 text-primary" />
                        QR Bancolombia / Nequi
                        <Badge variant="default" className="text-xs bg-green-600">Recomendado</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Paga escaneando el código QR desde tu app de Bancolombia o Nequi
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors opacity-50">
                    <RadioGroupItem value="direct" id="direct" className="mt-1" disabled />
                    <Label htmlFor="direct" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        Tarjeta de Crédito/Débito
                        <Badge variant="outline" className="text-xs">Próximamente</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pago con tarjeta mediante Stripe (disponible pronto)
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors opacity-50">
                    <RadioGroupItem value="widget" id="widget" className="mt-1" disabled />
                    <Label htmlFor="widget" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        PSE / Otros
                        <Badge variant="outline" className="text-xs">Próximamente</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Transferencia bancaria y otros métodos (disponible pronto)
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pago</CardTitle>
                <CardDescription>
                  Revisa los detalles antes de continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pricing Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm font-medium">${amount.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">IVA (19%)</span>
                    <span className="text-sm">${tax.toLocaleString('es-CO')} COP</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total a pagar</span>
                    <span className="text-2xl font-bold text-primary">
                      ${totalAmount.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Security Notice */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Pago 100% seguro</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {paymentMethod === 'qr' 
                      ? 'Tu pago será verificado manualmente en un plazo de 24 horas hábiles'
                      : 'Tu transacción está protegida con encriptación de nivel bancario'
                    }
                  </p>
                </div>

                {/* Terms Notice */}
                <p className="text-xs text-muted-foreground text-center">
                  Al continuar, aceptas nuestros{' '}
                  <button 
                    onClick={() => navigate('/terms')}
                    className="text-primary hover:underline"
                  >
                    términos y condiciones
                  </button>
                </p>

                {/* Payment Button */}
                <Button 
                  onClick={handlePurchase}
                  disabled={loading || directPaymentLoading}
                  size="lg"
                  className="w-full"
                >
                  {(loading || directPaymentLoading) ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'qr' ? (
                        <>
                          <Building2 className="w-4 h-4 mr-2" />
                          Pagar con QR Bancolombia
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          {paymentMethod === 'direct' ? 'Ir a Pagar' : `Pagar $${totalAmount.toLocaleString('es-CO')} COP`}
                        </>
                      )}
                    </>
                  )}
                </Button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Seguro</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Verificado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
