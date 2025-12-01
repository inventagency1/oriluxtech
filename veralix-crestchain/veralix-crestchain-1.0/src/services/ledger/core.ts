/**
 * Ledger Core Service
 * Main entry point for distributed ledger operations
 * Provides unified interface for asset management
 */

import { supabase } from "@/integrations/supabase/client";

export interface CertificateGenerationInput {
  itemId: string;
  userId: string;
}

export interface CertificateGenerationResult {
  certificateId?: string;
  registryId?: string;
  txReference?: string;
  verificationUrl?: string;
  metadataUri?: string;
  error?: string;
}

/**
 * Generate a certificate with distributed ledger registration
 * This is the main function that replaces the old generateCertificate
 */
export async function generateCertificate(
  input: CertificateGenerationInput
): Promise<CertificateGenerationResult> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-nft-certificate", {
      body: {
        jewelryItemId: input.itemId,
        userId: input.userId,
      },
    });

    if (error) {
      return {
        error: (error as any)?.message ?? "certificate_generation_failed",
      };
    }

    const result = data as any;
    return {
      certificateId: result?.certificate?.certificateId ?? result?.certificateId,
      registryId: result?.certificate?.tokenId ?? result?.blockchain?.token_id ?? result?.tokenId,
      txReference: result?.certificate?.transactionHash ?? result?.blockchain?.hash ?? result?.transactionHash,
      verificationUrl: result?.certificate?.verificationUrl ?? result?.verification_url ?? result?.verificationUrl,
      metadataUri: result?.certificate?.metadataUri ?? result?.metadata_uri ?? result?.metadataUri,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "unknown_generation_error",
    };
  }
}

/**
 * Get ledger configuration
 */
export function getLedgerConfig() {
  return {
    ledgerType: 'distributed' as const,
    networkName: 'Veralix Ledger',
    explorerBaseUrl: 'https://scan.crestchain.pro',
  };
}

/**
 * Build explorer URL for transaction
 */
export function buildExplorerUrl(txReference: string, type: 'tx' | 'address' = 'tx'): string {
  const config = getLedgerConfig();
  return `${config.explorerBaseUrl}/${type}/${txReference}`;
}

/**
 * Check if ledger is available
 */
export async function isLedgerAvailable(): Promise<boolean> {
  try {
    // Simple health check - could ping RPC endpoint
    return true;
  } catch {
    return false;
  }
}
