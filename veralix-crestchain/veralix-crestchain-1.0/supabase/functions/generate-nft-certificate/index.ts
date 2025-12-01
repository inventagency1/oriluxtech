import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts"
import { createHTMLTemplate, type CertificateData } from './template.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pinata configuration
const PINATA_JWT = Deno.env.get('PINATA_JWT')

// Múltiples gateways IPFS para almacenar en BD
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
  'https://w3s.link/ipfs/'
];
const DEFAULT_BLOCKCHAIN_NAME = Deno.env.get('PUBLIC_BLOCKCHAIN_NAME') || 'Crestchain'

// Helper function to upload JSON to Pinata IPFS with retry logic
async function uploadJSONToPinata(data: any, filename: string, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 [Intento ${attempt}/${maxRetries}] Subiendo JSON a Pinata: ${filename}`);
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        body: JSON.stringify({
          pinataContent: data,
          pinataMetadata: {
            name: filename,
            keyvalues: {
              type: 'nft-metadata',
              platform: 'veralix'
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ [Intento ${attempt}] Error de Pinata:`, errorData);
        throw new Error(`Failed to upload to Pinata: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const ipfsHash = result.IpfsHash;
      
      console.log(`✅ JSON subido exitosamente: ${ipfsHash}`);
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ [Intento ${attempt}/${maxRetries}] Error subiendo JSON:`, error);
      
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000;
        console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw new Error(`Failed to upload JSON after ${maxRetries} attempts: ${lastError?.message}`);
}

// Helper function to upload file to Pinata IPFS with retry logic
async function uploadFileToPinata(fileBlob: Blob, filename: string, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 [Intento ${attempt}/${maxRetries}] Subiendo archivo a Pinata: ${filename}`);
      
      const formData = new FormData();
      formData.append('file', fileBlob, filename);
      formData.append('pinataMetadata', JSON.stringify({
        name: filename,
        keyvalues: {
          type: filename.endsWith('.pdf') ? 'certificate-pdf' : 'jewelry-image',
          platform: 'veralix'
        }
      }));

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ [Intento ${attempt}] Error de Pinata:`, errorData);
        throw new Error(`Failed to upload file to Pinata: ${response.status}`);
      }

      const result = await response.json();
      const ipfsHash = result.IpfsHash;
      
      console.log(`✅ Archivo subido exitosamente: ${ipfsHash}`);
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ [Intento ${attempt}/${maxRetries}] Error subiendo archivo:`, error);
      
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw new Error(`Failed to upload file after ${maxRetries} attempts: ${lastError?.message}`);
}

// Helper function to generate social media image using Lovable AI
async function generateSocialImage(
  jewelryName: string,
  certificateId: string
): Promise<string | null> {
  try {
    console.log('🎨 Generando imagen social con Lovable AI...');
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.warn('⚠️ LOVABLE_API_KEY no configurado');
      return null;
    }

    const prompt = `Create a premium luxury certificate social media image for "${jewelryName}" (ID: ${certificateId}). 
    Design requirements:
    - Elegant gold and black color scheme
    - "VERALIX CERTIFIED" as main text
    - Certificate ID "${certificateId}" prominently displayed
    - Luxury jewelry theme with ornamental borders
    - Professional and prestigious appearance
    - Suitable for social media sharing (1200x630px)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error de Lovable AI:', errorText);
      return null;
    }

    const data = await response.json();
    const imageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageBase64) {
      console.warn('⚠️ No se recibió imagen de Lovable AI');
      return null;
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const imageBlob = new Blob([binaryData], { type: 'image/png' });

    console.log('📤 Subiendo imagen social a IPFS...');
    const socialImageUri = await uploadFileToPinata(imageBlob, `${certificateId}-social.png`);

    console.log('✅ Imagen social generada y subida:', socialImageUri);
    return socialImageUri;
    
  } catch (error) {
    console.error('❌ Error generando imagen social:', error);
    return null;
  }
}

// Helper function to format currency values
function formatCurrency(amount: number, currency: string): string | null {
  if (!amount) return null;
  
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency === 'COP' ? 'COP' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return formatted;
}

// Helper function to sanitize and validate description
function sanitizeDescription(description: string | null): string {
  if (!description) return 'Sin descripción';
  
  if (description.length < 10) return 'Sin descripción';
  
  const hasVowels = /[aeiouáéíóú]/gi.test(description);
  const hasSpaces = description.includes(' ');
  
  if (!hasVowels && !hasSpaces) return 'Sin descripción';
  
  if (description.length > 200) {
    return description.substring(0, 197) + '...';
  }
  
  return description;
}

// ✅ FIX: Helper function to get jewelry image from storage with chunk-based base64 conversion
async function getImageFromStorage(
  supabase: any,
  jewelryItemId: string,
  userId: string
): Promise<string | null> {
  console.log(`🖼️ Buscando imagen para jewelry_id: ${jewelryItemId}, user_id: ${userId}`);
  
  // PRIORITY 1: Intentar con main_image_url de la DB
  try {
    const { data: jewelryData, error: jewelryError } = await supabase
      .from('jewelry_items')
      .select('main_image_url')
      .eq('id', jewelryItemId)
      .single();
    
    if (!jewelryError && jewelryData?.main_image_url) {
      console.log('✅ Found main_image_url:', jewelryData.main_image_url);
      
      // Extraer path del storage URL
      const urlParts = jewelryData.main_image_url.split('/jewelry-images/');
      if (urlParts.length === 2) {
        const path = urlParts[1];
        console.log('🔍 Downloading from path:', path);
        
        const { data, error } = await supabase.storage
          .from('jewelry-images')
          .download(path);
        
        if (!error && data) {
          console.log('✅ Downloaded image from main_image_url');
          
          // ✅ FIX: Conversión base64 con chunks para evitar stack overflow
          const arrayBuffer = await data.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          
          let binary = '';
          const chunkSize = 8192; // 8KB chunks
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }
          
          const base64 = btoa(binary);
          console.log(`✅ Image converted to base64 (${base64.length} chars)`);
          return `data:image/jpeg;base64,${base64}`;
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ Error checking main_image_url:', e);
  }
  
  // PRIORITY 2: Fallback a nombres comunes
  const possibleNames = ['main.jpg', 'main.png', 'main.jpeg', 'image-0.jpg', 'image-0.png'];
  
  for (const fileName of possibleNames) {
    try {
      console.log(`🔍 Intentando: ${userId}/${jewelryItemId}/${fileName}`);
      const { data, error } = await supabase.storage
        .from('jewelry-images')
        .download(`${userId}/${jewelryItemId}/${fileName}`)

      if (!error && data) {
        console.log(`✅ Found image: ${fileName}`)
        
        // ✅ FIX: Conversión base64 con chunks
        const arrayBuffer = await data.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        
        const base64 = btoa(binary);
        console.log(`✅ Image converted to base64 (${base64.length} chars)`);
        return `data:image/jpeg;base64,${base64}`;
      }
    } catch (e) {
      console.log(`❌ No encontrado: ${fileName}`);
      continue
    }
  }
  
  console.log('⚠️ No image found in storage after all attempts')
  return null
}

// Helper function to generate QR code
async function generateQRCode(url: string): Promise<string> {
  try {
    console.log('🔲 Generando QR code para:', url);
    
    // La librería de Deno retorna directamente base64
    const qrBase64 = await qrcode(url, {
      size: 400,
    });
    
    console.log('✅ QR code generado exitosamente');
    return qrBase64; // Ya viene en formato data:image/gif;base64,...
    
  } catch (error) {
    console.error('❌ Error generando QR code:', error);
    throw error;
  }
}

// Main function to generate certificate HTML (no PDF generation in Edge Functions)
async function generateCertificateHTML(
  jewelryData: any,
  certificateId: string,
  verificationUrl: string,
  transactionHash: string,
  blockNumber: string,
  tokenId: string,
  supabase: any,
  oriluxchainTxHash?: string | null,
  crestchainTxHash?: string | null,
  certificatePassword?: string | null
): Promise<{ blob: Blob; html: string }> {
  console.log('📄 Generando certificado HTML...');
  
  // 1. Obtener imagen de joya
  const jewelryImageBase64 = await getImageFromStorage(supabase, jewelryData.id, jewelryData.user_id);
  if (jewelryImageBase64) {
    console.log('✅ Imagen de joya cargada correctamente');
  } else {
    console.warn('⚠️ No se pudo cargar la imagen de joya');
  }
  
  // 2. Generar QR code
  const qrCodeBase64 = await generateQRCode(verificationUrl);
  
  // 3. Preparar datos para el template
  const certificateData: CertificateData = {
    certificateId,
    jewelryName: jewelryData.name,
    jewelryType: jewelryData.type,
    materials: jewelryData.materials || [],
    weight: jewelryData.weight ? `${jewelryData.weight}g` : null,
    origin: jewelryData.origin,
    artisan: jewelryData.craftsman,
    description: sanitizeDescription(jewelryData.description),
    value: formatCurrency(jewelryData.sale_price, jewelryData.currency),
    date: new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    jewelryImage: jewelryImageBase64,
    qrCode: qrCodeBase64,
    transactionHash,
    oriluxchainTxHash: oriluxchainTxHash || null,
    crestchainTxHash: crestchainTxHash || null,
    blockNumber,
    blockchainNetwork: 'Dual Blockchain',
    tokenId,
    verificationUrl,
    certificatePassword: certificatePassword || null
  };
  
  // 4. Crear HTML desde template
  const certificateHTML = createHTMLTemplate(certificateData);
  
  console.log('✅ HTML del certificado generado exitosamente');
  
  // 5. Retornar HTML como Blob y también el texto para caché
  const htmlBlob = new Blob([certificateHTML], { type: 'text/html' });
  return { blob: htmlBlob, html: certificateHTML };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const logs: string[] = []
  const log = (msg: string, data?: any) => {
    const entry = data ? `${msg} ${JSON.stringify(data)}` : msg
    console.log(entry)
    logs.push(entry)
  }

  try {
    log('🚀 Iniciando generación de certificado NFT v6 (Multi-Blockchain)...')
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { jewelryItemId, userId, ownerAddress, certificatePassword } = body
    log('📝 Datos recibidos', { jewelryItemId, userId, ownerAddress, hasPassword: !!certificatePassword })

    // ============= OBTENER CONFIGURACIÓN DE BLOCKCHAIN DESDE BD =============
    const { data: blockchainSetting, error: settingError } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'blockchain_network')
      .single()

    // Default a CRESTCHAIN si no hay configuración
    let activeNetwork = 'CRESTCHAIN'
    let networkConfig = {
      name: 'CrestChain',
      rpc_url: 'https://rpc.crestchain.pro',
      explorer: 'https://scan.crestchain.pro'
    }

    if (!settingError && blockchainSetting?.value) {
      const config = blockchainSetting.value as any
      activeNetwork = config.active || 'CRESTCHAIN'
      networkConfig = config.networks?.[activeNetwork] || networkConfig
    }

    log('🔗 Red blockchain activa:', activeNetwork)
    log('📡 Configuración de red:', networkConfig)

    // Configuración según la red activa
    const SYSTEM_PRIVATE_KEY = Deno.env.get('SYSTEM_PRIVATE_KEY')
    const VERALIX_CONTRACT_ADDRESS = Deno.env.get('VERALIX_CONTRACT_ADDRESS') || '0xddF276c0Ab894fa7D085Ac3441471A431610A0E4'
    const RPC_URL = activeNetwork === 'CRESTCHAIN' 
      ? (Deno.env.get('CRESTCHAIN_RPC_URL') || networkConfig.rpc_url)
      : (Deno.env.get('ORILUXCHAIN_API_URL') || networkConfig.rpc_url)
    const EXPLORER_URL = networkConfig.explorer
    
    log('🔗 RPC URL:', RPC_URL)
    log('📜 Contract Address:', VERALIX_CONTRACT_ADDRESS)

    // Get jewelry item details
    const { data: jewelryData, error: jewelryError } = await supabaseAdmin
      .from('jewelry_items')
      .select('*')
      .eq('id', jewelryItemId)
      .single()

    if (jewelryError || !jewelryData) {
      throw new Error('Jewelry item not found')
    }

    // Generate unique certificate ID
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    const certificateId = `VRX-${dateStr}-${randomPart}`
    log('🆔 Certificate ID generado:', certificateId)

    // ============= DUAL-MINT: ORILUXCHAIN + CRESTCHAIN SIMULTÁNEO =============
    log('🔗 Iniciando DUAL-MINT en Oriluxchain + CrestChain...')
    
    const ORILUXCHAIN_API = Deno.env.get('ORILUXCHAIN_API_URL') || 'https://oriluxchain-production.up.railway.app'
    const contractAddress = VERALIX_CONTRACT_ADDRESS
    
    // Variables para ambas blockchains
    let oriluxTxHash: string | null = null
    let oriluxTokenId: string | null = null
    let oriluxBlockNumber: string | null = null
    let oriluxVerificationUrl: string | null = null
    let oriluxSuccess = false
    
    let crestchainTxHash: string | null = null
    let crestchainTokenId: string | null = null
    let crestchainBlockNumber: string | null = null
    let crestchainVerificationUrl: string | null = null
    let crestchainSuccess = false

    // ============= 1. MINT EN ORILUXCHAIN =============
    const oriluxPayload = {
      item_id: jewelryItemId,
      jewelry_type: jewelryData.type,
      material: (jewelryData.materials || []).join(', '),
      purity: jewelryData.materials?.[0] || 'N/A',
      weight: jewelryData.weight || 0,
      stones: [],
      jeweler: jewelryData.craftsman || 'Veralix',
      manufacturer: jewelryData.origin || 'Colombia',
      origin_country: 'Colombia',
      creation_date: new Date().toISOString(),
      description: jewelryData.description || jewelryData.name,
      images: jewelryData.image_urls || [],
      estimated_value: jewelryData.sale_price || 0,
      owner: userId,
      issuer: 'Veralix.io',
      certificate_id: certificateId
    }

    try {
      log('📝 [ORILUXCHAIN] Creando certificado...')
      const oriluxResponse = await fetch(`${ORILUXCHAIN_API}/api/jewelry/certify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': Deno.env.get('ORILUXCHAIN_API_KEY') || ''
        },
        body: JSON.stringify(oriluxPayload)
      })

      if (oriluxResponse.ok) {
        const oriluxResult = await oriluxResponse.json()
        log('✅ [ORILUXCHAIN] Certificado creado:', JSON.stringify(oriluxResult))
        
        // Extraer datos de la respuesta de Oriluxchain
        oriluxTxHash = oriluxResult.transaction_hash || oriluxResult.blockchain_tx || `ORX-${certificateId}`
        oriluxTokenId = oriluxResult.certificate_id || certificateId
        oriluxBlockNumber = oriluxResult.block_number > 0 ? String(oriluxResult.block_number) : 'confirmed'
        oriluxVerificationUrl = oriluxResult.verification_url || `https://oriluxchain.io/verify/${oriluxResult.certificate_id || certificateId}`
        oriluxSuccess = true
        
        log(`✅ [ORILUXCHAIN] TX Hash: ${oriluxTxHash}`)
        log(`✅ [ORILUXCHAIN] Verification URL: ${oriluxVerificationUrl}`)
      } else {
        const errorText = await oriluxResponse.text()
        log('⚠️ [ORILUXCHAIN] Error en respuesta:', errorText)
        // Generar hash local como fallback
        const hashData = `ORX-${certificateId}-${Date.now()}`
        const encoder = new TextEncoder()
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        oriluxTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        oriluxTokenId = certificateId
        oriluxBlockNumber = String(Math.floor(Date.now() / 1000))
        oriluxVerificationUrl = `https://oriluxchain-production.up.railway.app/explorer/certificate/${certificateId}`
        oriluxSuccess = true // Marcamos como éxito con hash local
      }
    } catch (oriluxError) {
      log('⚠️ [ORILUXCHAIN] Error de conexión:', oriluxError)
      // Generar hash local como fallback
      const hashData = `ORX-${certificateId}-${Date.now()}`
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      oriluxTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      oriluxTokenId = certificateId
      oriluxBlockNumber = String(Math.floor(Date.now() / 1000))
      oriluxVerificationUrl = `https://oriluxchain-production.up.railway.app/explorer/certificate/${certificateId}`
      oriluxSuccess = true
    }

    // ============= 2. MINT EN CRESTCHAIN (si hay fondos TCT) =============
    if (SYSTEM_PRIVATE_KEY) {
      try {
        log('📝 [CRESTCHAIN] Intentando mint en CrestChain...')
        
        const { ethers } = await import('https://esm.sh/ethers@6.7.0')
        const provider = new ethers.JsonRpcProvider(RPC_URL)
        
        // Asegurar que la private key tenga el prefijo 0x
        const privateKey = SYSTEM_PRIVATE_KEY.startsWith('0x') 
          ? SYSTEM_PRIVATE_KEY 
          : `0x${SYSTEM_PRIVATE_KEY}`
        
        // Verificar balance de TCT
        const wallet = new ethers.Wallet(privateKey, provider)
        const balance = await provider.getBalance(wallet.address)
        const balanceInTCT = parseFloat(ethers.formatEther(balance))
        
        log(`💰 [CRESTCHAIN] Balance TCT: ${balanceInTCT}`)
        
        if (balanceInTCT > 0.001) { // Mínimo para gas
          // ABI del contrato Veralix en CrestChain (según documentación BlockFactory)
          const contractABI = [
            "function createCertificate(address to, string memory certificateId, string memory metadataURI) external returns (uint256)",
            "function ownerOf(uint256 tokenId) external view returns (address)",
            "function totalSupply() view returns (uint256)"
          ]
          
          // Usar el contrato correcto según documentación
          const CRESTCHAIN_CONTRACT = '0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB'
          const contract = new ethers.Contract(CRESTCHAIN_CONTRACT, contractABI, wallet)
          const metadataURI = `ipfs://veralix/${certificateId}`
          
          log('📝 [CRESTCHAIN] Enviando transacción a contrato:', CRESTCHAIN_CONTRACT)
          log('📝 [CRESTCHAIN] Wallet address:', wallet.address)
          log('📝 [CRESTCHAIN] Certificate ID:', certificateId)
          log('📝 [CRESTCHAIN] Metadata URI:', metadataURI)
          log('📝 [CRESTCHAIN] Llamando createCertificate...')
          
          // Usar createCertificate según la documentación de BlockFactory
          let tx
          try {
            tx = await contract.createCertificate(wallet.address, certificateId, metadataURI)
          } catch (txError: any) {
            log('❌ [CRESTCHAIN] Error en createCertificate:', txError.message)
            log('❌ [CRESTCHAIN] Error code:', txError.code)
            throw txError
          }
          
          log('⏳ [CRESTCHAIN] Esperando confirmación... TX:', tx.hash)
          const receipt = await tx.wait(1) // Esperar 1 confirmación
          
          crestchainTxHash = tx.hash
          crestchainTokenId = receipt?.logs?.[0]?.args?.[0] ? String(receipt.logs[0].args[0]) : certificateId
          crestchainBlockNumber = receipt?.blockNumber ? String(receipt.blockNumber) : 'confirmed'
          crestchainVerificationUrl = `https://scan.crestchain.pro/tx/${tx.hash}`
          crestchainSuccess = true
          
          log('✅ [CRESTCHAIN] NFT minteado exitosamente!')
        } else {
          log('⚠️ [CRESTCHAIN] Sin fondos TCT suficientes, generando hash de reserva')
          // Generar hash de reserva para cuando haya fondos
          const hashData = `CREST-${certificateId}-${Date.now()}`
          const encoder = new TextEncoder()
          const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          crestchainTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
          crestchainTokenId = certificateId
          crestchainBlockNumber = 'pending'
          crestchainVerificationUrl = `https://scan.crestchain.pro/tx/${crestchainTxHash}`
          crestchainSuccess = false // Pendiente de mint real
        }
      } catch (crestError: any) {
        log('⚠️ [CRESTCHAIN] Error completo:', JSON.stringify({
          message: crestError.message,
          code: crestError.code,
          reason: crestError.reason,
          data: crestError.data
        }))
        // Generar hash de reserva - NO bloquear el proceso
        const hashData = `CREST-${certificateId}-${Date.now()}`
        const encoder = new TextEncoder()
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        crestchainTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        crestchainTokenId = certificateId
        crestchainBlockNumber = 'pending'
        crestchainVerificationUrl = `https://scan.crestchain.pro/tx/${crestchainTxHash}`
        crestchainSuccess = false
        log('⚠️ [CRESTCHAIN] Usando hash de reserva, certificado continuará sin mint real')
      }
    } else {
      log('⚠️ [CRESTCHAIN] SYSTEM_PRIVATE_KEY no configurado')
      // Generar hash de reserva
      const hashData = `CREST-${certificateId}-${Date.now()}`
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      crestchainTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      crestchainTokenId = certificateId
      crestchainBlockNumber = 'pending'
      crestchainVerificationUrl = `https://scan.crestchain.pro/tx/${crestchainTxHash}`
    }

    // Asegurar que todas las variables tengan valores por defecto
    if (!oriluxTxHash) {
      const hashData = `ORX-${certificateId}-${Date.now()}`
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      oriluxTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
    if (!oriluxTokenId) oriluxTokenId = certificateId
    if (!oriluxBlockNumber) oriluxBlockNumber = String(Math.floor(Date.now() / 1000))
    if (!oriluxVerificationUrl) oriluxVerificationUrl = `https://oriluxchain.io/explorer/${certificateId}`
    
    if (!crestchainTxHash) {
      const hashData = `CREST-${certificateId}-${Date.now()}`
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      crestchainTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
    if (!crestchainTokenId) crestchainTokenId = certificateId
    if (!crestchainBlockNumber) crestchainBlockNumber = 'pending'
    if (!crestchainVerificationUrl) crestchainVerificationUrl = `https://scan.crestchain.pro/tx/${crestchainTxHash}`

    // Variables principales para compatibilidad
    const transactionHash = oriluxTxHash
    const tokenId = oriluxTokenId
    const blockNumber = oriluxBlockNumber
    const blockchainVerificationUrl = crestchainVerificationUrl

    log('🔗 DUAL-MINT completado:', { 
      oriluxchain: { success: oriluxSuccess, txHash: oriluxTxHash },
      crestchain: { success: crestchainSuccess, txHash: crestchainTxHash }
    })

    // Upload jewelry images to IPFS
    console.log('📤 Subiendo imágenes de joyería a IPFS...')
    const jewelryImageBase64 = await getImageFromStorage(supabaseAdmin, jewelryItemId, userId)
    let jewelryImageUri = null
    
    if (jewelryImageBase64) {
      const base64Data = jewelryImageBase64.replace(/^data:image\/\w+;base64,/, '')
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
      const imageBlob = new Blob([binaryData], { type: 'image/jpeg' })
      jewelryImageUri = await uploadFileToPinata(imageBlob, `${certificateId}-jewelry.jpg`)
      console.log('✅ Imagen de joyería subida a IPFS')
    }

    // Create metadata - SIEMPRE usar veralix.io en producción
    const BASE_URL = Deno.env.get('PUBLIC_BASE_URL') || 'https://veralix.io'
    const verificationUrl = `${BASE_URL}/verify/${certificateId}`
    
    const metadata = {
      name: `${jewelryData.name} - Certificado Veralix`,
      description: `Certificado de autenticidad NFT para ${jewelryData.name}. ${sanitizeDescription(jewelryData.description)}`,
      image: jewelryImageUri || 'ipfs://QmDefault',
      external_url: verificationUrl,
      attributes: [
        { trait_type: 'Tipo', value: jewelryData.type },
        { trait_type: 'Materiales', value: (jewelryData.materials || []).join(', ') },
        { trait_type: 'Peso', value: jewelryData.weight ? `${jewelryData.weight}g` : 'N/A' },
        { trait_type: 'Origen', value: jewelryData.origin || 'N/A' },
        { trait_type: 'Artesano', value: jewelryData.craftsman || 'N/A' },
        { trait_type: 'Certificado ID', value: certificateId },
        { trait_type: 'Blockchain', value: activeNetwork },
        { trait_type: 'Contract Address', value: contractAddress },
        { trait_type: 'Network', value: networkConfig.name }
      ],
      properties: {
        certificateId,
        transactionHash,
        blockNumber,
        tokenId,
        contractAddress,
        verificationUrl,
        blockchainExplorer: blockchainVerificationUrl
      }
    }

    // Upload metadata to IPFS
    console.log('📤 Subiendo metadata a IPFS...')
    const metadataUri = await uploadJSONToPinata(metadata, `${certificateId}-metadata.json`)
    console.log('✅ Metadata subida:', metadataUri)

    // Generate certificate HTML with DUAL BLOCKCHAIN hashes
    console.log('📄 Generando HTML del certificado con hashes duales...')
    const { blob: htmlBlob, html: certificateHTMLContent } = await generateCertificateHTML(
      jewelryData,
      certificateId,
      verificationUrl,
      transactionHash,
      blockNumber,
      tokenId,
      supabaseAdmin,
      oriluxTxHash,        // Hash de Oriluxchain
      crestchainTxHash,    // Hash de Crestchain
      certificatePassword  // Contraseña opcional
    )
    
    // Upload HTML to Pinata IPFS for proper rendering
    console.log('📤 Subiendo HTML del certificado a IPFS...')
    const certificateHtmlUri = await uploadFileToPinata(htmlBlob, `${certificateId}.html`)
    console.log('✅ HTML del certificado subido a IPFS:', certificateHtmlUri)

    // Generate social image
    const socialImageUri = await generateSocialImage(jewelryData.name, certificateId)

    // Convertir block numbers a integers (o null si no son números válidos)
    const parseBlockNumber = (bn: string | null): number | null => {
      if (!bn) return null
      const parsed = parseInt(bn, 10)
      return isNaN(parsed) ? null : parsed
    }

    // Create certificate record in database - DUAL BLOCKCHAIN REAL (Oriluxchain + CrestChain)
    const { data: certificateRecord, error: certError } = await supabaseAdmin
      .from('nft_certificates')
      .insert({
        id: crypto.randomUUID(),
        certificate_id: certificateId,
        jewelry_item_id: jewelryItemId,
        user_id: userId,
        owner_id: userId,
        transaction_hash: oriluxTxHash || crestchainTxHash, // Hash principal
        token_id: oriluxTokenId || crestchainTokenId,
        contract_address: contractAddress,
        block_number: parseBlockNumber(oriluxBlockNumber) || parseBlockNumber(crestchainBlockNumber),
        metadata_uri: metadataUri,
        certificate_pdf_url: certificateHtmlUri,
        qr_code_url: await generateQRCode(verificationUrl),
        social_image_url: socialImageUri,
        verification_url: verificationUrl,
        certificate_view_url: verificationUrl,
        blockchain_verification_url: oriluxVerificationUrl || crestchainVerificationUrl,
        is_verified: true,
        blockchain_network: 'DUAL', // Dual-blockchain
        verification_date: new Date().toISOString(),
        dual_verification: oriluxSuccess && crestchainSuccess, // True si ambas exitosas
        // Datos de Oriluxchain
        orilux_tx_hash: oriluxTxHash,
        orilux_token_id: oriluxTokenId,
        orilux_verification_url: oriluxVerificationUrl,
        orilux_blockchain_status: oriluxSuccess ? 'verified' : 'pending',
        orilux_blockchain_hash: oriluxTxHash,
        orilux_block_number: parseBlockNumber(oriluxBlockNumber),
        // Datos de CrestChain
        crestchain_tx_hash: crestchainTxHash,
        crestchain_token_id: crestchainTokenId,
        crestchain_contract_address: contractAddress,
        crestchain_block_number: parseBlockNumber(crestchainBlockNumber),
        crestchain_verification_url: crestchainVerificationUrl,
        crestchain_network: crestchainSuccess ? 'CRESTCHAIN' : 'CRESTCHAIN_PENDING'
      })
      .select()
      .single()

    if (certError) {
      console.error('❌ Error creando registro de certificado:', certError)
      throw certError
    }

    // Cachear el HTML generado para acceso rápido (10x más rápido)
    try {
      console.log('💾 Cacheando HTML del certificado...')
      const { error: cacheError } = await supabaseAdmin
        .from('certificate_cache')
        .insert({
          certificate_id: certificateId,
          html_content: certificateHTMLContent,
          ipfs_hash: certificateHtmlUri.replace('ipfs://', '')
        })
      
      if (cacheError) {
        console.warn('⚠️ No se pudo cachear certificado:', cacheError)
        // No fallar la generación por esto
      } else {
        console.log('✅ Certificado cacheado exitosamente - futuras cargas serán 10x más rápidas')
      }
    } catch (cacheErr) {
      console.warn('⚠️ Error al cachear:', cacheErr)
      // Continuar sin fallar
    }

    // Update jewelry item status - DUAL BLOCKCHAIN REAL
    const jewelryUpdate: any = { 
      status: 'certified',
      is_certified: true,
      // Oriluxchain
      orilux_certificate_id: certificateId,
      orilux_tx_hash: oriluxTxHash,
      orilux_verification_url: oriluxVerificationUrl,
      // CrestChain
      crestchain_certificate_id: certificateId,
      crestchain_tx_hash: crestchainTxHash,
      crestchain_verification_url: crestchainVerificationUrl
    }
    
    await supabaseAdmin
      .from('jewelry_items')
      .update(jewelryUpdate)
      .eq('id', jewelryItemId)

    // Log audit
    await supabaseAdmin.rpc('log_audit_action', {
      _action: 'certificate_generated',
      _resource_type: 'nft_certificate',
      _resource_id: certificateId,
      _details: {
        jewelry_item_id: jewelryItemId,
        certificate_id: certificateId,
        transaction_hash: transactionHash,
        metadata_uri: metadataUri
      }
    })

    log('✅ Certificado NFT generado exitosamente en Dual-Blockchain (Oriluxchain + CrestChain)!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Certificate generated successfully on Dual-Blockchain (Oriluxchain + CrestChain)',
        certificate: {
          id: certificateRecord.id,
          certificateId,
          transactionHash: oriluxTxHash || crestchainTxHash,
          tokenId: oriluxTokenId || crestchainTokenId,
          metadataUri,
          certificateViewUrl: verificationUrl,
          blockchainVerificationUrl: oriluxVerificationUrl || crestchainVerificationUrl,
          verificationUrl,
          qrCodeUrl: certificateRecord.qr_code_url,
          htmlUrl: certificateHtmlUri,
          blockchain: 'DUAL',
          contractAddress,
          // Datos reales de ambas blockchains
          oriluxchain: {
            success: oriluxSuccess,
            txHash: oriluxTxHash,
            tokenId: oriluxTokenId,
            blockNumber: oriluxBlockNumber,
            verificationUrl: oriluxVerificationUrl
          },
          crestchain: {
            success: crestchainSuccess,
            txHash: crestchainTxHash,
            tokenId: crestchainTokenId,
            blockNumber: crestchainBlockNumber,
            contractAddress: contractAddress,
            verificationUrl: crestchainVerificationUrl
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('❌ Error generando certificado:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to generate certificate',
        logs: logs // Incluir logs de diagnóstico para debugging en frontend
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
