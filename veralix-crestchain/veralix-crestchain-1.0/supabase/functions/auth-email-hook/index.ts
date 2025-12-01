import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { MagicLinkEmail } from "./_templates/MagicLinkEmail.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    console.log("🔐 Received auth webhook");
    
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verificar webhook signature
    const wh = new Webhook(hookSecret);
    let webhookData: any;
    
    try {
      webhookData = wh.verify(payload, headers);
      console.log("✅ Webhook signature verified");
    } catch (error) {
      console.error("❌ Webhook verification failed:", error);
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { user, email_data } = webhookData;
    
    // Log detallado de los datos recibidos
    console.log("📧 Processing email for:", user?.email);
    console.log("📋 Email data received:", JSON.stringify({
      token: email_data?.token ? `${email_data.token.substring(0, 10)}...` : 'MISSING',
      token_hash: email_data?.token_hash ? `${email_data.token_hash.substring(0, 10)}...` : 'MISSING',
      redirect_to: email_data?.redirect_to || 'NOT SET',
      email_action_type: email_data?.email_action_type || 'MISSING',
      site_url: email_data?.site_url || 'NOT SET',
    }));

    // Extraer datos con validación
    const token = email_data?.token || '';
    const token_hash = email_data?.token_hash || '';
    const redirect_to = email_data?.redirect_to || email_data?.site_url || 'https://veralix.io/';
    const email_action_type = email_data?.email_action_type || 'signup';
    const site_url = email_data?.site_url || 'https://veralix.io';

    // Validar que tenemos los datos necesarios
    if (!token_hash) {
      console.error("❌ CRITICAL: token_hash is missing!");
      console.error("Full webhook data:", JSON.stringify(webhookData, null, 2));
    }

    // Construir URL de verificación
    const verifyUrl = token_hash 
      ? `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`
      : `${site_url}`; // Fallback si no hay token
    
    console.log("🔗 Verify URL constructed:", verifyUrl.substring(0, 80) + '...');

    let subject = "";
    let html = "";

    // Determinar tipo de email
    switch (email_action_type) {
      case "signup":
      case "magiclink":
        subject = "🔐 Verifica tu cuenta de Veralix";
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            supabaseUrl,
            token,
            tokenHash: token_hash,
            redirectTo: redirect_to || site_url,
            emailActionType: email_action_type,
            userEmail: user.email,
            logoUrl: "https://veralix.io/veralix-logo-email.png",
            websiteUrl: "https://veralix.io",
          })
        );
        break;

      case "recovery":
        subject = "🔑 Recupera tu cuenta de Veralix";
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            supabaseUrl,
            token,
            tokenHash: token_hash,
            redirectTo: redirect_to || site_url,
            emailActionType: email_action_type,
            userEmail: user.email,
            logoUrl: "https://veralix.io/veralix-logo-email.png",
            websiteUrl: "https://veralix.io",
            isRecovery: true,
          })
        );
        break;

      case "email_change":
        subject = "📧 Confirma tu nuevo email en Veralix";
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            supabaseUrl,
            token,
            tokenHash: token_hash,
            redirectTo: redirect_to || site_url,
            emailActionType: email_action_type,
            userEmail: user.email,
            logoUrl: "https://veralix.io/veralix-logo-email.png",
            websiteUrl: "https://veralix.io",
            isEmailChange: true,
          })
        );
        break;

      default:
        console.warn("⚠️ Unknown email action type:", email_action_type);
        return new Response(
          JSON.stringify({ error: "Unknown email action type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Enviar email via Resend
    console.log("📨 Sending email via Resend to:", user.email);
    
    const { data, error } = await resend.emails.send({
      from: "Veralix <noreply@veralix.io>",
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw error;
    }

    console.log("✅ Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in auth-email-hook:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.response?.data || error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
