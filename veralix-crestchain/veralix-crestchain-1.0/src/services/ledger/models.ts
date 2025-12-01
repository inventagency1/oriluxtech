/**
 * Ledger Core Models
 * Distributed asset registry type definitions
 */

export interface AssetRegistrationRequest {
  assetId: string;
  itemReference: string;
  ownerId: string;
  recipientAddress?: string;
}

export interface BatchAssetRegistration {
  assetIds: string[];
  ownerId: string;
  recipientAddress?: string;
}

export interface AssetRegistrationResult {
  assetId: string;
  success: boolean;
  txReference?: string;
  registryId?: string | number;
  error?: string;
}

export interface BatchRegistrationResult {
  total: number;
  successful: number;
  failed: number;
  results: AssetRegistrationResult[];
}

export interface OwnershipValidationRequest {
  registryId: string | number;
  ownerAddress?: string;
  updateRecord?: boolean;
}

export interface OwnershipValidationResult {
  registryId: string;
  contractReference: string;
  owner: string;
  validatedOwner: string;
  balance: string;
  isValidOwner: boolean;
  metadataUri?: string | null;
}

export interface ChainEventPayload {
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

export type LedgerType = 'distributed' | 'centralized' | 'hybrid';
export type AssetStatus = 'pending' | 'registered' | 'verified' | 'transferred';
