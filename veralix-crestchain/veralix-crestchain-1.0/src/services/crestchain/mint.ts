import { supabase } from "@/integrations/supabase/client";
import type { MintRequest, BatchMintRequest, MintResult, BatchMintResult } from "./types";

const FN_MINT = "mint-nft-crestchain";

export async function mintSingleNFT(input: MintRequest): Promise<{ success: boolean; data?: MintResult; error?: string }>{
  const { data, error } = await supabase.functions.invoke(FN_MINT, { body: input });
  if (error) return { success: false, error: (error as any)?.message ?? "invoke_error" };
  return { success: true, data: data as MintResult };
}

export async function mintBatchNFTs(input: BatchMintRequest): Promise<{ success: boolean; data?: BatchMintResult; error?: string }>{
  const { data, error } = await supabase.functions.invoke(FN_MINT, { body: { ...input, batchMode: true } });
  if (error) return { success: false, error: (error as any)?.message ?? "invoke_error" };
  return { success: true, data: data as BatchMintResult };
}