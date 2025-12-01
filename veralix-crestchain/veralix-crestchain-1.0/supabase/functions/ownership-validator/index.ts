import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ethers } from "npm:ethers@6.13.2";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const REGISTRY_INTERFACE = [
  "function uri(uint256 id) view returns (string)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function certificates(uint256 tokenId) view returns (uint256,string,string,string,string,string,address,address,uint256,uint256,bool,bool,uint256,string)"
];

function getEnvVar(name: string, fallback?: string): string {
  const value = Deno.env.get(name) || fallback;
  if (!value) throw new Error(`Configuration missing: ${name}`);
  return value;
}

async function performOwnershipValidation(registryId: string | number, ownerAddress?: string) {
  const LEDGER_ENDPOINT = 
    Deno.env.get("LEDGER_RPC_URL") || 
    Deno.env.get("LEDGER_RPC_ENDPOINT") ||
    Deno.env.get("CRESTCHAIN_RPC_URL") || 
    Deno.env.get("BSC_TESTNET_RPC_URL") || 
    "https://rpc.crestchain.pro";
    
  const REGISTRY_ADDRESS = 
    Deno.env.get("REGISTRY_CONTRACT_ADDR") ||
    Deno.env.get("VERALIX_CONTRACT_ADDRESS") || 
    "0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB";
    
  const provider = new ethers.JsonRpcProvider(LEDGER_ENDPOINT);
  const registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_INTERFACE, provider);
  const tokenIdentifier = typeof registryId === "string" ? BigInt(registryId) : BigInt(registryId);

  const certificateData = await registryContract.certificates(tokenIdentifier);
  const currentHolder: string = certificateData?.currentOwner ?? certificateData?.[6];
  const metadataReference: string = certificateData?.metadataURI ?? certificateData?.[5];
  const tokenUri = await registryContract.uri(tokenIdentifier);

  const addressToCheck = ownerAddress ? ethers.getAddress(ownerAddress) : ethers.getAddress(currentHolder);
  const ownershipBalance = await registryContract.balanceOf(addressToCheck, tokenIdentifier);

  return {
    tokenId: tokenIdentifier.toString(),
    contractAddress: REGISTRY_ADDRESS,
    owner: ethers.getAddress(currentHolder),
    checkedOwner: addressToCheck,
    balance: ownershipBalance.toString(),
    isOwnerHolding: ownershipBalance > 0n,
    tokenURI: tokenUri || metadataReference || null
  };
}

function successResponse(data: unknown, status = 200) {
  return new Response(
    JSON.stringify({ success: true, data }), 
    { status, headers: { "Content-Type": "application/json" } }
  );
}

function failureResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }), 
    { status, headers: { "Content-Type": "application/json" } }
  );
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return failureResponse("POST method required");
  }

  let requestBody: any;
  try {
    requestBody = await req.json();
  } catch (_) {
    return failureResponse("Invalid request format");
  }

  const { tokenId, ownerAddress, update } = requestBody || {};
  if (!tokenId) {
    return failureResponse("tokenId parameter required");
  }

  try {
    const validationResult = await performOwnershipValidation(tokenId, ownerAddress);

    if (update) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const provider = new ethers.JsonRpcProvider(
        Deno.env.get("LEDGER_RPC_URL") || 
        Deno.env.get("CRESTCHAIN_RPC_URL") || 
        Deno.env.get("BSC_TESTNET_RPC_URL") || 
        "https://rpc.crestchain.pro"
      );
      const currentBlock = await provider.getBlockNumber();

      const explorerUrl = validationResult.isOwnerHolding
        ? `https://scan.crestchain.pro/address/${validationResult.contractAddress}`
        : null;

      const { error: updateError } = await supabaseAdmin
        .from('nft_certificates')
        .update({
          is_verified: validationResult.isOwnerHolding,
          block_number: currentBlock?.toString() || null,
          blockchain_verification_url: explorerUrl
        })
        .eq('token_id', validationResult.tokenId)
        .eq('contract_address', validationResult.contractAddress);

      if (updateError) {
        console.error('Database update error:', updateError);
      }
    }

    return successResponse(validationResult);
  } catch (e) {
    return failureResponse(
      e instanceof Error ? e.message : String(e), 
      500
    );
  }
}

Deno.serve(handler);
