import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "npm:ethers@6.9.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// BSC Mainnet Configuration
const BSC_RPC_URLS = [
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org'
];
const DEFAULT_CONTRACT = '0x5aDcEEf785FD21b65986328ca1e6DE0C973eC423';
const TCT_CONTRACT = '0x2D8931C368fE34D3d039Ab454aFc131342A339B5';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    
    const BSC_RPC_URL = Deno.env.get('BSC_RPC_URL') || BSC_RPC_URLS[0];
    const VERALIX_CONTRACT_ADDRESS = Deno.env.get('VERALIX_CONTRACT_ADDRESS') || DEFAULT_CONTRACT;
    
    console.log(`Testing BSC Mainnet RPC: ${BSC_RPC_URL}`);
    
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    
    let result: any = {};
    
    switch (action) {
      case 'getBlockNumber': {
        const blockNumber = await provider.getBlockNumber();
        const network = await provider.getNetwork();
        result = {
          blockNumber,
          chainId: network.chainId.toString(),
          networkName: 'BSC Mainnet',
          rpcUrl: BSC_RPC_URL
        };
        break;
      }
      
      case 'getContractInfo': {
        const contractABI = [
          "function totalSupply() view returns (uint256)"
        ];
        const contract = new ethers.Contract(VERALIX_CONTRACT_ADDRESS, contractABI, provider);
        const totalSupply = await contract.totalSupply().catch(() => 'N/A');
        
        result = {
          contractAddress: VERALIX_CONTRACT_ADDRESS,
          totalSupply: totalSupply.toString(),
          network: 'BSC Mainnet',
          explorer: `https://bscscan.com/address/${VERALIX_CONTRACT_ADDRESS}`
        };
        break;
      }
      
      case 'getWalletBalance': {
        const SYSTEM_PRIVATE_KEY = Deno.env.get('SYSTEM_PRIVATE_KEY');
        if (!SYSTEM_PRIVATE_KEY) {
          result = {
            error: 'SYSTEM_PRIVATE_KEY not configured',
            configured: false
          };
        } else {
          try {
            const privateKey = SYSTEM_PRIVATE_KEY.startsWith('0x') 
              ? SYSTEM_PRIVATE_KEY 
              : `0x${SYSTEM_PRIVATE_KEY}`;
            
            const wallet = new ethers.Wallet(privateKey, provider);
            const balance = await provider.getBalance(wallet.address);
            const nonce = await provider.getTransactionCount(wallet.address);
            
            // También obtener balance de TCT
            const tctABI = ["function balanceOf(address) view returns (uint256)"];
            const tctContract = new ethers.Contract(TCT_CONTRACT, tctABI, provider);
            const tctBalance = await tctContract.balanceOf(wallet.address).catch(() => BigInt(0));
            
            result = {
              address: wallet.address,
              balanceBNB: ethers.formatEther(balance),
              balanceTCT: ethers.formatEther(tctBalance),
              nonce,
              configured: true,
              network: 'BSC Mainnet',
              explorer: `https://bscscan.com/address/${wallet.address}`
            };
          } catch (walletError: any) {
            result = {
              error: walletError.message,
              configured: true
            };
          }
        }
        break;
      }
      
      case 'fullDiagnostic': {
        const blockNumber = await provider.getBlockNumber();
        const network = await provider.getNetwork();
        
        const contractABI = ["function totalSupply() view returns (uint256)"];
        const contract = new ethers.Contract(VERALIX_CONTRACT_ADDRESS, contractABI, provider);
        const totalSupply = await contract.totalSupply().catch(() => 'Error');
        
        const SYSTEM_PRIVATE_KEY = Deno.env.get('SYSTEM_PRIVATE_KEY');
        let walletInfo: any = { configured: false };
        
        if (SYSTEM_PRIVATE_KEY) {
          try {
            const privateKey = SYSTEM_PRIVATE_KEY.startsWith('0x') 
              ? SYSTEM_PRIVATE_KEY 
              : `0x${SYSTEM_PRIVATE_KEY}`;
            const wallet = new ethers.Wallet(privateKey, provider);
            const balance = await provider.getBalance(wallet.address);
            
            // Balance TCT
            const tctABI = ["function balanceOf(address) view returns (uint256)"];
            const tctContract = new ethers.Contract(TCT_CONTRACT, tctABI, provider);
            const tctBalance = await tctContract.balanceOf(wallet.address).catch(() => BigInt(0));
            
            walletInfo = {
              configured: true,
              address: wallet.address,
              balanceBNB: ethers.formatEther(balance),
              balanceTCT: ethers.formatEther(tctBalance)
            };
          } catch (e) {
            walletInfo = { configured: true, error: e.message };
          }
        }
        
        result = {
          network: 'BSC Mainnet',
          rpc: {
            url: BSC_RPC_URL,
            blockNumber,
            chainId: network.chainId.toString(),
            status: 'connected'
          },
          contract: {
            address: VERALIX_CONTRACT_ADDRESS,
            totalSupply: totalSupply.toString(),
            status: totalSupply !== 'Error' ? 'active' : 'error',
            explorer: `https://bscscan.com/address/${VERALIX_CONTRACT_ADDRESS}`
          },
          tct: {
            address: TCT_CONTRACT,
            explorer: `https://bscscan.com/token/${TCT_CONTRACT}`
          },
          wallet: walletInfo,
          timestamp: new Date().toISOString()
        };
        break;
      }
      
      case 'testPinata': {
        const PINATA_JWT = Deno.env.get('PINATA_JWT');
        if (!PINATA_JWT) {
          result = { configured: false, error: 'PINATA_JWT not configured' };
        } else {
          try {
            const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${PINATA_JWT}` }
            });
            
            if (response.ok) {
              result = { configured: true, authenticated: true, message: 'Pinata OK' };
            } else {
              result = { configured: true, authenticated: false, error: 'Auth failed' };
            }
          } catch (e) {
            result = { configured: true, authenticated: false, error: e.message };
          }
        }
        break;
      }
      
      default:
        result = { 
          error: 'Unknown action', 
          availableActions: ['getBlockNumber', 'getContractInfo', 'getWalletBalance', 'fullDiagnostic', 'testPinata'],
          network: 'BSC Mainnet'
        };
    }
    
    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('BSC RPC test error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Failed to connect to BSC Mainnet'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
