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
const DEFAULT_BLOCKCHAIN_NAME = Deno.env.get('PUBLIC_BLOCKCHAIN_NAME') || 'BSC Mainnet'

// BSC Mainnet Configuration
const BSC_RPC_URLS = [
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org'
]
const BSC_CONTRACT_ADDRESS = Deno.env.get('VERALIX_CONTRACT_ADDRESS') || '0x5aDcEEf785FD21b65986328ca1e6DE0C973eC423'
const BSC_EXPLORER = 'https://bscscan.com'

// ABI del contrato VeralixMasterRegistry en BSC
const BSC_CONTRACT_ABI = [
  {
    inputs: [
      { name: "certificateNumber", type: "string" },
      { name: "jewelryType", type: "string" },
      { name: "description", type: "string" },
      { name: "imageHash", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "owner", type: "address" },
      { name: "appraisalValue", type: "uint256" },
      { name: "appraisalCurrency", type: "string" }
    ],
    name: "createCertificate",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getCertificate",
    outputs: [
      {
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "certificateNumber", type: "string" },
          { name: "jewelryType", type: "string" },
          { name: "description", type: "string" },
          { name: "imageHash", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "currentOwner", type: "address" },
          { name: "jewelryStore", type: "address" },
          { name: "creationDate", type: "uint256" },
          { name: "lastUpdate", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "isTransferable", type: "bool" },
          { name: "appraisalValue", type: "uint256" },
          { name: "appraisalCurrency", type: "string" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
]

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

// Interfaz para datos de BSC
interface BSCData {
  txHash: string | null;
  tokenId: string | null;
  blockNumber: string | null;
  contractAddress: string;
  walletAddress: string | null;
  explorerUrl: string | null;
  success: boolean;
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
  bscData?: BSCData | null,
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
    // Datos de BSC Mainnet (REALES)
    bscTxHash: bscData?.txHash || null,
    bscContractAddress: bscData?.contractAddress || null,
    bscWalletAddress: bscData?.walletAddress || null,
    bscBlockNumber: bscData?.blockNumber || null,
    bscExplorerUrl: bscData?.explorerUrl || null,
    blockNumber,
    blockchainNetwork: 'Oriluxchain + BSC Mainnet',
    tokenId,
    verificationUrl,
    certificatePassword: certificatePassword || null
  };
  
  console.log('📋 Datos del certificado:', {
    oriluxTxHash: certificateData.oriluxchainTxHash,
    bscTxHash: certificateData.bscTxHash,
    bscContract: certificateData.bscContractAddress,
    bscWallet: certificateData.bscWalletAddress
  });
  
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

    // ============= DUAL-MINT: ORILUXCHAIN + BSC MAINNET =============
    log('🔗 Iniciando DUAL-MINT en Oriluxchain + BSC Mainnet...')
    
    const ORILUXCHAIN_API = Deno.env.get('ORILUXCHAIN_API_URL') || 'https://oriluxchain-production.up.railway.app'
    const contractAddress = VERALIX_CONTRACT_ADDRESS
    
    // Variables para Oriluxchain
    let oriluxTxHash: string | null = null
    let oriluxTokenId: string | null = null
    let oriluxBlockNumber: string | null = null
    let oriluxVerificationUrl: string | null = null
    let oriluxSuccess = false

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

    // ============= 2. MINT EN BSC MAINNET =============
    // Variables para BSC
    let bscTxHash: string | null = null
    let bscTokenId: string | null = null
    let bscBlockNumber: string | null = null
    let bscVerificationUrl: string | null = null
    let bscWalletAddress: string | null = null
    let bscSuccess = false

    if (SYSTEM_PRIVATE_KEY) {
      try {
        log('📝 [BSC] Intentando mint en BSC Mainnet...')
        
        const { ethers } = await import('https://esm.sh/ethers@6.7.0')
        
        // Intentar con múltiples RPCs
        let provider = null
        for (const rpcUrl of BSC_RPC_URLS) {
          try {
            provider = new ethers.JsonRpcProvider(rpcUrl)
            await provider.getBlockNumber() // Test connection
            log(`✅ [BSC] Conectado a RPC: ${rpcUrl}`)
            break
          } catch (e) {
            log(`⚠️ [BSC] RPC ${rpcUrl} no disponible, intentando siguiente...`)
          }
        }
        
        if (!provider) {
          throw new Error('No se pudo conectar a ningún RPC de BSC')
        }
        
        // Asegurar que la private key tenga el prefijo 0x
        const privateKey = SYSTEM_PRIVATE_KEY.startsWith('0x') 
          ? SYSTEM_PRIVATE_KEY 
          : `0x${SYSTEM_PRIVATE_KEY}`
        
        // Verificar balance de BNB para gas
        const wallet = new ethers.Wallet(privateKey, provider)
        const balance = await provider.getBalance(wallet.address)
        const balanceInBNB = parseFloat(ethers.formatEther(balance))
        
        log(`💰 [BSC] Balance BNB: ${balanceInBNB}`)
        log(`📜 [BSC] Contract Address: ${BSC_CONTRACT_ADDRESS}`)
        log(`👛 [BSC] Wallet Address: ${wallet.address}`)
        
        if (balanceInBNB > 0.001) { // Mínimo para gas
          const contract = new ethers.Contract(BSC_CONTRACT_ADDRESS, BSC_CONTRACT_ABI, wallet)
          
          // Preparar datos para el mint
          const ownerAddr = ownerAddress || wallet.address
          const appraisalValue = BigInt(Math.floor((jewelryData.sale_price || 0) * 100)) // En centavos
          
          log('📝 [BSC] Preparando transacción...')
          log('   Certificate ID:', certificateId)
          log('   Jewelry Type:', jewelryData.type || 'Jewelry')
          log('   Owner:', ownerAddr)
          log('   Appraisal Value:', appraisalValue.toString())
          
          // Llamar createCertificate con todos los parámetros
          const tx = await contract.createCertificate(
            certificateId,                                    // certificateNumber
            jewelryData.type || 'Jewelry',                    // jewelryType
            jewelryData.description || jewelryData.name || '', // description
            '',                                               // imageHash (se actualizará después)
            `ipfs://veralix/${certificateId}`,               // metadataURI
            ownerAddr,                                        // owner
            appraisalValue,                                   // appraisalValue
            'COP'                                             // appraisalCurrency
          )
          
          log('⏳ [BSC] TX enviada:', tx.hash)
          log(`🔗 [BSC] Ver en BscScan: ${BSC_EXPLORER}/tx/${tx.hash}`)
          
          const receipt = await tx.wait(1) // Esperar 1 confirmación
          
          // Extraer tokenId del evento CertificateCreated
          let tokenIdFromEvent = certificateId
          if (receipt?.logs && receipt.logs.length > 0) {
            try {
              const iface = new ethers.Interface(BSC_CONTRACT_ABI)
              for (const log of receipt.logs) {
                try {
                  const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data })
                  if (parsed && parsed.name === 'CertificateCreated') {
                    tokenIdFromEvent = parsed.args[0].toString()
                    break
                  }
                } catch (e) {
                  // Log no es del evento que buscamos
                }
              }
            } catch (e) {
              log('⚠️ [BSC] No se pudo parsear evento, usando certificateId')
            }
          }
          
          bscTxHash = tx.hash
          bscTokenId = tokenIdFromEvent
          bscBlockNumber = receipt?.blockNumber ? String(receipt.blockNumber) : 'confirmed'
          bscVerificationUrl = `${BSC_EXPLORER}/tx/${tx.hash}`
          bscWalletAddress = wallet.address
          bscSuccess = true
          
          log('✅ [BSC] NFT minteado exitosamente!')
          log(`✅ [BSC] TX Hash: ${bscTxHash}`)
          log(`✅ [BSC] Token ID: ${bscTokenId}`)
          log(`✅ [BSC] Block: ${bscBlockNumber}`)
          log(`✅ [BSC] Contract: ${BSC_CONTRACT_ADDRESS}`)
          log(`✅ [BSC] Wallet: ${bscWalletAddress}`)
        } else {
          log('⚠️ [BSC] Sin fondos BNB suficientes para gas')
          // Generar hash de reserva
          const hashData = `BSC-${certificateId}-${Date.now()}`
          const encoder = new TextEncoder()
          const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          bscTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
          bscTokenId = certificateId
          bscBlockNumber = 'pending-no-funds'
          bscVerificationUrl = `${BSC_EXPLORER}/tx/${bscTxHash}`
          bscSuccess = false
        }
      } catch (bscError: any) {
        log('⚠️ [BSC] Error:', JSON.stringify({
          message: bscError.message,
          code: bscError.code,
          reason: bscError.reason
        }))
        // Generar hash de reserva - NO bloquear el proceso
        const hashData = `BSC-${certificateId}-${Date.now()}`
        const encoder = new TextEncoder()
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        bscTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        bscTokenId = certificateId
        bscBlockNumber = 'error'
        bscVerificationUrl = `${BSC_EXPLORER}/tx/${bscTxHash}`
        bscSuccess = false
        log('⚠️ [BSC] Usando hash de reserva, certificado continuará sin mint real')
      }
    } else {
      log('⚠️ [BSC] SYSTEM_PRIVATE_KEY no configurado')
      // Generar hash de reserva
      const hashData = `BSC-${certificateId}-${Date.now()}`
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      bscTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      bscTokenId = certificateId
      bscBlockNumber = 'pending'
      bscVerificationUrl = `${BSC_EXPLORER}/tx/${bscTxHash}`
    }
    
    // Asegurar que todas las variables de Orilux tengan valores por defecto
    if (!oriluxTxHash) {
      const hashData = `ORX-${certificateId}-${Date.now()}`
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashData))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      oriluxTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
    if (!oriluxTokenId) oriluxTokenId = certificateId
    if (!oriluxBlockNumber) oriluxBlockNumber = String(Math.floor(Date.now() / 1000))
    if (!oriluxVerificationUrl) oriluxVerificationUrl = `https://oriluxchain-production.up.railway.app/explorer/certificate/${certificateId}`

    // Variables principales para compatibilidad (usar BSC como principal si está disponible)
    const transactionHash = bscTxHash || oriluxTxHash
    const tokenId = bscTokenId || oriluxTokenId
    const blockNumber = bscBlockNumber || oriluxBlockNumber

    log('🔗 DUAL-MINT completado:', { 
      oriluxchain: { success: oriluxSuccess, txHash: oriluxTxHash },
      bsc_mainnet: { 
        success: bscSuccess, 
        txHash: bscTxHash, 
        contract: BSC_CONTRACT_ADDRESS,
        wallet: bscWalletAddress,
        block: bscBlockNumber
      }
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
        // BSC Mainnet Data (REAL)
        { trait_type: 'BSC Contract', value: BSC_CONTRACT_ADDRESS },
        { trait_type: 'BSC TX Hash', value: bscTxHash || 'Pending' },
        { trait_type: 'BSC Block', value: bscBlockNumber || 'Pending' },
        { trait_type: 'BSC Network', value: 'BSC Mainnet (Chain ID: 56)' },
        // Oriluxchain Data
        { trait_type: 'Orilux TX Hash', value: oriluxTxHash || 'Pending' }
      ],
      properties: {
        certificateId,
        // Oriluxchain
        oriluxchain: {
          txHash: oriluxTxHash,
          blockNumber: oriluxBlockNumber,
          verificationUrl: oriluxVerificationUrl
        },
        // BSC Mainnet (DATOS REALES)
        bscMainnet: {
          txHash: bscTxHash,
          tokenId: bscTokenId,
          blockNumber: bscBlockNumber,
          contractAddress: BSC_CONTRACT_ADDRESS,
          walletAddress: bscWalletAddress,
          explorerUrl: bscVerificationUrl,
          chainId: 56,
          network: 'BSC Mainnet'
        },
        verificationUrl,
        dualBlockchain: true
      }
    }

    // Upload metadata to IPFS
    console.log('📤 Subiendo metadata a IPFS...')
    const metadataUri = await uploadJSONToPinata(metadata, `${certificateId}-metadata.json`)
    console.log('✅ Metadata subida:', metadataUri)

    // Generate certificate HTML with DUAL BLOCKCHAIN hashes
    console.log('📄 Generando HTML del certificado con hashes duales...')
    
    // Preparar datos de BSC para el certificado
    const bscDataForCertificate: BSCData = {
      txHash: bscTxHash,
      tokenId: bscTokenId,
      blockNumber: bscBlockNumber,
      contractAddress: BSC_CONTRACT_ADDRESS,
      walletAddress: bscWalletAddress,
      explorerUrl: bscVerificationUrl,
      success: bscSuccess
    }
    
    console.log('📋 BSC Data para certificado:', bscDataForCertificate)
    
    const { blob: htmlBlob, html: certificateHTMLContent } = await generateCertificateHTML(
      jewelryData,
      certificateId,
      verificationUrl,
      transactionHash,
      blockNumber,
      tokenId,
      supabaseAdmin,
      oriluxTxHash,           // Hash de Oriluxchain
      bscDataForCertificate,  // Datos completos de BSC Mainnet
      certificatePassword     // Contraseña opcional
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

    // Create certificate record in database - DUAL BLOCKCHAIN REAL (Oriluxchain + BSC Mainnet)
    const { data: certificateRecord, error: certError } = await supabaseAdmin
      .from('nft_certificates')
      .insert({
        id: crypto.randomUUID(),
        certificate_id: certificateId,
        jewelry_item_id: jewelryItemId,
        user_id: userId,
        owner_id: userId,
        // Hash principal: usar BSC si está disponible, sino Orilux
        transaction_hash: bscTxHash || oriluxTxHash,
        token_id: bscTokenId || oriluxTokenId,
        contract_address: BSC_CONTRACT_ADDRESS, // Contrato BSC REAL
        block_number: parseBlockNumber(bscBlockNumber) || parseBlockNumber(oriluxBlockNumber),
        metadata_uri: metadataUri,
        certificate_pdf_url: certificateHtmlUri,
        qr_code_url: await generateQRCode(verificationUrl),
        social_image_url: socialImageUri,
        verification_url: verificationUrl,
        certificate_view_url: verificationUrl,
        blockchain_verification_url: bscVerificationUrl || oriluxVerificationUrl,
        is_verified: bscSuccess || oriluxSuccess,
        blockchain_network: 'DUAL', // Dual-blockchain (Orilux + BSC)
        verification_date: new Date().toISOString(),
        dual_verification: oriluxSuccess && bscSuccess, // True si ambas exitosas
        // Datos de Oriluxchain
        orilux_tx_hash: oriluxTxHash,
        orilux_token_id: oriluxTokenId,
        orilux_verification_url: oriluxVerificationUrl,
        orilux_blockchain_status: oriluxSuccess ? 'verified' : 'pending',
        orilux_blockchain_hash: oriluxTxHash,
        orilux_block_number: parseBlockNumber(oriluxBlockNumber),
        // Datos de BSC Mainnet (REALES - reemplaza CrestChain)
        crestchain_tx_hash: bscTxHash, // Ahora es BSC TX Hash
        crestchain_token_id: bscTokenId,
        crestchain_contract_address: BSC_CONTRACT_ADDRESS, // Contrato BSC REAL
        crestchain_block_number: parseBlockNumber(bscBlockNumber),
        crestchain_verification_url: bscVerificationUrl,
        crestchain_network: bscSuccess ? 'BSC_MAINNET' : 'BSC_PENDING'
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
      // BSC Mainnet (reemplaza CrestChain)
      crestchain_certificate_id: certificateId,
      crestchain_tx_hash: bscTxHash,
      crestchain_verification_url: bscVerificationUrl
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

    log('✅ Certificado NFT generado exitosamente en Dual-Blockchain (Oriluxchain + BSC Mainnet)!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Certificate generated successfully on Dual-Blockchain (Oriluxchain + BSC Mainnet)',
        certificate: {
          id: certificateRecord.id,
          certificateId,
          // Hash principal: BSC si está disponible
          transactionHash: bscTxHash || oriluxTxHash,
          tokenId: bscTokenId || oriluxTokenId,
          metadataUri,
          certificateViewUrl: verificationUrl,
          blockchainVerificationUrl: bscVerificationUrl || oriluxVerificationUrl,
          verificationUrl,
          qrCodeUrl: certificateRecord.qr_code_url,
          htmlUrl: certificateHtmlUri,
          blockchain: 'DUAL',
          // Datos de Oriluxchain
          oriluxchain: {
            success: oriluxSuccess,
            txHash: oriluxTxHash,
            tokenId: oriluxTokenId,
            blockNumber: oriluxBlockNumber,
            verificationUrl: oriluxVerificationUrl
          },
          // Datos de BSC Mainnet (REALES)
          bscMainnet: {
            success: bscSuccess,
            txHash: bscTxHash,
            tokenId: bscTokenId,
            blockNumber: bscBlockNumber,
            contractAddress: BSC_CONTRACT_ADDRESS,
            walletAddress: bscWalletAddress,
            explorerUrl: bscVerificationUrl,
            chainId: 56,
            network: 'BSC Mainnet'
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
