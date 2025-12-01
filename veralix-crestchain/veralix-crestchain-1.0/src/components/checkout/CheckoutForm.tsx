import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreateOrderData, Address } from "@/hooks/useOrders";
import { MarketplaceListing } from "@/hooks/useMarketplaceListings";
import { useMarketplaceWompiPayment } from "@/hooks/useMarketplaceWompiPayment";
import { useWompiWidget } from "@/hooks/useWompiWidget";
import { useWompiDirectPayment } from "@/hooks/useWompiDirectPayment";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  MapPin,
  User,
  Package,
  Landmark,
  Loader2
} from "lucide-react";

const WOMPI_PUBLIC_KEY = "pub_prod_XHaKFhY9SF4YB3GSxBhm7olkCxr7aiOQ";

const addressSchema = z.object({
  street: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().min(2, "El departamento es requerido"),
  zipCode: z.string().min(4, "El código postal debe tener al menos 4 caracteres"),
  country: z.string().default("Colombia"),
  phone: z.string().optional()
});

const checkoutSchema = z.object({
  shipping_address: addressSchema,
  billing_address: addressSchema,
  payment_method: z.enum(['PSE', 'CARD'], {
    required_error: "Debes seleccionar un método de pago"
  }),
  wompi_payment_method: z.enum(['direct', 'widget']).default('widget'),
  notes: z.string().optional(),
  use_same_address: z.boolean().default(true),
  terms_accepted: z.boolean().refine(val => val === true, "Debes aceptar los términos y condiciones")
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  listing: MarketplaceListing;
  onOrderCreated: (orderId: string) => void;
  onCancel: () => void;
}

export const CheckoutForm = ({ listing, onOrderCreated, onCancel }: CheckoutFormProps) => {
  const { createOrderAndPayment, loading: paymentLoading } = useMarketplaceWompiPayment();
  const { openCheckout } = useWompiWidget();
  const { createPaymentLink, redirectToPayment } = useWompiDirectPayment();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wompiPaymentMethod, setWompiPaymentMethod] = useState<'direct' | 'widget'>('widget');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      use_same_address: true,
      terms_accepted: false,
      payment_method: 'PSE',
      wompi_payment_method: 'widget',
      shipping_address: {
        country: "Colombia"
      },
      billing_address: {
        country: "Colombia"
      }
    }
  });

  const useSameAddress = watch("use_same_address");
  const shippingAddress = watch("shipping_address");
  const paymentMethod = watch("payment_method");

  // Sincronizar automáticamente shipping_address con billing_address
  useEffect(() => {
    if (useSameAddress && shippingAddress) {
      // Verificar que al menos street esté lleno antes de copiar
      if (shippingAddress.street && shippingAddress.street.length > 0) {
        console.log('🔄 Copiando shipping_address a billing_address:', shippingAddress);
        setValue("billing_address", shippingAddress, { 
          shouldValidate: true // Activa la validación inmediatamente
        });
      }
    }
  }, [useSameAddress, shippingAddress, setValue]);

  // Update billing address when using same address
  const handleSameAddressChange = (checked: boolean) => {
    setValue("use_same_address", checked);
    // El useEffect se encarga de copiar la dirección automáticamente
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handler para errores de validación
  const onError = (errors: any) => {
    console.error('❌ Errores de validación:', errors);
    
    // Encontrar el primer campo con error
    const firstErrorKey = Object.keys(errors)[0];
    
    // Mostrar toast con el error
    toast.error("Por favor completa todos los campos requeridos", {
      description: "Revisa los campos marcados en rojo"
    });
    
    // Scroll al primer campo con error
    const errorElement = document.querySelector(`[name="${firstErrorKey}"]`);
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    console.log('✅ onSubmit ejecutado - Formulario válido');
    console.log('📋 Datos del formulario:', data);
    console.log('💳 Método de pago Wompi:', wompiPaymentMethod);
    
    if (!user) {
      toast.error("Debes iniciar sesión para realizar una compra");
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Submitting checkout form with data:', data);

      // 1. Crear la orden en la base de datos
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          seller_id: listing.seller_id,
          marketplace_listing_id: listing.id,
          order_number: orderNumber,
          total_amount: listing.price,
          currency: listing.currency,
          shipping_address: data.shipping_address as any,
          billing_address: data.billing_address as any,
          notes: data.notes,
          payment_method: data.payment_method,
          payment_status: 'pending',
          order_status: 'pending',
        }])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw new Error('No se pudo crear la orden');
      }

      console.log('✅ Order created:', newOrder.id);

      // 2. Crear pending_payment
      const amountInCents = Math.round(listing.price * 100);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: pendingError } = await supabase
        .from('pending_payments')
        .insert({
          user_id: user.id,
          order_id: orderNumber,
          amount: amountInCents,
          currency: listing.currency,
          payment_type: 'marketplace_order',
          expires_at: expiresAt.toISOString(),
          metadata: {
            listing_id: listing.id,
            order_db_id: newOrder.id,
            listing_name: listing.jewelry_item.name,
            payment_method: wompiPaymentMethod
          }
        });

      if (pendingError) {
        console.error('❌ Error creating pending payment:', pendingError);
        throw new Error('No se pudo registrar el pago pendiente');
      }

      console.log('✅ Pending payment created');

      // 3. Obtener datos del perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('user_id', user.id)
        .single();

      const customerFullName = profile?.full_name || user.email?.split('@')[0] || 'Cliente';
      const customerEmail = profile?.email || user.email || '';
      const customerPhone = profile?.phone || '';

      // 4. Procesar según método seleccionado
      if (wompiPaymentMethod === 'widget') {
        console.log('🎨 Opening Wompi widget...');
        await openCheckout({
          currency: listing.currency,
          amountInCents: amountInCents,
          reference: orderNumber,
          publicKey: WOMPI_PUBLIC_KEY,
          redirectUrl: `${window.location.origin}/payment-return?orderId=${orderNumber}`,
          customerEmail,
          customerFullName,
          customerPhoneNumber: customerPhone
        });
      } else {
        console.log('🔗 Creating direct payment link...');
        const paymentUrl = await createPaymentLink({
          orderId: orderNumber,
          amount: amountInCents,
          currency: listing.currency,
          customerEmail,
          customerFullName,
          redirectUrl: `${window.location.origin}/payment-return?orderId=${orderNumber}`
        });

        if (paymentUrl) {
          redirectToPayment(paymentUrl);
        } else {
          throw new Error('No se pudo generar el link de pago');
        }
      }

      console.log('✅ Payment process initiated successfully');
    } catch (error: any) {
      console.error('❌ Error in checkout process:', error);
      toast.error(error.message || "Error al procesar la compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Product Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Resumen de Compra</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted/20 rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{listing.jewelry_item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {listing.seller?.business_name || listing.seller?.full_name || 'Vendedor'}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {listing.jewelry_item.materials?.slice(0, 3).map((material, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatPrice(listing.price, listing.currency)}
              </div>
              {listing.certificate && (
                <Badge variant="outline" className="text-xs">
                  Certificado NFT
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Dirección de Entrega</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Información para el envío
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="shipping_street" className="text-sm">Dirección *</Label>
                <Controller
                  name="shipping_address.street"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Calle 123 # 45-67"
                      className={errors.shipping_address?.street ? "border-destructive" : ""}
                    />
                  )}
                />
                {errors.shipping_address?.street && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.shipping_address.street.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="shipping_city" className="text-sm">Ciudad *</Label>
                  <Controller
                    name="shipping_address.city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Bogotá"
                        className={errors.shipping_address?.city ? "border-destructive" : ""}
                      />
                    )}
                  />
                  {errors.shipping_address?.city && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.shipping_address.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shipping_state" className="text-sm">Departamento *</Label>
                  <Controller
                    name="shipping_address.state"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Cundinamarca"
                        className={errors.shipping_address?.state ? "border-destructive" : ""}
                      />
                    )}
                  />
                  {errors.shipping_address?.state && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.shipping_address.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="shipping_zipCode" className="text-sm">Código Postal *</Label>
                  <Controller
                    name="shipping_address.zipCode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="110111"
                        className={errors.shipping_address?.zipCode ? "border-destructive" : ""}
                      />
                    )}
                  />
                  {errors.shipping_address?.zipCode && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.shipping_address.zipCode.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shipping_phone" className="text-sm">Teléfono</Label>
                  <Controller
                    name="shipping_address.phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="+57 300 123 4567"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Dirección de Facturación</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Información para la factura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="use_same_address"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={handleSameAddressChange}
                    />
                  )}
                />
                <Label className="text-sm">
                  Usar la misma dirección de entrega
                </Label>
              </div>

              {!useSameAddress && (
                <>
                  <div>
                    <Label htmlFor="billing_street">Dirección *</Label>
                    <Controller
                      name="billing_address.street"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Calle 123 # 45-67"
                          className={errors.billing_address?.street ? "border-destructive" : ""}
                        />
                      )}
                    />
                    {errors.billing_address?.street && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.billing_address.street.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing_city">Ciudad *</Label>
                      <Controller
                        name="billing_address.city"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Bogotá"
                            className={errors.billing_address?.city ? "border-destructive" : ""}
                          />
                        )}
                      />
                      {errors.billing_address?.city && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.billing_address.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="billing_state">Departamento *</Label>
                      <Controller
                        name="billing_address.state"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Cundinamarca"
                            className={errors.billing_address?.state ? "border-destructive" : ""}
                          />
                        )}
                      />
                      {errors.billing_address?.state && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.billing_address.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billing_zipCode">Código Postal *</Label>
                    <Controller
                      name="billing_address.zipCode"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="110111"
                          className={errors.billing_address?.zipCode ? "border-destructive" : ""}
                        />
                      )}
                    />
                    {errors.billing_address?.zipCode && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.billing_address.zipCode.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Información Adicional</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Notas especiales (opcional)</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Instrucciones especiales para el vendedor..."
                    className="min-h-[80px]"
                  />
                )}
              />
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Método de Pago *
              </Label>
              <Controller
                name="payment_method"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="pse"
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary ${
                        field.value === 'PSE' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="PSE" id="pse" />
                      <div className="flex items-center gap-3 flex-1">
                        <Landmark className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold">PSE</p>
                          <p className="text-xs text-muted-foreground">
                            Pago seguro desde tu banco
                          </p>
                        </div>
                      </div>
                    </Label>

                    <Label
                      htmlFor="card"
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary ${
                        field.value === 'CARD' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="CARD" id="card" />
                      <div className="flex items-center gap-3 flex-1">
                        <CreditCard className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold">Tarjeta</p>
                          <p className="text-xs text-muted-foreground">
                            Débito o crédito
                          </p>
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>
                )}
              />
              {errors.payment_method && (
                <p className="text-sm text-destructive">
                  {errors.payment_method.message}
                </p>
              )}
            </div>

            {/* Wompi Payment Method Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Procesar pago con
              </Label>
              
              <RadioGroup 
                value={wompiPaymentMethod} 
                onValueChange={(v) => setWompiPaymentMethod(v as 'direct' | 'widget')}
                className="grid grid-cols-1 gap-4"
              >
                {/* Opción: Widget Modal */}
                <Label
                  htmlFor="widget"
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary ${
                    wompiPaymentMethod === 'widget' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="widget" id="widget" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">Widget de Pago (Recomendado)</p>
                      <Badge variant="default" className="text-xs">Más rápido</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Completa el pago sin salir de esta página usando el widget seguro de Wompi
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">Mismo sitio</Badge>
                      <Badge variant="outline" className="text-xs">PSE</Badge>
                      <Badge variant="outline" className="text-xs">Tarjetas</Badge>
                      <Badge variant="outline" className="text-xs">Nequi</Badge>
                    </div>
                  </div>
                </Label>

                {/* Opción: Direct API */}
                <Label
                  htmlFor="direct"
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary ${
                    wompiPaymentMethod === 'direct' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="direct" id="direct" className="mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Página de Pago Wompi</p>
                    <p className="text-sm text-muted-foreground">
                      Serás redirigido a la página segura de Wompi para completar el pago
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">PSE</Badge>
                      <Badge variant="outline" className="text-xs">Tarjetas</Badge>
                      <Badge variant="outline" className="text-xs">Nequi</Badge>
                      <Badge variant="outline" className="text-xs">Corresponsal</Badge>
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            <div className="flex items-start space-x-2">
              <Controller
                name="terms_accepted"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={errors.terms_accepted ? "border-destructive" : ""}
                  />
                )}
              />
              <div className="space-y-1">
                <Label className="text-sm">
                  Acepto los términos y condiciones *
                </Label>
                {errors.terms_accepted && (
                  <p className="text-sm text-destructive">
                    {errors.terms_accepted.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Al realizar esta compra, acepto las políticas de compra y las condiciones de envío.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary & Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total a Pagar:</span>
                <span className="text-2xl font-bold">
                  {formatPrice(listing.price, listing.currency)}
                </span>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="w-full sm:flex-1 order-2 sm:order-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || paymentLoading}
                  className="w-full sm:flex-1 bg-gradient-gold text-background hover:scale-105 transition-transform order-1 sm:order-2"
                >
                  {(loading || paymentLoading) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      {wompiPaymentMethod === 'widget' 
                        ? 'Abrir Widget de Pago' 
                        : 'Ir a Página de Pago'}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Compra segura con certificación blockchain</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};