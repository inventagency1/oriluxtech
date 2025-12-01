/**
 * Ledger Adapter
 * Handles communication with distributed ledger infrastructure
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  AssetRegistrationRequest,
  AssetRegistrationResult,
  BatchAssetRegistration,
  BatchRegistrationResult,
  OwnershipValidationRequest,
  OwnershipValidationResult,
} from "./models";

const REGISTRY_FUNCTION = "asset-registry";
const VALIDATOR_FUNCTION = "ownership-validator";

/**
 * Internal adapter for ledger operations
 * Uses abstraction layer to communicate with backend
 */
class LedgerAdapter {
  private static instance: LedgerAdapter;

  private constructor() {}

  static getInstance(): LedgerAdapter {
    if (!LedgerAdapter.instance) {
      LedgerAdapter.instance = new LedgerAdapter();
    }
    return LedgerAdapter.instance;
  }

  /**
   * Register single asset in distributed ledger
   */
  async registerAsset(
    request: AssetRegistrationRequest
  ): Promise<{ success: boolean; data?: AssetRegistrationResult; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(REGISTRY_FUNCTION, {
        body: {
          certificateId: request.assetId,
          jewelryItemId: request.itemReference,
          userId: request.ownerId,
          ownerAddress: request.recipientAddress,
        },
      });

      if (error) {
        return {
          success: false,
          error: (error as any)?.message ?? "registry_invocation_failed",
        };
      }

      return {
        success: true,
        data: {
          assetId: request.assetId,
          success: true,
          txReference: data?.transactionHash,
          registryId: data?.tokenId,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "unknown_error",
      };
    }
  }

  /**
   * Register multiple assets in batch
   */
  async registerAssetBatch(
    request: BatchAssetRegistration
  ): Promise<{ success: boolean; data?: BatchRegistrationResult; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(REGISTRY_FUNCTION, {
        body: {
          certificateIds: request.assetIds,
          userId: request.ownerId,
          ownerAddress: request.recipientAddress,
          batchMode: true,
        },
      });

      if (error) {
        return {
          success: false,
          error: (error as any)?.message ?? "batch_registry_failed",
        };
      }

      const batchResult = data?.data as any;
      return {
        success: true,
        data: {
          total: batchResult?.total ?? 0,
          successful: batchResult?.successful ?? 0,
          failed: batchResult?.failed ?? 0,
          results:
            batchResult?.results?.map((r: any) => ({
              assetId: r.certificateId,
              success: r.success,
              txReference: r.transactionHash,
              registryId: r.tokenId,
              error: r.error,
            })) ?? [],
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "batch_unknown_error",
      };
    }
  }

  /**
   * Validate asset ownership in ledger
   */
  async validateOwnership(
    request: OwnershipValidationRequest
  ): Promise<{ success: boolean; data?: OwnershipValidationResult; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(VALIDATOR_FUNCTION, {
        body: {
          tokenId: request.registryId,
          ownerAddress: request.ownerAddress,
          update: request.updateRecord ?? false,
        },
      });

      if (error) {
        return {
          success: false,
          error: (error as any)?.message ?? "validation_failed",
        };
      }

      const validationData = data?.data as any;
      return {
        success: true,
        data: {
          registryId: validationData?.tokenId ?? "",
          contractReference: validationData?.contractAddress ?? "",
          owner: validationData?.owner ?? "",
          validatedOwner: validationData?.checkedOwner ?? "",
          balance: validationData?.balance ?? "0",
          isValidOwner: validationData?.isOwnerHolding ?? false,
          metadataUri: validationData?.tokenURI,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "validation_unknown_error",
      };
    }
  }
}

export const ledgerAdapter = LedgerAdapter.getInstance();
