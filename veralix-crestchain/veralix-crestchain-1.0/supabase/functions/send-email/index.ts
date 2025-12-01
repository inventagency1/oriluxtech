import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";

// Import templates
import { OrderConfirmationEmail } from "./_templates/orders/order-confirmation.tsx";
import { OrderStatusUpdateEmail } from "./_templates/orders/order-status-update.tsx";
import { PaymentConfirmationEmail } from "./_templates/orders/payment-confirmation.tsx";
import { OrderMessageEmail } from "./_templates/orders/order-message.tsx";
import { OrderCancelledEmail } from "./_templates/orders/order-cancelled.tsx";
import { CertificateGeneratedEmail } from "./_templates/certificates/certificate-generated.tsx";
import { CertificateTransferInitiatedEmail } from "./_templates/certificates/certificate-transfer-initiated.tsx";
import { CertificateTransferReceivedEmail } from "./_templates/certificates/certificate-transfer-received.tsx";
import { WelcomeEmail } from "./_templates/auth/welcome.tsx";
import { PasswordResetEmail } from "./_templates/auth/password-reset.tsx";
import { SubscriptionCreatedEmail } from "./_templates/subscriptions/subscription-created.tsx";
import { JewelryCreatedEmail } from "./_templates/admin/jewelry-created.tsx";
import { SubscriptionRenewedEmail } from "./_templates/subscriptions/subscription-renewed.tsx";
import { SubscriptionCanceledEmail } from "./_templates/subscriptions/subscription-canceled.tsx";
import { PaymentFailedEmail } from "./_templates/subscriptions/payment-failed.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Veralix branding constants
const VERALIX_LOGO_URL = "https://veralix.io/veralix-logo-email.png";
const VERALIX_WEBSITE = "https://veralix.io";
const VERALIX_SUPPORT_EMAIL = "support@veralix.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'password_reset' | 'order_confirmation' | 'order_status_update' | 'payment_confirmation' | 
        'order_message' | 'order_cancelled' | 'certificate_generated' | 
        'certificate_transfer_initiated' | 'certificate_transfer_received' |
        'subscription_created' | 'subscription_renewed' | 'subscription_canceled' | 'payment_failed' |
        'admin-jewelry-created';
  to: string | string[];
  data: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    console.log("Processing email request:", emailRequest.type);

    let subject = "";
    let html = "";

    // Route to appropriate template based on type
    switch (emailRequest.type) {
      case "welcome":
        subject = "¡Bienvenido a Veralix! 💎";
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
          })
        );
        break;

      case "password_reset":
        console.log('📧 Rendering password reset email for:', emailRequest.to);
        subject = "🔐 Restablece tu contraseña de Veralix";
        html = await renderAsync(
          React.createElement(PasswordResetEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
          })
        );
        console.log('✅ Email template rendered successfully');
        break;

      case "order_confirmation":
        subject = `✅ Orden confirmada #${emailRequest.data.orderNumber}`;
        html = await renderAsync(
          React.createElement(OrderConfirmationEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
          })
        );
        break;

      case "order_status_update":
        subject = `📦 Actualización de orden #${emailRequest.data.orderNumber}`;
        html = await renderAsync(
          React.createElement(OrderStatusUpdateEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
          })
        );
        break;

      case "payment_confirmation":
        subject = `✅ Pago confirmado - Orden #${emailRequest.data.orderNumber}`;
        html = await renderAsync(
          React.createElement(PaymentConfirmationEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
            supportEmail: VERALIX_SUPPORT_EMAIL,
          })
        );
        break;

      case "order_message":
        subject = `💬 Nuevo mensaje - Orden #${emailRequest.data.orderNumber}`;
        html = await renderAsync(
          React.createElement(OrderMessageEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
          })
        );
        break;

      case "order_cancelled":
        subject = `❌ Orden cancelada #${emailRequest.data.orderNumber}`;
        html = await renderAsync(
          React.createElement(OrderCancelledEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
          })
        );
        break;

      case "certificate_generated":
        subject = `🎉 Certificado NFT generado - ${emailRequest.data.certificateId}`;
        html = await renderAsync(
          React.createElement(CertificateGeneratedEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
            supportEmail: VERALIX_SUPPORT_EMAIL,
          })
        );
        break;

      case "certificate_transfer_initiated":
        subject = `🔄 Transferencia de certificado iniciada - ${emailRequest.data.certificateId}`;
        html = await renderAsync(
          React.createElement(CertificateTransferInitiatedEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
          })
        );
        break;

      case "certificate_transfer_received":
        subject = `🎁 Has recibido un certificado NFT - ${emailRequest.data.certificateId}`;
        html = await renderAsync(
          React.createElement(CertificateTransferReceivedEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
          })
        );
        break;

      case "subscription_created":
        subject = `¡Bienvenido a Veralix ${emailRequest.data.planName}! 🎉`;
        html = await renderAsync(
          React.createElement(SubscriptionCreatedEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
            supportEmail: VERALIX_SUPPORT_EMAIL,
          })
        );
        break;

      case "subscription_renewed":
        subject = `✅ Suscripción renovada - ${emailRequest.data.planName}`;
        html = await renderAsync(
          React.createElement(SubscriptionRenewedEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
            supportEmail: VERALIX_SUPPORT_EMAIL,
          })
        );
        break;

      case "subscription_canceled":
        subject = `Suscripción cancelada - ${emailRequest.data.planName}`;
        html = await renderAsync(
          React.createElement(SubscriptionCanceledEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
            supportEmail: VERALIX_SUPPORT_EMAIL,
          })
        );
        break;

      case "payment_failed":
        subject = `⚠️ Problema con tu pago - ${emailRequest.data.planName}`;
        html = await renderAsync(
          React.createElement(PaymentFailedEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
            supportEmail: VERALIX_SUPPORT_EMAIL,
          })
        );
        break;

      case "admin-jewelry-created":
        subject = `🆕 Nueva joya registrada - ${emailRequest.data.jewelryName}`;
        html = await renderAsync(
          React.createElement(JewelryCreatedEmail, {
            ...emailRequest.data,
            logoUrl: VERALIX_LOGO_URL,
            websiteUrl: VERALIX_WEBSITE,
            supportEmail: VERALIX_SUPPORT_EMAIL,
          })
        );
        break;

      default:
        throw new Error(`Unknown email type: ${emailRequest.type}`);
    }

    // Send email
    console.log('📨 Sending email via Resend...');
    const emailResponse = await resend.emails.send({
      from: "Veralix <hola@veralix.io>",
      to: Array.isArray(emailRequest.to) ? emailRequest.to : [emailRequest.to],
      subject,
      html,
    });

    console.log("✅ Email sent successfully via Resend:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
