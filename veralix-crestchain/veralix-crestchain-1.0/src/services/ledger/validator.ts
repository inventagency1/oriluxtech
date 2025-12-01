/**
 * Ownership Validator Service
 * Validates asset ownership in the distributed ledger
 */

import { ledgerAdapter } from "./adapter";
import type {
  OwnershipValidationRequest,
  OwnershipValidationResult,
} from "./models";

/**
 * Validate ownership of an asset
 * @param registryId - Registry token ID
 * @param ownerAddress - Optional owner address to validate
 * @param updateRecord - Whether to update the database record
 */
export async function validateOwnership(
  registryId: string | number,
  ownerAddress?: string,
  updateRecord: boolean = false
): Promise<{ success: boolean; data?: OwnershipValidationResult; error?: string }> {
  const request: OwnershipValidationRequest = {
    registryId: String(registryId),
    ownerAddress,
    updateRecord,
  };

  return await ledgerAdapter.validateOwnership(request);
}

/**
 * Check if an address owns a specific asset
 * @param registryId - Registry token ID
 * @param ownerAddress - Address to check
 */
export async function isOwner(
  registryId: string | number,
  ownerAddress: string
): Promise<boolean> {
  const result = await validateOwnership(registryId, ownerAddress, false);
  return result.success && result.data?.isValidOwner === true;
}

/**
 * Get current owner of an asset
 * @param registryId - Registry token ID
 */
export async function getCurrentOwner(
  registryId: string | number
): Promise<string | null> {
  const result = await validateOwnership(registryId, undefined, false);
  return result.success ? result.data?.owner ?? null : null;
}

/**
 * Validate and update ownership record in database
 * @param registryId - Registry token ID
 */
export async function validateAndUpdate(
  registryId: string | number
): Promise<{ success: boolean; isValid: boolean; error?: string }> {
  const result = await validateOwnership(registryId, undefined, true);
  
  if (!result.success) {
    return {
      success: false,
      isValid: false,
      error: result.error,
    };
  }

  return {
    success: true,
    isValid: result.data?.isValidOwner ?? false,
  };
}
