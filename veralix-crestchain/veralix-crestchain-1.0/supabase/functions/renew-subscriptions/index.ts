import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan: string;
  price_per_month: number;
  current_period_start: string;
  current_period_end: string;
  certificates_limit: number;
  certificates_used: number;
}

interface ProfileRecord {
  full_name: string | null;
  email: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting subscription renewal process...");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Buscar suscripciones que vencen en las próximas 24 horas
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .lte("current_period_end", tomorrow.toISOString())
      .gte("current_period_end", new Date().toISOString());

    if (subsError) {
      console.error("Error fetching subscriptions:", subsError);
      throw subsError;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to renew`);

    const results = {
      renewed: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const subscription of subscriptions || []) {
      try {
        await renewSubscription(supabaseAdmin, subscription, results);
      } catch (error) {
        console.error(`Error renewing subscription ${subscription.id}:`, error);
        results.failed++;
        results.errors.push(`${subscription.id}: ${error.message}`);
      }
    }

    console.log("Renewal process completed:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Renewed ${results.renewed} subscriptions, ${results.failed} failed`,
        details: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in renew-subscriptions function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

async function renewSubscription(
  supabaseAdmin: any,
  subscription: SubscriptionRecord,
  results: any
) {
  console.log(`Processing renewal for subscription ${subscription.id}`);

  // Calcular nuevos períodos
  const newPeriodStart = new Date(subscription.current_period_end);
  const newPeriodEnd = new Date(subscription.current_period_end);
  newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);

  // Actualizar la suscripción usando la función SQL
  const { error: renewError } = await supabaseAdmin.rpc("renew_subscription", {
    p_subscription_id: subscription.id,
    p_transaction_id: `auto-renew-${Date.now()}`,
  });

  if (renewError) {
    console.error("Error calling renew_subscription:", renewError);
    throw new Error(`Failed to renew subscription: ${renewError.message}`);
  }

  // Crear registro de transacción
  const { error: transactionError } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: subscription.user_id,
      type: "subscription_renewal",
      amount: subscription.price_per_month,
      currency: "COP",
      status: "completed",
      metadata: {
        subscription_id: subscription.id,
        plan: subscription.plan,
        period_start: newPeriodStart.toISOString(),
        period_end: newPeriodEnd.toISOString(),
        auto_renewed: true,
      },
    });

  if (transactionError) {
    console.error("Error creating transaction:", transactionError);
  }

  // Obtener información del usuario para el email
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("user_id", subscription.user_id)
    .single();

  if (profile?.email) {
    // Enviar email de renovación
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "";
    const dashboardUrl = `${baseUrl}/dashboard`;

    const { error: emailError } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        type: "subscription_renewed",
        to: profile.email,
        data: {
          userName: profile.full_name || "Usuario",
          planName: subscription.plan,
          pricePerMonth: subscription.price_per_month,
          currentPeriodStart: newPeriodStart.toISOString(),
          currentPeriodEnd: newPeriodEnd.toISOString(),
          transactionId: `auto-renew-${Date.now()}`,
          dashboardUrl: dashboardUrl,
          supportEmail: "soporte@veralix.com",
        },
      },
    });

    if (emailError) {
      console.error("Error sending renewal email:", emailError);
    } else {
      console.log(`Renewal email sent to ${profile.email}`);
    }
  }

  // Registrar en audit log
  await supabaseAdmin.from("audit_logs").insert({
    user_id: subscription.user_id,
    action: "subscription_auto_renewed",
    resource_type: "subscription",
    resource_id: subscription.id,
    details: {
      plan: subscription.plan,
      price: subscription.price_per_month,
      new_period_end: newPeriodEnd.toISOString(),
      auto_renewed: true,
    },
  });

  results.renewed++;
  console.log(`Successfully renewed subscription ${subscription.id}`);
}

serve(handler);
