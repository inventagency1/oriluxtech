import { supabase } from "@/integrations/supabase/client";

export type GenerateCertificateInput = {
  jewelryItemId: string;
  userId: string;
};

export type GenerateCertificateResult = {
  certificateId?: string;
  tokenId?: string;
  transactionHash?: string;
  verificationUrl?: string;
  metadataUri?: string;
  error?: string;
};

export async function generateCertificate(input: GenerateCertificateInput): Promise<GenerateCertificateResult> {
  const { data, error } = await supabase.functions.invoke("generate-nft-certificate", {
    body: input,
  });

  if (error) {
    return { error: (error as any)?.message ?? "invoke_error" };
  }

  const result = data as any;
  return {
    certificateId: result?.certificateId,
    tokenId: result?.blockchain?.token_id ?? result?.tokenId,
    transactionHash: result?.blockchain?.hash ?? result?.transactionHash,
    verificationUrl: result?.verification_url ?? result?.verificationUrl,
    metadataUri: result?.metadata_uri ?? result?.metadataUri,
  };
}