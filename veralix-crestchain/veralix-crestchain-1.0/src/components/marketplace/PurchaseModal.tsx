import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrders, CreateOrderData, Address } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { MarketplaceListing } from "@/hooks/useMarketplaceListings";
import { toast } from "sonner";
import { ShoppingCart, MapPin, CreditCard } from "lucide-react";

interface PurchaseModalProps {
  listing: MarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PurchaseModal = ({ listing, open, onOpenChange }: PurchaseModalProps) => {
  const { user } = useAuth();
  const { createOrder, formatPrice, initiatePayment } = useOrders();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'confirm'>('address');

  // Shipping address
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Colombia");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setStreet("");
    setCity("");
    setState("");
    setZipCode("");
    setCountry("Colombia");
    setPhone("");
    setNotes("");
    setStep('address');
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para comprar");
      return;
    }

    if (!listing) return;

    // Validation
    if (!street || !city || !state || !zipCode || !phone) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      const shippingAddress: Address = {
        street,
        city,
        state,
        zipCode,
        country,
        phone
      };

      const orderData: CreateOrderData = {
        marketplace_listing_id: listing.id,
        seller_id: listing.seller_id,
        total_amount: listing.price,
        currency: listing.currency,
        shipping_address: shippingAddress,
        billing_address: shippingAddress, // Same as shipping for now
        notes
      };

      const result = await createOrder(orderData);

      if (result.success && result.data) {
        console.log('✅ Order created:', result.data.id);
        toast.success("¡Orden creada! Redirigiendo al pago...");
        
        // Initiate payment with Wompi
        console.log('🚀 Initiating Wompi payment...');
        const paymentResult = await initiatePayment(result.data.id, 'wompi');
        
        if (paymentResult.success && paymentResult.paymentUrl) {
          console.log('✅ Payment URL received:', paymentResult.paymentUrl);
          // Redirect to Wompi
          window.location.href = paymentResult.paymentUrl;
        } else {
          console.error('❌ Payment initiation failed:', paymentResult);
          toast.error("Error al iniciar el pago. Por favor intenta nuevamente.");
        }
        
        resetForm();
        onOpenChange(false);
      } else {
        toast.error("Error al crear la orden");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Error al procesar la compra");
    } finally {
      setLoading(false);
    }
  };

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
          <DialogDescription>
            Completa los datos para realizar tu compra de forma segura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Product Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{listing.jewelry_item?.name}</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {listing.jewelry_item?.type}
                </p>
                {listing.jewelry_item?.materials && listing.jewelry_item.materials.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {listing.jewelry_item.materials.join(", ")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatPrice(listing.price, listing.currency)}
                </p>
              </div>
            </div>
            
            {listing.seller && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">Vendedor</p>
                <p className="font-medium">
                  {listing.seller.business_name || listing.seller.full_name}
                </p>
              </div>
            )}
          </div>

          {step === 'address' ? (
            <>
              {/* Shipping Address Form */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Dirección de Envío</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="street">Dirección *</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Calle, número, apartamento"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ciudad"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Departamento *</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Departamento"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Código Postal *</Label>
                      <Input
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="Código postal"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">País *</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="País"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono de Contacto *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 123 4567"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas (Opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instrucciones especiales para la entrega..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setStep('confirm')}
                  disabled={loading || !street || !city || !state || !zipCode || !phone}
                >
                  Continuar al Pago
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Confirmar y Pagar</h3>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Enviar a:</p>
                    <p className="font-medium">{street}</p>
                    <p>{city}, {state} {zipCode}</p>
                    <p>{country}</p>
                    <p className="mt-1">Tel: {phone}</p>
                  </div>

                  {notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">Notas:</p>
                      <p className="text-sm">{notes}</p>
                    </div>
                  )}
                </div>

                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Envío:</span>
                    <span className="font-semibold">Por calcular</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(listing.price, listing.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Nota:</strong> Al confirmar la orden, serás redirigido a la página de pago. 
                    El vendedor recibirá tu pedido una vez se confirme el pago.
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep('address')}
                  disabled={loading}
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="min-w-[200px]"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {loading ? "Procesando..." : "Confirmar Orden"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};