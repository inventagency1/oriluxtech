/**
 * Secure Wallet Manager for Veralix Edge Functions
 * Centralizes private key handling with security best practices
 */

import { ethers } from "npm:ethers@6.13.2";

// Whitelisted contract addresses
const WHITELISTED_CONTRACTS: Record<string, string[]> = {
  'BSC_MAINNET': [
    '0x5aDcEEf785FD21b65986328ca1e6DE0C973eC423', // VeralixMasterRegistry
  ],
  'CRESTCHAIN': [
    '0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB', // Veralix CrestChain
  ],
};

// Whitelisted function selectors (only createCertificate allowed)
const WHITELISTED_FUNCTIONS = [
  '0x', // Placeholder - add actual function selector
];

export class SecureWalletManager {
  private wallet: ethers.Wallet | null = null;
  private network: string;

  constructor(network: 'BSC_MAINNET' | 'CRESTCHAIN' = 'CRESTCHAIN') {
    this.network = network;
  }

  /**
   * Get wallet instance - validates private key format
   */
  async getWallet(provider: ethers.Provider): Promise<ethers.Wallet> {
    const privateKey = Deno.env.get('SYSTEM_PRIVATE_KEY');
    
    if (!privateKey) {
      throw new Error('SYSTEM_PRIVATE_KEY not configured');
    }

    // Validate private key format
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    if (formattedKey.length !== 66) {
      throw new Error('Invalid private key format');
    }

    this.wallet = new ethers.Wallet(formattedKey, provider);
    return this.wallet;
  }

  /**
   * Validate contract address is whitelisted
   */
  isContractWhitelisted(address: string): boolean {
    const contracts = WHITELISTED_CONTRACTS[this.network] || [];
    return contracts.some(c => c.toLowerCase() === address.toLowerCase());
  }

  /**
   * Get wallet address without exposing private key
   */
  async getAddress(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return this.wallet.address;
  }

  /**
   * Sign transaction with validation
   */
  async signTransaction(
    contract: ethers.Contract,
    functionName: string,
    args: any[]
  ): Promise<ethers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    // Validate contract is whitelisted
    const contractAddress = await contract.getAddress();
    if (!this.isContractWhitelisted(contractAddress)) {
      throw new Error(`Contract ${contractAddress} not whitelisted`);
    }

    // Only allow createCertificate function
    if (functionName !== 'createCertificate') {
      throw new Error(`Function ${functionName} not allowed`);
    }

    // Execute transaction
    const tx = await contract[functionName](...args);
    return tx;
  }
}

/**
 * Audit log for blockchain transactions
 */
export async function logBlockchainTransaction(
  supabase: any,
  action: string,
  details: Record<string, any>
): Promise<void> {
  try {
    await supabase.rpc('log_audit_action', {
      _action: action,
      _resource_type: 'blockchain_transaction',
      _resource_id: details.txHash || 'unknown',
      _details: {
        ...details,
        timestamp: new Date().toISOString(),
        network: details.network || 'unknown',
      }
    });
  } catch (error) {
    console.error('Failed to log blockchain transaction:', error);
  }
}
