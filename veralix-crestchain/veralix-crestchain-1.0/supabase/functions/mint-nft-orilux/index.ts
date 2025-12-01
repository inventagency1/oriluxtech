import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuración
const ORILUXCHAIN_API = Deno.env.get("ORILUXCHAIN_API_URL") || "http://127.0.0.1:5001";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MintRequest {
  certificateId: string;
  jewelryItemId: string;
  userId: string;
  ownerAddress?: string;
  issuerAddress?: string;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { 
    status, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as MintRequest;
    
    console.log('🚀 Iniciando proceso de certificación NFT');
    console.log('📋 Certificate ID:', body.certificateId);
    console.log('💎 Jewelry Item ID:', body.jewelryItemId);
    
    // ========================================================================
    // PASO 1: Obtener datos de la joya desde Supabase
    // ========================================================================
    console.log('📦 Obteniendo datos de jewelry_items...');
    
    const { data: item, error: itemError } = await supabase
      .from('jewelry_items')
      .select('*')
      .eq('id', body.jewelryItemId)
      .single();
    
    if (itemError || !item) {
      console.error('❌ Error obteniendo joya:', itemError);
      return jsonResponse({
        success: false,
        error: 'Jewelry item not found'
      }, 404);
    }
    
    console.log('✅ Joya obtenida:', item.name);
    
    // ========================================================================
    // PASO 2: Preparar datos para Oriluxchain
    // ========================================================================
    console.log('🔧 Preparando datos para Oriluxchain...');
    
    const oriluxData = {
      item_id: body.jewelryItemId,
      jewelry_type: item.type || 'ring',
      material: item.material || 'gold',
      purity: item.purity || '18k',
      weight: parseFloat(item.weight) || 0,
      stones: item.stones || [],
      jeweler: item.jeweler || 'Veralix',
      manufacturer: item.manufacturer || 'Unknown',
      origin_country: item.origin_country || 'Colombia',
      creation_date: item.created_at || new Date().toISOString(),
      description: item.description || '',
      images: item.image_url ? [item.image_url] : [],
      estimated_value: parseFloat(item.price) || 0,
      owner: body.ownerAddress || 'veralix_system',
      issuer: body.issuerAddress || 'Veralix System'
    };
    
    console.log('📝 Datos preparados:', {
      item_id: oriluxData.item_id,
      jewelry_type: oriluxData.jewelry_type,
      material: oriluxData.material,
      estimated_value: oriluxData.estimated_value
    });
    
    // ========================================================================
    // PASO 3: Crear certificado en Oriluxchain
    // ========================================================================
    console.log('🔗 Conectando a Oriluxchain:', ORILUXCHAIN_API);
    console.log('📝 Creando certificado en blockchain...');
    
    const certifyResponse = await fetch(`${ORILUXCHAIN_API}/api/jewelry/certify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(oriluxData)
    });
    
    if (!certifyResponse.ok) {
      const errorText = await certifyResponse.text();
      console.error('❌ Error de Oriluxchain:', errorText);
      throw new Error(`Oriluxchain error: ${certifyResponse.status} - ${errorText}`);
    }
    
    const certifyResult = await certifyResponse.json();
    
    if (!certifyResult.success) {
      throw new Error(certifyResult.error || 'Failed to create certificate');
    }
    
    console.log('✅ Certificado creado en blockchain!');
    console.log('🆔 Certificate ID:', certifyResult.certificate_id);
    console.log('📝 TX Hash:', certifyResult.blockchain_tx);
    
    // ========================================================================
    // PASO 4: Crear NFT en Oriluxchain
    // ========================================================================
    console.log('🎨 Creando NFT...');
    
    const nftResponse = await fetch(
      `${ORILUXCHAIN_API}/api/jewelry/nft/${certifyResult.certificate_id}`,
      { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    if (!nftResponse.ok) {
      const errorText = await nftResponse.text();
      console.error('⚠️ Error creando NFT:', errorText);
      // Continuar aunque falle el NFT
    }
    
    const nftResult = await nftResponse.json();
    
    if (nftResult.success) {
      console.log('✅ NFT creado:', nftResult.nft_token_id);
    } else {
      console.log('⚠️ NFT no creado, pero certificado existe');
    }
    
    // ========================================================================
    // PASO 5: Guardar en Supabase
    // ========================================================================
    console.log('💾 Guardando en Supabase...');
    
    const { data: certificate, error: certError } = await supabase
      .from('nft_certificates')
      .insert({
        certificate_id: body.certificateId,
        jewelry_item_id: body.jewelryItemId,
        user_id: body.userId,
        orilux_certificate_id: certifyResult.certificate_id,
        transaction_hash: certifyResult.blockchain_tx,
        token_id: nftResult.nft_token_id || null,
        qr_code: certifyResult.qr_code || null,
        verification_url: certifyResult.verification_url || null,
        metadata_uri: item.metadata_uri || '',
        blockchain_network: 'ORILUXCHAIN',
        contract_address: 'oriluxchain_native',
        is_verified: true,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (certError) {
      console.error('❌ Error guardando en Supabase:', certError);
      throw new Error(`Database error: ${certError.message}`);
    }
    
    console.log('✅ Certificado guardado en Supabase:', certificate.id);
    
    // ========================================================================
    // PASO 6: Actualizar jewelry_item con los datos del certificado
    // ========================================================================
    console.log('🔄 Actualizando jewelry_item...');
    
    const { error: updateError } = await supabase
      .from('jewelry_items')
      .update({
        certificate_id: certifyResult.certificate_id,
        blockchain_tx: certifyResult.blockchain_tx,
        qr_code: certifyResult.qr_code,
        verification_url: certifyResult.verification_url,
        is_certified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.jewelryItemId);
    
    if (updateError) {
      console.error('⚠️ Error actualizando jewelry_item:', updateError);
      // No fallar por esto
    } else {
      console.log('✅ Jewelry item actualizado');
    }
    
    // ========================================================================
    // RESPUESTA FINAL
    // ========================================================================
    console.log('🎉 Proceso completado exitosamente!');
    
    return jsonResponse({
      success: true,
      data: {
        certificateId: certificate.id,
        oriluxCertificateId: certifyResult.certificate_id,
        transactionHash: certifyResult.blockchain_tx,
        tokenId: nftResult.nft_token_id || null,
        qrCode: certifyResult.qr_code,
        verificationUrl: certifyResult.verification_url,
        blockchainNetwork: 'ORILUXCHAIN',
        certificate: certifyResult.certificate
      },
      message: 'Certificado NFT creado exitosamente en Oriluxchain'
    });
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: 'Error al crear certificado NFT en Oriluxchain'
    }, 500);
  }
});
