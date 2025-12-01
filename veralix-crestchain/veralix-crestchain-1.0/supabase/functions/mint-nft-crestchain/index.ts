import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { ethers } from "npm:ethers@6.13.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RPC_URL = Deno.env.get("CRESTCHAIN_RPC_URL") || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = Deno.env.get("VERALIX_CONTRACT_ADDRESS") || "0x0000000000000000000000000000000000000000";
const SYSTEM_PRIVATE_KEY = Deno.env.get("SYSTEM_PRIVATE_KEY");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "certificateNumber", type: "string" },
      { internalType: "string", name: "jewelryType", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "string", name: "imageHash", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "appraisalValue", type: "uint256" },
      { internalType: "string", name: "appraisalCurrency", type: "string" },
    ],
    name: "createCertificate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

interface MintRequestBody {
  certificateId: string;
  jewelryItemId: string;
  userId: string;
  ownerAddress?: string;
  batchMode?: boolean;
  jewelryData?: {
    name: string;
    type: string;
    material: string;
    weight: number;
    price: number;
    description: string;
    imageHash: string;
    metadataURI: string;
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

async function mintSingle(req: MintRequestBody) {
  if (!SYSTEM_PRIVATE_KEY) return { success: false, error: "SYSTEM_PRIVATE_KEY missing" };
  
  console.log('🔗 Conectando a blockchain:', RPC_URL);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(SYSTEM_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  // Obtener datos reales de la joya si no vienen en el request
  let jewelryData = req.jewelryData;
  if (!jewelryData && req.jewelryItemId) {
    console.log('📦 Obteniendo datos de jewelry_items:', req.jewelryItemId);
    const { data: item, error: itemError } = await supabase
      .from('jewelry_items')
      .select('*')
      .eq('id', req.jewelryItemId)
      .single();
    
    if (itemError || !item) {
      console.error('❌ Error obteniendo joya:', itemError);
      return { success: false, error: 'Jewelry item not found' };
    }
    
    jewelryData = {
      name: item.name || 'Unknown',
      type: item.type || 'Unknown',
      material: item.material || 'Unknown',
      weight: item.weight || 0,
      price: item.price || 0,
      description: item.description || '',
      imageHash: item.image_hash || 'ipfs://placeholder',
      metadataURI: item.metadata_uri || 'ipfs://metadata'
    };
  }

  const certificateNumber = req.certificateId;
  const jewelryType = jewelryData?.type || "Unknown";
  const description = jewelryData?.description || "Veralix NFT Certificate";
  const imageHash = jewelryData?.imageHash || "ipfs://placeholder";
  const metadataURI = jewelryData?.metadataURI || "ipfs://metadata";
  const owner = req.ownerAddress || wallet.address;
  const appraisalValue = BigInt(Math.floor((jewelryData?.price || 0) * 100)); // Convertir a centavos
  const appraisalCurrency = "COP";
  
  console.log('💎 Datos del certificado:', {
    certificateNumber,
    jewelryType,
    owner,
    appraisalValue: appraisalValue.toString(),
    metadataURI
  });

  console.log('📝 Minteando NFT en blockchain...');
  const tx = await contract.createCertificate(
    certificateNumber,
    jewelryType,
    description,
    imageHash,
    metadataURI,
    owner,
    appraisalValue,
    appraisalCurrency,
  );
  
  console.log('⏳ Esperando confirmación... TX:', tx.hash);
  const receipt = await tx.wait();
  console.log('✅ Transacción confirmada!');

  const tokenId = receipt?.logs?.[0]?.args?.[0] ?? undefined;

  const { data: inserted, error: insertError } = await supabase
    .from("nft_certificates")
    .insert({
      certificate_id: req.certificateId,
      jewelry_item_id: req.jewelryItemId,
      user_id: req.userId,
      metadata_uri: metadataURI,
      transaction_hash: tx.hash,
      token_id: tokenId ? String(tokenId) : null,
      contract_address: CONTRACT_ADDRESS,
      blockchain_network: RPC_URL.includes('127.0.0.1') ? 'HARDHAT_LOCAL' : 'CRESTCHAIN',
      is_verified: false,
    })
    .select("id")
    .single();

  if (insertError) return { success: false, error: insertError.message };

  return {
    success: true,
    certificateId: inserted.id,
    transactionHash: tx.hash,
    tokenId: tokenId ? String(tokenId) : undefined,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as MintRequestBody;
    if (body.batchMode) {
      const results: { certificateId: string; success: boolean; transactionHash?: string; tokenId?: string; error?: string }[] = [];
      for (const certId of body.certificateIds || []) {
        const r = await mintSingle({ ...body, certificateId: certId });
        results.push({ certificateId: certId, ...r });
      }
      const successful = results.filter((r) => r.success).length;
      return jsonResponse({ success: true, data: { total: results.length, successful, failed: results.length - successful, results } });
    }
    const result = await mintSingle(body);
    if (!result.success) return errorResponse(result.error || "mint_failed", 500);
    return jsonResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : String(e), 500);
  }
});