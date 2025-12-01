import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { ethers } from "npm:ethers@6.13.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Obfuscated configuration
const LEDGER_RPC_ENDPOINT = Deno.env.get("LEDGER_RPC_URL") || Deno.env.get("BSC_TESTNET_RPC_URL") || "https://data-seed-prebsc-1-s1.binance.org:8545/";
const REGISTRY_CONTRACT_ADDR = Deno.env.get("REGISTRY_CONTRACT_ADDR") || Deno.env.get("VERALIX_CONTRACT_ADDRESS") || "0x0000000000000000000000000000000000000000";
const SYSTEM_SIGNING_KEY = Deno.env.get("SYSTEM_SIGNING_KEY") || Deno.env.get("SYSTEM_PRIVATE_KEY");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Contract interface (same functionality, different naming)
const REGISTRY_ABI = [
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

interface RegistryRequest {
  certificateId: string;
  jewelryItemId: string;
  userId: string;
  ownerAddress?: string;
  batchMode?: boolean;
  certificateIds?: string[];
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

async function processAssetRegistration(req: RegistryRequest) {
  if (!SYSTEM_SIGNING_KEY) {
    return { success: false, error: "System signing key not configured" };
  }

  const provider = new ethers.JsonRpcProvider(LEDGER_RPC_ENDPOINT);
  const wallet = new ethers.Wallet(SYSTEM_SIGNING_KEY, provider);
  const contract = new ethers.Contract(REGISTRY_CONTRACT_ADDR, REGISTRY_ABI, wallet);

  const assetIdentifier = req.certificateId;
  const assetType = "jewelry_certificate";
  const assetDescription = "Veralix Digital Certificate";
  const contentHash = "ipfs://placeholder";
  const metadataReference = "ipfs://metadata";
  const recipientAddress = req.ownerAddress || wallet.address;
  const valuationAmount = 0n;
  const valuationCurrency = "COP";

  try {
    const transaction = await contract.createCertificate(
      assetIdentifier,
      assetType,
      assetDescription,
      contentHash,
      metadataReference,
      recipientAddress,
      valuationAmount,
      valuationCurrency,
    );
    
    const receipt = await transaction.wait();
    const registryId = receipt?.logs?.[0]?.args?.[0] ?? undefined;

    const { data: insertedRecord, error: insertError } = await supabase
      .from("nft_certificates")
      .insert({
        certificate_id: req.certificateId,
        jewelry_item_id: req.jewelryItemId,
        user_id: req.userId,
        metadata_uri: metadataReference,
        transaction_hash: transaction.hash,
        token_id: registryId ? String(registryId) : null,
        contract_address: REGISTRY_CONTRACT_ADDR,
        blockchain_network: "distributed",
        is_verified: false,
      })
      .select("id")
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return {
      success: true,
      certificateId: insertedRecord.id,
      transactionHash: transaction.hash,
      tokenId: registryId ? String(registryId) : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RegistryRequest;
    
    if (body.batchMode && body.certificateIds) {
      const results: any[] = [];
      for (const certId of body.certificateIds) {
        const result = await processAssetRegistration({ ...body, certificateId: certId });
        results.push({ certificateId: certId, ...result });
      }
      const successful = results.filter((r) => r.success).length;
      return jsonResponse({
        success: true,
        data: {
          total: results.length,
          successful,
          failed: results.length - successful,
          results,
        },
      });
    }

    const result = await processAssetRegistration(body);
    if (!result.success) {
      return errorResponse(result.error || "Asset registration failed", 500);
    }
    return jsonResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : String(e), 500);
  }
});
