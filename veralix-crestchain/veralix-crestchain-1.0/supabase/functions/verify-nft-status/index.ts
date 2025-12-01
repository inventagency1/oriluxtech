import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ethers } from "npm:ethers@6.13.2";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ABI = [
  "function uri(uint256 id) view returns (string)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function certificates(uint256 tokenId) view returns (uint256,string,string,string,string,string,address,address,uint256,uint256,bool,bool,uint256,string)"
];

function env(name: string, fallback?: string): string {
  const v = Deno.env.get(name) || fallback;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function readStatus(tokenId: string | number, ownerAddress?: string) {
  const RPC_URL = Deno.env.get("LEDGER_RPC_URL") || Deno.env.get("CRESTCHAIN_RPC_URL") || Deno.env.get("BSC_TESTNET_RPC_URL") || "https://rpc.crestchain.pro";
  const CONTRACT_ADDRESS = Deno.env.get("VERALIX_CONTRACT_ADDRESS") || "0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB";
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  const id = typeof tokenId === "string" ? BigInt(tokenId) : BigInt(tokenId);

  const cert = await contract.certificates(id);
  const currentOwner: string = cert?.currentOwner ?? cert?.[6];
  const metadataURI: string = cert?.metadataURI ?? cert?.[5];
  const uri = await contract.uri(id);

  const targetOwner = ownerAddress ? ethers.getAddress(ownerAddress) : ethers.getAddress(currentOwner);
  const bal = await contract.balanceOf(targetOwner, id);

  return {
    tokenId: id.toString(),
    contractAddress: CONTRACT_ADDRESS,
    owner: ethers.getAddress(currentOwner),
    checkedOwner: targetOwner,
    balance: bal.toString(),
    isOwnerHolding: bal > 0n,
    tokenURI: uri || metadataURI || null
  };
}

function ok(data: unknown, status = 200) {
  return new Response(JSON.stringify({ success: true, data }), { status, headers: { "Content-Type": "application/json" } });
}

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), { status, headers: { "Content-Type": "application/json" } });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return bad("Use POST");
  let body: any;
  try { body = await req.json(); } catch (_) { return bad("Invalid JSON"); }
  const { tokenId, ownerAddress, update } = body || {};
  if (!tokenId) return bad("tokenId required");
  try {
    const data = await readStatus(tokenId, ownerAddress);

    if (update) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const provider = new ethers.JsonRpcProvider(
        Deno.env.get("LEDGER_RPC_URL") || Deno.env.get("CRESTCHAIN_RPC_URL") || Deno.env.get("BSC_TESTNET_RPC_URL") || "https://rpc.crestchain.pro"
      );
      const latestBlock = await provider.getBlockNumber();

      const verificationUrl = data.isOwnerHolding
        ? `https://scan.crestchain.pro/address/${data.contractAddress}`
        : null;

      const { error: updateError } = await supabaseAdmin
        .from('nft_certificates')
        .update({
          is_verified: data.isOwnerHolding,
          block_number: latestBlock?.toString() || null,
          blockchain_verification_url: verificationUrl
        })
        .eq('token_id', data.tokenId)
        .eq('contract_address', data.contractAddress);

      if (updateError) {
        console.error('update error', updateError);
      }
    }

    return ok(data);
  } catch (e) {
    return bad(e instanceof Error ? e.message : String(e), 500);
  }
}

Deno.serve(handler);