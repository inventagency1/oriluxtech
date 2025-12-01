import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Send, CheckCircle, XCircle } from "lucide-react";

export default function EmailTesting() {
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [results, setResults] = useState<{ type: string; success: boolean; message: string }[]>([]);

  const testEmailType = async (type: string, data: any) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type,
          to: testEmail,
          data
        }
      });

      if (error) throw error;

      const result = { type, success: true, message: `✅ Email enviado correctamente` };
      setResults(prev => [...prev, result]);
      toast.success(`Email de ${type} enviado`);
    } catch (error: any) {
      const result = { type, success: false, message: `❌ Error: ${error.message}` };
      setResults(prev => [...prev, result]);
      toast.error(`Error al enviar ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const testWelcomeEmail = () => {
    testEmailType('welcome', {
      userName: "Usuario de Prueba",
      userEmail: testEmail,
      userRole: "joyero"
    });
  };

  const testOrderConfirmation = () => {
    testEmailType('order_confirmation', {
      orderNumber: "ORD-TEST-001",
      buyerName: "Comprador Test",
      sellerName: "Vendedor Test",
      itemName: "Anillo de Oro 18K",
      quantity: 1,
      totalAmount: 1500000,
      currency: "COP",
      orderDate: new Date().toLocaleDateString('es-CO'),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO'),
      orderUrl: `${window.location.origin}/order/test-123`
    });
  };

  const testOrderMessage = () => {
    testEmailType('order_message', {
      orderNumber: "ORD-TEST-001",
      senderName: "Juan Pérez",
      messagePreview: "Hola, quisiera saber cuándo enviarás el producto...",
      recipientName: "María García",
      orderUrl: `${window.location.origin}/order/test-123`
    });
  };

  const testOrderCancelled = () => {
    testEmailType('order_cancelled', {
      orderNumber: "ORD-TEST-001",
      recipientName: "Usuario Test",
      itemName: "Anillo de Oro 18K",
      totalAmount: 1500000,
      currency: "COP",
      cancellationReason: "El comprador solicitó la cancelación",
      refundAmount: 1500000,
      refundCurrency: "COP",
      refundMethod: "Devolución a método de pago original",
      estimatedRefundDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO'),
      recipientRole: "buyer"
    });
  };

  const testOrderStatusUpdate = () => {
    testEmailType('order_status_update', {
      orderNumber: "ORD-TEST-001",
      buyerName: "Comprador Test",
      itemName: "Anillo de Oro 18K",
      oldStatus: "pending",
      newStatus: "shipped",
      statusMessage: "Tu pedido ha sido enviado y está en camino",
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO'),
      trackingNumber: "TRACK123456789",
      orderUrl: `${window.location.origin}/order/test-123`
    });
  };

  const testPaymentConfirmation = () => {
    testEmailType('payment_confirmation', {
      orderNumber: "ORD-TEST-001",
      buyerName: "Comprador Test",
      sellerName: "Vendedor Test",
      itemName: "Anillo de Oro 18K",
      totalAmount: 1500000,
      currency: "COP",
      paymentMethod: "Tarjeta de Crédito",
      transactionId: "TXN-123456789",
      paymentDate: new Date().toLocaleDateString('es-CO'),
      orderUrl: `${window.location.origin}/order/test-123`
    });
  };

  const testCertificateGenerated = () => {
    testEmailType('certificate_generated', {
      certificateId: "VRX-001",
      recipientName: testEmail.split('@')[0] || "Usuario",
      jewelryName: "Anillo de Diamantes con Esmeraldas",
      jewelryType: "Anillo de Lujo",
      transactionHash: "0x742d35cc6634c0532925a3b844bc9e7fe6064674e8d3d4d1d08f8e1d0d6b1a2c",
      verificationUrl: `https://veralix.io/verify/VRX-001`,
      qrCodeUrl: "https://veralix.io/veralix-logo-email.png",
    });
  };

  const testCertificateTransferInitiated = () => {
    testEmailType('certificate_transfer_initiated', {
      certificateId: "VRX-002",
      jewelryName: "Collar de Perlas Naturales",
      senderName: testEmail.split('@')[0] || "Usuario",
      senderEmail: testEmail,
      recipientName: "María García López",
      recipientEmail: "maria.garcia@example.com",
      transferNotes: "Te transfiero este hermoso collar como regalo de aniversario. ¡Espero que te encante! 💎",
      transferDate: new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      certificateUrl: `https://veralix.io/certificates/VRX-002`
    });
  };

  const testCertificateTransferReceived = () => {
    testEmailType('certificate_transfer_received', {
      certificateId: "VRX-003",
      jewelryName: "Brazalete de Oro Blanco con Zafiros",
      jewelryType: "Brazalete de Lujo",
      senderName: "Carlos Rodríguez Martínez",
      senderEmail: "carlos.rodriguez@example.com",
      recipientName: testEmail.split('@')[0] || "Usuario",
      transferNotes: "¡Felicitaciones! Este brazalete ahora es tuyo. Certificado en blockchain para garantizar su autenticidad. 🎁✨",
      transferDate: new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      acceptUrl: `https://veralix.io/transfers/accept/VRX-003`,
      certificateUrl: `https://veralix.io/certificates/VRX-003`
    });
  };

  const testSubscriptionCreated = () => {
    testEmailType('subscription_created', {
      userName: "Usuario Test",
      userEmail: testEmail,
      planName: "Professional",
      pricePerMonth: 149000,
      currency: "COP",
      certificatesLimit: 100,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      dashboardUrl: `${window.location.origin}/dashboard`,
      logoUrl: `${window.location.origin}/veralix-logo-email.png`,
      supportEmail: "soporte@veralix.io"
    });
  };

  const testSubscriptionRenewed = () => {
    testEmailType('subscription_renewed', {
      userName: "Usuario Test",
      userEmail: testEmail,
      planName: "Professional",
      pricePerMonth: 149000,
      currency: "COP",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      transactionId: "TXN-" + Date.now(),
      dashboardUrl: `${window.location.origin}/dashboard`,
      logoUrl: `${window.location.origin}/veralix-logo-email.png`,
      supportEmail: "soporte@veralix.io"
    });
  };

  const testSubscriptionCanceled = () => {
    testEmailType('subscription_canceled', {
      userName: "Usuario Test",
      userEmail: testEmail,
      planName: "Professional",
      pricePerMonth: 149000,
      currency: "COP",
      canceledAt: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      reactivateUrl: `${window.location.origin}/subscription`,
      dashboardUrl: `${window.location.origin}/dashboard`,
      logoUrl: `${window.location.origin}/veralix-logo-email.png`,
      supportEmail: "soporte@veralix.io"
    });
  };

  const testPaymentFailed = () => {
    testEmailType('payment_failed', {
      userName: "Usuario Test",
      userEmail: testEmail,
      planName: "Professional",
      pricePerMonth: 149000,
      currency: "COP",
      attemptDate: new Date().toISOString(),
      retryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      failureReason: "Fondos insuficientes",
      updatePaymentUrl: `${window.location.origin}/subscription`,
      dashboardUrl: `${window.location.origin}/dashboard`,
      logoUrl: `${window.location.origin}/veralix-logo-email.png`,
      supportEmail: "soporte@veralix.io"
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sistema de Testing de Emails</h1>
            <p className="text-muted-foreground">Valida todos los tipos de emails del sistema Veralix</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Email de Prueba</CardTitle>
            <CardDescription>
              Ingresa el email donde recibirás los emails de prueba
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="testEmail">Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="tu-email@ejemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="auth" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="auth">Autenticación</TabsTrigger>
            <TabsTrigger value="orders">Órdenes</TabsTrigger>
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
            <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          </TabsList>

          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle>Emails de Autenticación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={testWelcomeEmail}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Email de Bienvenida
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Emails de Órdenes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={testOrderConfirmation}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Confirmación de Orden
                </Button>
                <Button
                  onClick={testOrderStatusUpdate}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Actualización de Estado
                </Button>
                <Button
                  onClick={testPaymentConfirmation}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Confirmación de Pago
                </Button>
                <Button
                  onClick={testOrderMessage}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Mensaje de Orden
                </Button>
                <Button
                  onClick={testOrderCancelled}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Orden Cancelada
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Emails de Certificados NFT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={testCertificateGenerated}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Certificado Generado
                </Button>
                <Button
                  onClick={testCertificateTransferInitiated}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Transferencia Iniciada
                </Button>
                <Button
                  onClick={testCertificateTransferReceived}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Transferencia Recibida
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Emails de Suscripciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={testSubscriptionCreated}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Suscripción Creada
                </Button>
                <Button
                  onClick={testSubscriptionRenewed}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Suscripción Renovada
                </Button>
                <Button
                  onClick={testSubscriptionCanceled}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Suscripción Cancelada
                </Button>
                <Button
                  onClick={testPaymentFailed}
                  disabled={!testEmail || loading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Pago Fallido
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {results.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resultados de Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted"
                  >
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium capitalize">{result.type.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
