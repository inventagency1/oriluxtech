import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Shield, Info, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCertificatePricing } from '@/hooks/useCertificatePricing';
import { useCertificatePayments } from '@/hooks/useCertificatePayments';
import { useClientCategories, CLIENT_CATEGORY_LABELS, CLIENT_CATEGORY_DESCRIPTIONS } from '@/hooks/useClientCategories';
import { useAuth } from '@/hooks/useAuth';

interface CertificatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  jewelryItemId: string;
  jewelryName: string;
  jewelryType: string;
  onPaymentSuccess: () => void;
}

export const CertificatePaymentModal: React.FC<CertificatePaymentModalProps> = ({
  isOpen,
  onClose,
  jewelryItemId,
  jewelryName,
  jewelryType,
  onPaymentSuccess
}) => {
  const { user } = useAuth();
  const { getPriceQuote, loading: pricingLoading } = useCertificatePricing();
  const { initiatePayment, redirectToPayment, loading: paymentLoading } = useCertificatePayments();
  const { getUserCategory } = useClientCategories();
  
  const [priceQuote, setPriceQuote] = useState<any>(null);
  const [userCategory, setUserCategory] = useState<string>('regular');
  const [showingPayment, setShowingPayment] = useState(false);

  useEffect(() => {
    if (isOpen && user && jewelryType) {
      loadPricing();
    }
  }, [isOpen, user, jewelryType]);

  const loadPricing = async () => {
    if (!user) return;

    try {
      // Obtener categoría del usuario
      const category = await getUserCategory(user.id);
      setUserCategory(category);

      // Obtener cotización de precio
      const quote = await getPriceQuote(user.id, jewelryType);
      if (quote) {
        setPriceQuote(quote);
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
    }
  };

  const handlePayment = async () => {
    if (!priceQuote || !user) return;

    setShowingPayment(true);
    
    try {
      const paymentResult = await initiatePayment({
        jewelryItemId,
        jewelryName,
        jewelryType,
        amount: priceQuote.final_price,
        currency: priceQuote.currency,
        pricingId: priceQuote.pricing_id,
        clientCategory: priceQuote.client_category,
        discountApplied: priceQuote.discount_percentage
      });

      if (paymentResult.success && paymentResult.paymentUrl) {
        // Redirigir a Bold.co para completar el pago
        redirectToPayment(paymentResult.paymentUrl);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setShowingPayment(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (pricingLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Calculando precio...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showingPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center p-6">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Procesando pago...</h3>
            <p className="text-muted-foreground mb-4">
              Serás redirigido a Bold.co para completar tu pago de forma segura.
            </p>
            {paymentLoading && (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pagar Certificación NFT
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la joya */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detalles del certificado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joya:</span>
                <span className="font-medium">{jewelryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="capitalize">{jewelryType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría cliente:</span>
                <Badge variant="secondary">
                  {CLIENT_CATEGORY_LABELS[userCategory as keyof typeof CLIENT_CATEGORY_LABELS]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Desglose de precios */}
          {priceQuote && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Desglose de precios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Precio base:</span>
                  <span>{formatPrice(priceQuote.price)}</span>
                </div>
                
                {priceQuote.discount_percentage > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({priceQuote.discount_percentage}%):</span>
                      <span>-{formatPrice(priceQuote.price - priceQuote.final_price)}</span>
                    </div>
                    <Separator />
                  </>
                )}
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total a pagar:</span>
                  <span>{formatPrice(priceQuote.final_price)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información adicional */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Al pagar, se generará automáticamente tu certificado NFT con toda la información 
              de autenticidad en blockchain. El certificado incluirá PDF descargable y QR de verificación.
            </AlertDescription>
          </Alert>

          {/* Beneficios del certificado */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">¿Qué incluye tu certificado?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Registro permanente en blockchain Crestchain
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Certificado PDF profesional descargable
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  QR de verificación pública
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Metadatos NFT almacenados en IPFS
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={!priceQuote || paymentLoading}
              className="flex-1"
            >
              {paymentLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Pagar {priceQuote ? formatPrice(priceQuote.final_price) : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};