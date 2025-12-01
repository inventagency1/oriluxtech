import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface WebhookPayload {
  event: string;
  certificate_id: string;
  blockchain?: {
    hash?: string;
    status?: string;
    block_number?: number;
    tx_hash?: string;
    timestamp?: number;
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const payload = (await req.json()) as WebhookPayload;
    const { certificate_id } = payload;

    const updates: any = {};
    if (payload.blockchain?.status) updates.is_verified = payload.blockchain.status === "verified";
    if (payload.blockchain?.block_number) updates.block_number = String(payload.blockchain.block_number);
    if (payload.blockchain?.tx_hash) updates.transaction_hash = payload.blockchain.tx_hash;
    if (payload.blockchain?.hash) updates.orilux_blockchain_hash = payload.blockchain.hash;

    const { error } = await supabase
      .from("nft_certificates")
      .update(updates)
      .eq("certificate_id", certificate_id);

    if (error) return jsonResponse({ success: false, error: error.message }, 500);
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});