/**
 * Ledger Service - Public API
 * Unified interface for distributed ledger operations
 */

// Core operations
export {
  generateCertificate,
  getLedgerConfig,
  buildExplorerUrl,
  isLedgerAvailable,
  type CertificateGenerationInput,
  type CertificateGenerationResult,
} from "./core";

// Asset registry
export {
  registerAsset,
  registerAssetBatch,
  isAssetRegistered,
  getAssetRegistration,
} from "./registry";

// Ownership validation
export {
  validateOwnership,
  isOwner,
  getCurrentOwner,
  validateAndUpdate,
} from "./validator";

// Type exports
export type {
  AssetRegistrationRequest,
  AssetRegistrationResult,
  BatchAssetRegistration,
  BatchRegistrationResult,
  OwnershipValidationRequest,
  OwnershipValidationResult,
  ChainEventPayload,
  LedgerType,
  AssetStatus,
} from "./models";
