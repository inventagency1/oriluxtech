import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  orderId: string;
  paymentMethod: 'bold' | 'wompi' | 'manual';
  returnUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { orderId, paymentMethod, returnUrl }: PaymentRequest = await req.json();

    console.log('Processing payment for order:', orderId, 'method:', paymentMethod);

    // Get the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        listing:marketplace_listings (
          id,
          jewelry_item:jewelry_items (
            id,
            name,
            type
          )
        )
      `)
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found or unauthorized');
    }

    if (order.payment_status !== 'pending') {
      throw new Error('Order payment already processed');
    }

    let paymentResult;

    if (paymentMethod === 'wompi') {
      // Process Wompi payment
      paymentResult = await processWompiPayment(order, returnUrl);
    } else if (paymentMethod === 'bold') {
      // Process Bold payment
      paymentResult = await processBoldPayment(order, returnUrl);
    } else {
      // Manual payment - mark as processing and send email
      paymentResult = await processManualPayment(order);
    }

      // Update order with payment information
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: paymentResult.status,
          payment_method: paymentMethod,
          payment_reference: paymentResult.reference,
          bold_payment_id: paymentResult.boldPaymentId || null,
          wompi_transaction_id: paymentResult.wompiTransactionId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error('Failed to update order');
    }

    // Send confirmation email
    await sendOrderConfirmationEmail(order, paymentResult);

    console.log('Payment processed successfully:', paymentResult);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        reference: paymentResult.reference,
        status: paymentResult.status
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in process-payment function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

async function processBoldPayment(order: any, returnUrl?: string) {
  const boldApiKey = Deno.env.get('BOLD_API_KEY');
  const boldApiUrl = Deno.env.get('BOLD_API_URL') || 'https://api.bold.co';

  if (!boldApiKey) {
    throw new Error('Bold API key not configured');
  }

  const paymentData = {
    order_id: order.order_number,
    amount: Math.round(order.total_amount * 100), // Convert to cents
    currency: order.currency,
    description: `Compra de joya: ${order.listing.jewelry_item.name}`,
    customer: {
      id: order.buyer_id,
      email: order.buyer?.email || 'buyer@example.com'
    },
    redirect_url: returnUrl || `${Deno.env.get('SUPABASE_URL')}/payment-success`,
    webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/bold-payment-webhook`
  };

  const response = await fetch(`${boldApiUrl}/v2/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${boldApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Bold API error:', error);
    throw new Error('Failed to create Bold payment');
  }

  const boldResponse = await response.json();

  return {
    status: 'processing',
    reference: boldResponse.id,
    boldPaymentId: boldResponse.id,
    paymentUrl: boldResponse.payment_url
  };
}

async function processManualPayment(order: any) {
  // Generate a payment reference
  const reference = `MAN-${order.order_number}-${Date.now()}`;

  return {
    status: 'processing',
    reference: reference,
    boldPaymentId: null,
    paymentUrl: null
  };
}

async function generateSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function processWompiPayment(order: any, returnUrl?: string) {
  const wompiUrl = 'https://production.wompi.co/v1/transactions';
  const privateKey = Deno.env.get('WOMPI_PRIVATE_KEY');
  const publicKey = Deno.env.get('WOMPI_PUBLIC_KEY');
  const integritySecret = Deno.env.get('WOMPI_INTEGRITY_SECRET');

  if (!privateKey || !integritySecret) {
    throw new Error('Wompi credentials not configured');
  }

  const reference = `${order.order_number}-${Date.now()}`;
  const amountInCents = Math.round(order.total_amount * 100);
  
  // Generate integrity signature
  const integrityString = `${reference}${amountInCents}COP${integritySecret}`;
  const integrity = await generateSHA256(integrityString);

  console.log('Creating Wompi payment:', {
    reference,
    amount: amountInCents,
    integrity: integrity.substring(0, 10) + '...'
  });

  const paymentData = {
    acceptance_token: publicKey,
    amount_in_cents: amountInCents,
    currency: 'COP',
    customer_email: order.buyer?.email || 'comprador@ejemplo.com',
    payment_method: {
      type: 'PSE',
      user_type: 0,
      payment_description: `Compra de joya: ${order.listing?.jewelry_item?.name || 'Joya'}`,
      user_legal_id_type: 'CC',
      user_legal_id: '123456789'
    },
    reference: reference,
    redirect_url: returnUrl || `${Deno.env.get('FRONTEND_URL')}/payment-return`,
    signature: {
      integrity: integrity
    }
  };

  const response = await fetch(wompiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${privateKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Wompi API error:', error);
    throw new Error(`Failed to create Wompi payment: ${error}`);
  }

  const wompiResponse = await response.json();
  console.log('Wompi response:', wompiResponse);

  return {
    status: 'processing',
    reference: wompiResponse.data?.reference || reference,
    wompiTransactionId: wompiResponse.data?.id,
    paymentUrl: wompiResponse.data?.payment_link_url || wompiResponse.data?.payment_method_url
  };
}

async function sendOrderConfirmationEmail(order: any, paymentResult: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the send-email function
    const { error } = await supabase.functions.invoke('send-order-email', {
      body: {
        type: 'order_confirmation',
        orderId: order.id,
        orderNumber: order.order_number,
        buyerEmail: order.buyer?.email,
        sellerEmail: order.listing?.seller?.email,
        jewelryName: order.listing?.jewelry_item?.name,
        amount: order.total_amount,
        currency: order.currency,
        paymentReference: paymentResult.reference,
        paymentStatus: paymentResult.status
      }
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
    } else {
      console.log('Order confirmation email sent successfully');
    }
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
  }
}

serve(handler);