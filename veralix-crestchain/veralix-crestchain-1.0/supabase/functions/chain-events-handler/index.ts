import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ChainEventPayload {
  eventType: string;
  assetId: string;
  ledgerData?: {
    hash?: string;
    status?: string;
    blockHeight?: number;
    txReference?: string;
    timestamp?: number;
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(
    JSON.stringify(body), 
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as ChainEventPayload;
    const { assetId, ledgerData } = payload;

    const updateFields: any = {};
    
    if (ledgerData?.status) {
      updateFields.is_verified = ledgerData.status === "verified";
    }
    
    if (ledgerData?.blockHeight) {
      updateFields.block_number = String(ledgerData.blockHeight);
    }
    
    if (ledgerData?.txReference) {
      updateFields.transaction_hash = ledgerData.txReference;
    }
    
    if (ledgerData?.hash) {
      updateFields.orilux_blockchain_hash = ledgerData.hash;
    }

    const { error } = await supabase
      .from("nft_certificates")
      .update(updateFields)
      .eq("certificate_id", assetId);

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : String(e) }, 
      500
    );
  }
});
