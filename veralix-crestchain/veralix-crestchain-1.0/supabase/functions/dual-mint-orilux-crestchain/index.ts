import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ethers } from 'https://esm.sh/ethers@6.7.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuración
const ORILUX_API = Deno.env.get('ORILUXCHAIN_API_URL') || Deno.env.get('ORILUX_API') || 'http://127.0.0.1:5000'
const CRESTCHAIN_RPC_URL = Deno.env.get('CRESTCHAIN_RPC_URL') || 'https://rpc.crestchain.pro'
const VERALIX_CONTRACT_ADDRESS = Deno.env.get('VERALIX_CONTRACT_ADDRESS') || '0xddF276c0Ab894fa7D085Ac3441471A431610A0E4'
const SYSTEM_PRIVATE_KEY = Deno.env.get('SYSTEM_PRIVATE_KEY')

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { certificateId, jewelryItemId, userId, ownerAddress } = await req.json()

    console.log('🔄 Iniciando Dual Mint:', { certificateId, userId })

    // 1. Verificar que el certificado existe en Oriluxchain
    const oriluxResponse = await fetch(`${ORILUX_API}/api/jewelry/verify/${certificateId}`)
    const oriluxData = await oriluxResponse.json()

    if (!oriluxData.verified) {
      throw new Error('Certificate not found in Oriluxchain')
    }

    console.log('✅ Certificado verificado en Oriluxchain')

    // 2. Mint en Crestchain
    console.log('🔗 Minting en Crestchain...')

    const provider = new ethers.JsonRpcProvider(CRESTCHAIN_RPC_URL)
    const wallet = new ethers.Wallet(SYSTEM_PRIVATE_KEY, provider)

    // ABI simplificado del contrato Veralix
    const contractABI = [
      "function createCertificate(address to, string memory certificateId, string memory metadataURI) external returns (uint256)",
      "function ownerOf(uint256 tokenId) external view returns (address)"
    ]

    const contract = new ethers.Contract(VERALIX_CONTRACT_ADDRESS, contractABI, wallet)

    // Metadata URI (usar la misma que se generó en Oriluxchain)
    const metadataURI = `ipfs://metadata/${certificateId}`

    // Mint transaction
    const tx = await contract.createCertificate(
      ownerAddress || wallet.address,
      certificateId,
      metadataURI
    )

    console.log('⏳ Esperando confirmación de Crestchain...')
    const receipt = await tx.wait()

    console.log('✅ NFT minteado en Crestchain:', {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      tokenId: receipt.logs[0]?.topics[3] // Extraer tokenId del evento
    })

    // 3. Actualizar registro en Supabase con datos de Crestchain
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar el registro existente
    const { data: existingCert } = await supabaseAdmin
      .from('nft_certificates')
      .select('*')
      .eq('certificate_id', certificateId)
      .single()

    if (existingCert) {
      // Actualizar con datos de Crestchain
      await supabaseAdmin
        .from('nft_certificates')
        .update({
          // Datos de Crestchain
          crestchain_tx_hash: receipt.hash,
          crestchain_token_id: receipt.logs[0]?.topics[3],
          crestchain_contract_address: VERALIX_CONTRACT_ADDRESS,
          crestchain_block_number: receipt.blockNumber,
          crestchain_network: 'CRESTCHAIN',
          crestchain_verification_url: `https://scan.crestchain.pro/tx/${receipt.hash}`,

          // Dual verification completada
          dual_verification: true,
          verification_date: new Date().toISOString()
        })
        .eq('id', existingCert.id)

      console.log('✅ Registro actualizado con datos de Crestchain')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dual mint completed successfully',
        oriluxchain: {
          verified: true,
          verificationUrl: oriluxData.verification_url
        },
        crestchain: {
          txHash: receipt.hash,
          tokenId: receipt.logs[0]?.topics[3],
          contractAddress: VERALIX_CONTRACT_ADDRESS,
          blockNumber: receipt.blockNumber,
          verificationUrl: `https://scan.crestchain.pro/tx/${receipt.hash}`
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('❌ Error en dual mint:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
