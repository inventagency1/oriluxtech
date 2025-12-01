export interface MintRequest {
  certificateId: string;
  jewelryItemId: string;
  userId: string;
  ownerAddress?: string;
}

export interface BatchMintRequest {
  certificateIds: string[];
  userId: string;
  ownerAddress?: string;
}

export interface MintResult {
  certificateId: string;
  success: boolean;
  transactionHash?: string;
  tokenId?: string | number;
  error?: string;
}

export interface BatchMintResult {
  total: number;
  successful: number;
  failed: number;
  results: MintResult[];
}