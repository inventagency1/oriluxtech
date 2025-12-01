import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// URL base oficial de Bold.co Colombia
const BOLD_API_URL = "https://integrations.api.bold.co"

interface PaymentIntentRequest {
  amount: number
  currency: string
  description: string
  orderId: string
  userId: string
  planId: string
  subscriptionData: any
}

interface BoldPaymentResponse {
  transactionId: string
  status: string
  paymentUrl: string
  orderId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathname = url.pathname

    // Handle different actions based on request body
    if (req.method === 'POST') {
      const body = await req.json()
      const { action } = body

      if (action === 'create-payment-intent') {
        return await handleCreatePaymentIntent(body)
      } else if (action === 'verify-payment') {
        return await handleVerifyPayment(body)
      } else if (action === 'generate-hash') {
        return await handleGenerateHash(body)
      }
    }

    // Handle Bold.co webhooks
    if (req.method === 'POST' && pathname.includes('webhook')) {
      return await handleWebhook(req)
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Bold payments error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleGenerateHash(data: any) {
  const boldApiKey = Deno.env.get('BOLD_API_KEY')
  const boldSecretKey = Deno.env.get('BOLD_SECRET_KEY')
  
  if (!boldApiKey || !boldSecretKey) {
    console.error('❌ Bold credentials not configured')
    return new Response(
      JSON.stringify({ success: false, error: 'Bold credentials not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { orderId, amount, currency } = data
  
  // Generar hash según documentación Bold.co: {orderId}{amount}{currency}{secretKey}
  const dataToHash = `${orderId}${amount}${currency}${boldSecretKey}`
  
  console.log('🔐 Generating Bold hash for:', { orderId, amount, currency })
  
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(dataToHash)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  console.log('✅ Hash generated successfully')
  
  return new Response(
    JSON.stringify({
      success: true,
      hash: hash,
      apiKey: boldApiKey
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreatePaymentIntent(data: any) {
  const boldApiKey = Deno.env.get('BOLD_API_KEY')
  
  console.log('🔑 API Key status:', {
    present: !!boldApiKey,
    length: boldApiKey?.length || 0,
    firstChars: boldApiKey?.substring(0, 8) + '...' || 'N/A'
  })
  console.log('🌐 Bold API URL:', BOLD_API_URL)
  console.log('📤 Request payload preview:', {
    amount: data.amount,
    currency: data.currency,
    orderId: data.orderId,
    userId: data.userId
  })
  
  if (!boldApiKey) {
    console.error('❌ Bold API key not configured')
    return new Response(
      JSON.stringify({ success: false, error: 'Bold API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Validar que todos los secrets estén configurados
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const frontendUrl = Deno.env.get('FRONTEND_URL')

  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL not configured')
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!frontendUrl) {
    console.warn('⚠️ FRONTEND_URL not configured, using default')
  }

  const { amount, currency, description, orderId, userId, planId, subscriptionData } = data

  console.log('🔵 Creating Bold payment link:', {
    amount, 
    currency, 
    description, 
    orderId,
    userId
  })

  try {
    // Generar timestamp para expiración (24 horas desde ahora)
    const expirationDate = Date.now() * 1e6 + (24 * 60 * 60 * 1e9)
    
    // Estructura correcta según documentación Bold.co Colombia
    const boldRequest = {
      amount_type: "CLOSE",
      amount: {
        currency: "COP", // Siempre COP para Colombia
        total_amount: Math.round(amount), // Sin decimales
        tip_amount: 0,
        taxes: [] // Sin impuestos por ahora
      },
      reference: orderId,
      description: description || `Pago de ${planId}`,
      expiration_date: expirationDate,
      callback_url: `${frontendUrl || 'https://06e17ebd-3726-435b-819c-6b65302f0519.lovableproject.com'}/payment-return?orderId=${orderId}`,
      payment_methods: ["CREDIT_CARD", "PSE", "NEQUI", "BOTON_BANCOLOMBIA"]
    }

    console.log('🌐 Callback URL:', boldRequest.callback_url)
    console.log('💰 Amount breakdown:', {
      original: amount,
      rounded: Math.round(amount),
      currency: 'COP'
    })
    console.log('📤 Bold request:', JSON.stringify(boldRequest, null, 2))

    // Llamada a la API de Bold usando autenticación x-api-key
    const boldResponse = await fetch(`${BOLD_API_URL}/online/link/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `x-api-key ${boldApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(boldRequest)
    })

    const responseText = await boldResponse.text()
    console.log('📥 Bold response status:', boldResponse.status)
    console.log('📥 Bold response body:', responseText)

    if (!boldResponse.ok) {
      console.error('❌ Bold API error:', boldResponse.status, responseText)
      throw new Error(`Bold API error: ${boldResponse.status} - ${responseText}`)
    }

    const boldData = JSON.parse(responseText)

    // Validar respuesta
    if (boldData.errors && boldData.errors.length > 0) {
      console.error('❌ Bold returned errors:', boldData.errors)
      throw new Error(`Bold errors: ${JSON.stringify(boldData.errors)}`)
    }

    if (!boldData.payload || !boldData.payload.url) {
      console.error('❌ Invalid Bold response:', boldData)
      throw new Error('Invalid response from Bold')
    }

    console.log('✅ Bold payment link created:', boldData.payload)

    // Guardar metadatos del pago en pending_payments
    try {
      await supabaseAdmin
        .from('pending_payments')
        .update({ 
          metadata: {
            ...JSON.parse(subscriptionData || '{}'),
            bold_payment_link: boldData.payload.payment_link,
            bold_payment_url: boldData.payload.url
          }
        })
        .eq('order_id', orderId)
    } catch (updateError) {
      console.error('⚠️ Warning: Could not update pending_payments:', updateError)
      // No fallar si no se puede actualizar - el pago sigue siendo válido
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: boldData.payload.url,
        paymentLink: boldData.payload.payment_link,
        orderId: orderId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ Error creating Bold payment:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create payment link'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleVerifyPayment(data: any) {
  const { orderId } = data
  const boldApiKey = Deno.env.get('BOLD_API_KEY')

  if (!orderId || !boldApiKey) {
    console.error('❌ Missing orderId or API key')
    return new Response(
      JSON.stringify({ success: false, error: 'Missing orderId or API key' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('🔍 Verifying payment for orderId:', orderId)

  try {
    // Buscar el payment_link asociado al orderId en pending_payments
    const { data: pendingPayment } = await supabaseAdmin
      .from('pending_payments')
      .select('metadata')
      .eq('order_id', orderId)
      .maybeSingle()
    
    // Intentar obtener el payment_link de metadata o usar el orderId directamente
    const paymentLink = pendingPayment?.metadata?.bold_payment_link || 
                       (orderId.startsWith('LNK_') ? orderId : null)
    
    if (!paymentLink) {
      console.error('❌ No payment link found for orderId:', orderId)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment link not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const boldResponse = await fetch(
      `${BOLD_API_URL}/online/link/v1/${paymentLink}`,
      {
        headers: {
          'Authorization': `x-api-key ${boldApiKey}`
        }
      }
    )

    if (!boldResponse.ok) {
      console.error('❌ Bold API error:', boldResponse.status)
      const errorText = await boldResponse.text()
      console.error('❌ Error details:', errorText)
      throw new Error(`Bold API error: ${boldResponse.status}`)
    }

    const paymentData = await boldResponse.json()
    console.log('📥 Payment status from Bold:', paymentData)

    // Estados posibles: ACTIVE, PROCESSING, PAID, REJECTED, CANCELLED, EXPIRED
    const status = paymentData.status
    const isPaid = status === 'PAID'

    return new Response(
      JSON.stringify({
        success: true,
        status: status,
        isPaid: isPaid,
        paymentLink: paymentData.id,
        transactionId: paymentData.transaction_id,
        amount: paymentData.total,
        reference: paymentData.reference
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ Error verifying Bold payment:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to verify payment'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleWebhook(req: Request) {
  console.log('🔔 Bold webhook received')
  
  try {
    const payload = await req.json()
    console.log('📦 Webhook payload:', JSON.stringify(payload, null, 2))

    // Bold.co envía webhooks con estructura "notifications"
    if (!payload.notifications || !Array.isArray(payload.notifications)) {
      console.error('❌ Invalid webhook structure')
      return new Response(
        JSON.stringify({ error: 'Invalid webhook structure' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Procesar cada notificación
    for (const notification of payload.notifications) {
      const { type, data, subject } = notification
      
      console.log(`📬 Processing notification type: ${type}, subject: ${subject}`)

      if (type === 'SALE_APPROVED' || type === 'PAYMENT_APPROVED') {
        await processPaymentApproved(data, notification)
      } else if (type === 'SALE_REJECTED' || type === 'PAYMENT_REJECTED') {
        await processPaymentDeclined(data, notification)
      } else if (type === 'SALE_PENDING' || type === 'PAYMENT_PENDING') {
        await processPaymentPending(data, notification)
      } else {
        console.log(`⚠️ Unhandled webhook type: ${type}`)
      }
    }

    return new Response(
      JSON.stringify({ received: true, processed: payload.notifications.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function processPaymentApproved(data: any, notification: any) {
  console.log('✅ Processing approved payment:', data)
  
  // Extraer referencia (orderId) del metadata o subject
  const reference = data.metadata?.reference || notification.subject
  
  if (!reference) {
    console.error('❌ No reference found in webhook data')
    return
  }

  console.log('🔍 Looking for payment with reference:', reference)

  try {
    // Buscar el pago pendiente
    const { data: pendingPayment } = await supabaseAdmin
      .from('pending_payments')
      .select('*')
      .eq('order_id', reference)
      .maybeSingle()

    if (!pendingPayment) {
      console.error('❌ No pending payment found for reference:', reference)
      // Intentar buscar en certificate_payments por orderId
      const { data: existingPayment } = await supabaseAdmin
        .from('certificate_payments')
        .select('*')
        .eq('bold_order_id', reference)
        .maybeSingle()

      if (existingPayment) {
        await processCertificatePaymentApproved(data, reference, existingPayment)
      }
      return
    }

    console.log('📋 Found pending payment:', pendingPayment)

    const { user_id, payment_type, metadata: paymentMetadata, amount } = pendingPayment

    if (payment_type === 'certificate_package') {
      // Crear registro de compra de paquete
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from('certificate_purchases')
        .insert({
          user_id: user_id,
          package_type: paymentMetadata.package_id || 'pack_10',
          package_name: paymentMetadata.package_name || `Pack de certificados`,
          certificates_purchased: paymentMetadata.certificates_count || 10,
          certificates_used: 0,
          amount_paid: amount,
          currency: 'COP',
          payment_provider: 'bold',
          payment_status: 'completed',
          transaction_id: data.payment_id || reference,
          purchased_at: new Date().toISOString(),
          metadata: {
            bold_order_id: reference,
            bold_payment_link: paymentMetadata.bold_payment_link,
            webhook_data: data
          }
        })
        .select()
        .single()

      if (purchaseError) {
        console.error('❌ Error creating certificate purchase:', purchaseError)
        return
      }

      // Crear registro de transacción
      await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: user_id,
          type: 'certificate_bundle',
          amount: amount,
          currency: 'COP',
          status: 'completed',
          metadata: {
            bold_transaction_id: data.payment_id,
            bold_order_id: reference,
            package_name: paymentMetadata.package_name,
            certificate_purchase_id: purchase?.id
          }
        })

      console.log('✅ Certificate package purchase created:', purchase?.id)

      // Eliminar pending payment
      await supabaseAdmin
        .from('pending_payments')
        .delete()
        .eq('order_id', reference)

      // Enviar email de confirmación
      const userEmail = await getUserEmail(user_id)
      if (userEmail) {
        await supabaseAdmin.functions.invoke('send-email', {
          body: {
            type: 'subscription_created',
            to: userEmail,
            data: {
              userName: userEmail.split('@')[0],
              planName: paymentMetadata.package_name || `Pack de ${paymentMetadata.certificates_count} Certificados`,
              pricePerMonth: amount,
              currency: 'COP',
              currentPeriodEnd: 'Válido sin fecha de expiración',
              dashboardUrl: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard`,
              billingUrl: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/certificates`
            }
          }
        })
        
        console.log('✅ Confirmation email sent to:', userEmail)
      }
    } else if (payment_type === 'certificate_individual') {
      // Procesar pago individual de certificado
      await processCertificatePaymentApproved(data, reference, null)
    }

  } catch (error: any) {
    console.error('❌ Error processing approved payment:', error)
  }
}

async function processCertificatePaymentApproved(data: any, reference: string, existingPayment: any) {
  console.log('✅ Processing approved certificate payment:', { reference, existingPayment })
  
  try {
    if (existingPayment) {
      // Actualizar el pago existente
      const { error: updateError } = await supabaseAdmin
        .from('certificate_payments')
        .update({
          payment_status: 'completed',
          paid_at: new Date().toISOString(),
          bold_transaction_id: data.payment_id || reference
        })
        .eq('id', existingPayment.id)
      
      if (updateError) {
        console.error('❌ Error updating certificate payment:', updateError)
        return
      }
      
      // Crear registro en transactions
      await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: existingPayment.user_id,
          type: 'certificate_payment',
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          status: 'completed',
          jewelry_item_id: existingPayment.jewelry_item_id,
          metadata: {
            bold_transaction_id: data.payment_id,
            bold_order_id: reference,
            certificate_payment_id: existingPayment.id
          }
        })
      
      console.log('✅ Certificate payment processed successfully:', existingPayment.id)
    } else {
      // Buscar en pending_payments
      const { data: pendingPayment } = await supabaseAdmin
        .from('pending_payments')
        .select('*')
        .eq('order_id', reference)
        .eq('payment_type', 'certificate_individual')
        .maybeSingle()

      if (pendingPayment) {
        // Actualizar certificate_payment si existe
        const { data: certPayment } = await supabaseAdmin
          .from('certificate_payments')
          .select('*')
          .eq('bold_order_id', reference)
          .maybeSingle()

        if (certPayment) {
          await supabaseAdmin
            .from('certificate_payments')
            .update({
              payment_status: 'completed',
              paid_at: new Date().toISOString(),
              bold_transaction_id: data.payment_id || reference
            })
            .eq('id', certPayment.id)
        }

        // Eliminar pending payment
        await supabaseAdmin
          .from('pending_payments')
          .delete()
          .eq('order_id', reference)

        console.log('✅ Certificate individual payment processed')
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error processing certificate payment:', error)
  }
}

async function processPaymentDeclined(data: any, notification: any) {
  console.log('❌ Processing declined payment:', data)
  
  const reference = data.metadata?.reference || notification.subject
  
  if (!reference) {
    console.error('❌ No reference found in webhook')
    return
  }

  try {
    // Buscar pending payment
    const { data: pendingPayment } = await supabaseAdmin
      .from('pending_payments')
      .select('*')
      .eq('order_id', reference)
      .maybeSingle()

    if (!pendingPayment) {
      console.log('⚠️ No pending payment found for declined payment:', reference)
      return
    }

    // Crear registro de transacción fallida
    await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: pendingPayment.user_id,
        type: pendingPayment.payment_type === 'certificate_package' ? 'certificate_bundle' : 'certificate_payment',
        amount: pendingPayment.amount,
        currency: pendingPayment.currency,
        status: 'failed',
        metadata: {
          bold_order_id: reference,
          bold_payment_link: pendingPayment.metadata?.bold_payment_link,
          failure_reason: 'payment_declined',
          webhook_data: data
        }
      })

    // Eliminar pending payment
    await supabaseAdmin
      .from('pending_payments')
      .delete()
      .eq('order_id', reference)

    console.log('✅ Declined payment processed:', reference)

  } catch (error: any) {
    console.error('❌ Error processing declined payment:', error)
  }
}

async function processPaymentPending(data: any, notification: any) {
  console.log('⏳ Processing pending payment:', data)
  
  const reference = data.metadata?.reference || notification.subject
  
  if (!reference) {
    console.error('❌ No reference found in webhook')
    return
  }

  try {
    // Buscar pending payment
    const { data: pendingPayment } = await supabaseAdmin
      .from('pending_payments')
      .select('*')
      .eq('order_id', reference)
      .maybeSingle()

    if (!pendingPayment) {
      console.log('⚠️ No pending payment found for pending notification:', reference)
      return
    }

    // Crear registro de transacción pendiente
    await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: pendingPayment.user_id,
        type: pendingPayment.payment_type === 'certificate_package' ? 'certificate_bundle' : 'certificate_payment',
        amount: pendingPayment.amount,
        currency: pendingPayment.currency,
        status: 'pending',
        metadata: {
          bold_order_id: reference,
          bold_payment_link: pendingPayment.metadata?.bold_payment_link,
          webhook_data: data
        }
      })

    console.log('✅ Pending payment recorded:', reference)

  } catch (error: any) {
    console.error('❌ Error processing pending payment:', error)
  }
}

// Helper function to get user email
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_id', userId)
      .single()
    
    if (error || !profile?.email) {
      console.error('Error fetching user email:', error)
      return null
    }
    
    return profile.email
  } catch (error) {
    console.error('Error in getUserEmail:', error)
    return null
  }
}

// Import Supabase admin client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)