import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { corsHeaders } from "../_shared/cors.ts"

const WOMPI_API_URL = "https://api-sandbox.wompi.co/v1"
const WOMPI_PRIVATE_KEY = Deno.env.get('WOMPI_PRIVATE_KEY')
const WOMPI_PUBLIC_KEY = Deno.env.get('WOMPI_PUBLIC_KEY')
const WOMPI_EVENTS_SECRET = Deno.env.get('WOMPI_EVENTS_SECRET')

interface WompiPaymentRequest {
  amount: number
  currency: string
  description: string
  orderId: string
  userId: string
  customerEmail: string
  redirectUrl: string
  paymentMethod?: string // 'PSE' | 'CARD'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action } = body

    if (action === 'create-payment') {
      return await handleCreatePayment(body)
    } else if (action === 'verify-payment') {
      return await handleVerifyPayment(body)
    } else if (action === 'webhook') {
      return await handleWebhook(req, body)
    }

    return new Response(
      JSON.stringify({ error: 'Action not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Wompi payments error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleCreatePayment(data: WompiPaymentRequest) {
  console.log('🚀 Creating Wompi payment:', { 
    orderId: data.orderId, 
    amount: data.amount,
    method: data.paymentMethod || 'PSE'
  })

  if (!WOMPI_PRIVATE_KEY || !WOMPI_PUBLIC_KEY) {
    console.error('❌ Wompi credentials not configured')
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Wompi API keys not configured' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Create transaction payload (signature is NOT required for transaction creation)
    const transactionPayload = {
      acceptance_token: await getAcceptanceToken(),
      amount_in_cents: Math.round(data.amount * 100),
      currency: data.currency || 'COP',
      customer_email: data.customerEmail,
      payment_method: {
        type: data.paymentMethod || 'PSE',
        user_type: 0, // 0: Persona natural, 1: Persona jurídica
        payment_description: data.description
      },
      reference: data.orderId,
      redirect_url: data.redirectUrl
    }

    console.log('📤 Sending to Wompi:', { 
      url: `${WOMPI_API_URL}/transactions`,
      reference: transactionPayload.reference,
      amount: transactionPayload.amount_in_cents
    })

    const response = await fetch(`${WOMPI_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(transactionPayload)
    })

    const responseData = await response.json()
    
    console.log('📥 Wompi response:', {
      status: response.status,
      data: responseData
    })

    if (!response.ok) {
      console.error('❌ Wompi API error:', responseData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: responseData.error?.messages?.[0] || 'Payment creation failed',
          details: responseData
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get payment URL from response
    const paymentUrl = responseData.data?.payment_link_url || 
                       responseData.data?.payment_method?.extra?.async_payment_url ||
                       null

    console.log('✅ Wompi payment created:', {
      transactionId: responseData.data?.id,
      status: responseData.data?.status,
      paymentUrl
    })

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: responseData.data?.id,
        status: responseData.data?.status,
        paymentUrl,
        orderId: data.orderId,
        reference: responseData.data?.reference
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Wompi payment creation error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleVerifyPayment(data: { transactionId: string }) {
  console.log('🔍 Verifying Wompi payment:', data.transactionId)

  if (!WOMPI_PRIVATE_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: 'Wompi credentials not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const response = await fetch(`${WOMPI_API_URL}/transactions/${data.transactionId}`, {
      headers: {
        'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Accept': 'application/json'
      }
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('❌ Wompi verification error:', responseData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Verification failed' 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const transaction = responseData.data
    const isPaid = transaction.status === 'APPROVED'

    console.log('✅ Payment verified:', {
      transactionId: transaction.id,
      status: transaction.status,
      isPaid
    })

    return new Response(
      JSON.stringify({
        success: true,
        isPaid,
        status: transaction.status,
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount_in_cents / 100
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Verification error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleWebhook(req: Request, body: any) {
  const startTime = Date.now()
  console.log('🔔 Webhook received:', {
    timestamp: new Date().toISOString(),
    eventType: body.event,
    transactionId: body.data?.transaction?.id,
    status: body.data?.transaction?.status
  })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let webhookLogId: string | null = null

  try {
    const signature = req.headers.get('x-event-checksum')
    const signatureValid = signature && WOMPI_EVENTS_SECRET ? true : false
    
    // Log webhook immediately
    const { data: logData } = await supabase
      .from('wompi_webhook_logs')
      .insert({
        event_type: body.event || 'unknown',
        transaction_id: body.data?.transaction?.id,
        status: body.data?.transaction?.status,
        reference: body.data?.transaction?.reference,
        amount_in_cents: body.data?.transaction?.amount_in_cents,
        currency: body.data?.transaction?.currency,
        raw_payload: body,
        signature_valid: signatureValid,
        processed: false,
        order_id: body.data?.transaction?.reference
      })
      .select('id')
      .single()

    webhookLogId = logData?.id

    // Verify signature if provided
    if (signature && WOMPI_EVENTS_SECRET) {
      const expectedSignature = await generateWebhookSignature(JSON.stringify(body))
      if (signature !== expectedSignature) {
        if (webhookLogId) {
          await supabase.from('wompi_webhook_logs').update({ 
            signature_valid: false,
            processing_error: 'Invalid signature',
            processed: true 
          }).eq('id', webhookLogId)
        }
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const event = body.event
    const transaction = body.data?.transaction

    if (event === 'transaction.updated' || event === 'transaction.created') {
      await updatePaymentStatus(transaction, webhookLogId)
      if (webhookLogId) {
        await supabase.from('wompi_webhook_logs').update({ processed: true }).eq('id', webhookLogId)
      }
      console.log('✅ Webhook processed in', Date.now() - startTime, 'ms')
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    if (webhookLogId) {
      await supabase.from('wompi_webhook_logs').update({ 
        processing_error: error.message,
        processed: true 
      }).eq('id', webhookLogId).catch(() => {})
    }
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getAcceptanceToken(): Promise<string> {
  // Get Wompi's terms and conditions acceptance token
  const response = await fetch(`${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`)
  const data = await response.json()
  return data.data?.presigned_acceptance?.acceptance_token || ''
}

async function generateWebhookSignature(payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(payload + WOMPI_EVENTS_SECRET)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function updatePaymentStatus(transaction: any, webhookLogId?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('💾 Updating payment status:', {
      transactionId: transaction.id,
      status: transaction.status,
      reference: transaction.reference,
      webhookLogId
    })

    // Get pending payment
    const { data: pendingPayment, error: pendingError } = await supabase
      .from('pending_payments')
      .select('*')
      .eq('order_id', transaction.reference)
      .single()

    if (pendingError) {
      console.error('❌ Error fetching pending payment:', pendingError)
      return
    }

    if (!pendingPayment) {
      console.log('⚠️ No pending payment found for reference:', transaction.reference)
      return
    }

    // Update pending payment metadata
    const { error: updateError } = await supabase
      .from('pending_payments')
      .update({
        metadata: {
          ...(pendingPayment.metadata || {}),
          wompi_transaction_id: transaction.id,
          wompi_status: transaction.status,
          wompi_status_message: transaction.status_message,
          wompi_updated_at: new Date().toISOString()
        }
      })
      .eq('order_id', transaction.reference)

    if (updateError) {
      console.error('❌ Error updating pending payment:', updateError)
      return
    }

    // If payment is APPROVED, create certificate purchase
    if (transaction.status === 'APPROVED') {
      console.log('✅ Payment APPROVED, creating certificate purchase...')

      const metadata = pendingPayment.metadata as any

      const { error: purchaseError } = await supabase
        .from('certificate_purchases')
        .insert({
          user_id: pendingPayment.user_id,
          package_name: metadata.package_name,
          package_type: metadata.package_id,
          certificates_purchased: metadata.certificates_count,
          certificates_remaining: metadata.certificates_count,
          certificates_used: 0,
          amount_paid: pendingPayment.amount,
          currency: pendingPayment.currency,
          payment_status: 'completed',
          payment_provider: 'wompi',
          transaction_id: transaction.id,
          purchased_at: new Date().toISOString(),
          metadata: {
            ...metadata,
            wompi_transaction_id: transaction.id,
            wompi_reference: transaction.reference,
            wompi_payment_method: transaction.payment_method_type,
            processed_at: new Date().toISOString()
          }
        })

      if (purchaseError) {
        console.error('❌ Error creating certificate purchase:', purchaseError)
        return
      }

      // Delete pending payment after successful processing
      const { error: deleteError } = await supabase
        .from('pending_payments')
        .delete()
        .eq('order_id', transaction.reference)

      if (deleteError) {
        console.error('⚠️ Error deleting pending payment:', deleteError)
      } else {
        console.log('✅ Certificate purchase created and pending payment deleted')
      }
    } else {
      console.log(`📝 Payment status: ${transaction.status} - waiting for APPROVED status`)
    }

  } catch (error) {
    console.error('❌ Database update error:', error)
  }
}
