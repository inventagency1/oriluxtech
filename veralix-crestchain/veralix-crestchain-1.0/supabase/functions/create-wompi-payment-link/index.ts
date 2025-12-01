import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const WOMPI_PRIVATE_KEY = Deno.env.get('WOMPI_PRIVATE_KEY');
const WOMPI_API_URL = 'https://api.wompi.co/v1';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('No autorizado');
    }

    const { 
      orderId, 
      amount, 
      currency, 
      customerEmail, 
      customerFullName,
      redirectUrl,
      paymentType = 'certificate_package',
      description 
    } = await req.json();

    console.log('🚀 Creating Wompi payment link:', { orderId, amount, currency, paymentType });

    // Determinar nombre y descripción según el tipo de pago
    const paymentName = paymentType === 'marketplace_order' 
      ? `Orden Marketplace - ${orderId}`
      : `Paquete de Certificados - ${orderId}`;
    
    const paymentDescription = description || (
      paymentType === 'marketplace_order'
        ? 'Compra de joya en Marketplace Veralix'
        : 'Compra de certificados Veralix'
    );

    // Crear payment link en Wompi
    const wompiResponse = await fetch(`${WOMPI_API_URL}/payment_links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: paymentName,
        description: paymentDescription,
        single_use: true,
        collect_shipping: false,
        currency: currency,
        amount_in_cents: amount,
        reference: orderId,
        redirect_url: redirectUrl,
        customer_data: {
          email: customerEmail,
          full_name: customerFullName
        }
      })
    });

    const wompiData = await wompiResponse.json();

    if (!wompiResponse.ok) {
      console.error('❌ Wompi API error:', wompiData);
      throw new Error(`Error de Wompi: ${wompiData.error?.reason || 'Error desconocido'}`);
    }

    console.log('✅ Payment link created:', wompiData.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: `https://checkout.wompi.co/l/${wompiData.data.id}`,
        linkId: wompiData.data.id,
        orderId: orderId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('💥 Error in create-wompi-payment-link:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
