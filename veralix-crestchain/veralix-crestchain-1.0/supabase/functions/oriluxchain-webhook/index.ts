import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-blockchain',
}

interface OriluxchainWebhookPayload {
  event: 'block_mined' | 'certificate_verified';
  certificate_id: string;
  blockchain: {
    hash: string;
    status: 'verified';
    block_number: number;
    tx_hash: string;
    timestamp: number;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📥 Webhook recibido de Oriluxchain');

    const payload: OriluxchainWebhookPayload = await req.json();
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    // Validar que sea evento de verificación
    if (payload.event !== 'certificate_verified' && payload.event !== 'block_mined') {
      console.log('⚠️ Evento no relevante:', payload.event);
      return new Response(JSON.stringify({ message: 'Event not relevant' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Inicializar Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Actualizar estado del certificado a "verified"
    const { data: updatedCert, error: updateError } = await supabaseAdmin
      .from('nft_certificates')
      .update({
        orilux_blockchain_status: 'verified',
        orilux_block_number: payload.blockchain.block_number,
        orilux_tx_hash: payload.blockchain.tx_hash,
        orilux_timestamp: payload.blockchain.timestamp
      })
      .eq('certificate_id', payload.certificate_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error actualizando certificado:', updateError);
      throw updateError;
    }

    console.log('✅ Certificado actualizado a "verified":', updatedCert.certificate_id);

    // Log de auditoría
    await supabaseAdmin.rpc('log_audit_action', {
      _action: 'oriluxchain_verified',
      _resource_type: 'nft_certificate',
      _resource_id: payload.certificate_id,
      _details: {
        block_number: payload.blockchain.block_number,
        tx_hash: payload.blockchain.tx_hash,
        verified_at: new Date().toISOString()
      }
    });

    // Obtener información del certificado para notificación
    const { data: certificate } = await supabaseAdmin
      .from('nft_certificates')
      .select('user_id, jewelry_items(name)')
      .eq('certificate_id', payload.certificate_id)
      .single();

    // Enviar notificación al usuario
    if (certificate) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: certificate.user_id,
          type: 'certificate_verified',
          title: '✅ Certificado verificado en Blockchain',
          message: `Tu certificado para "${certificate.jewelry_items?.name}" ha sido verificado en Oriluxchain`,
          action_url: `/certificate/${payload.certificate_id}`,
          data: {
            certificate_id: payload.certificate_id,
            block_number: payload.blockchain.block_number
          }
        });
      
      console.log('📧 Notificación enviada al usuario');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Certificate verified successfully',
        certificate_id: payload.certificate_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('❌ Error procesando webhook:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
