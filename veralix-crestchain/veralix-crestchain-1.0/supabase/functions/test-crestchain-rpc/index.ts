import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "npm:ethers@6.9.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    
    const CRESTCHAIN_RPC_URL = Deno.env.get('CRESTCHAIN_RPC_URL') || 'https://rpc.crestchain.pro';
    const VERALIX_CONTRACT_ADDRESS = Deno.env.get('VERALIX_CONTRACT_ADDRESS') || '0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB';
    
    console.log(`Testing CrestChain RPC: ${CRESTCHAIN_RPC_URL}`);
    
    const provider = new ethers.JsonRpcProvider(CRESTCHAIN_RPC_URL);
    
    let result: any = {};
    
    switch (action) {
      case 'getBlockNumber': {
        const blockNumber = await provider.getBlockNumber();
        const network = await provider.getNetwork();
        result = {
          blockNumber,
          chainId: network.chainId.toString(),
          networkName: network.name,
          rpcUrl: CRESTCHAIN_RPC_URL
        };
        break;
      }
      
      case 'getContractInfo': {
        const contractABI = [
          "function totalSupply() view returns (uint256)",
          "function name() view returns (string)",
          "function symbol() view returns (string)"
        ];
        const contract = new ethers.Contract(VERALIX_CONTRACT_ADDRESS, contractABI, provider);
        
        const [totalSupply, name, symbol] = await Promise.all([
          contract.totalSupply().catch(() => 'N/A'),
          contract.name().catch(() => 'N/A'),
          contract.symbol().catch(() => 'N/A')
        ]);
        
        result = {
          contractAddress: VERALIX_CONTRACT_ADDRESS,
          totalSupply: totalSupply.toString(),
          name,
          symbol
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
            // Asegurar que tenga el prefijo 0x
            const privateKey = SYSTEM_PRIVATE_KEY.startsWith('0x') 
              ? SYSTEM_PRIVATE_KEY 
              : `0x${SYSTEM_PRIVATE_KEY}`;
            
            const wallet = new ethers.Wallet(privateKey, provider);
            const balance = await provider.getBalance(wallet.address);
            const nonce = await provider.getTransactionCount(wallet.address);
            
            result = {
              address: wallet.address,
              balance: ethers.formatEther(balance),
              balanceWei: balance.toString(),
              balanceTCT: parseFloat(ethers.formatEther(balance)).toFixed(6),
              nonce,
              configured: true,
              keyLength: SYSTEM_PRIVATE_KEY.length
            };
          } catch (walletError: any) {
            result = {
              error: walletError.message,
              configured: true,
              keyLength: SYSTEM_PRIVATE_KEY.length,
              keyPreview: `${SYSTEM_PRIVATE_KEY.substring(0, 4)}...${SYSTEM_PRIVATE_KEY.substring(SYSTEM_PRIVATE_KEY.length - 4)}`
            };
          }
        }
        break;
      }
      
      case 'fullDiagnostic': {
        // Run all tests
        const blockNumber = await provider.getBlockNumber();
        const network = await provider.getNetwork();
        
        const contractABI = ["function totalSupply() view returns (uint256)"];
        const contract = new ethers.Contract(VERALIX_CONTRACT_ADDRESS, contractABI, provider);
        const totalSupply = await contract.totalSupply().catch(() => 'Error');
        
        const SYSTEM_PRIVATE_KEY = Deno.env.get('SYSTEM_PRIVATE_KEY');
        let walletInfo = { configured: false };
        
        if (SYSTEM_PRIVATE_KEY) {
          const wallet = new ethers.Wallet(SYSTEM_PRIVATE_KEY, provider);
          const balance = await provider.getBalance(wallet.address);
          walletInfo = {
            configured: true,
            address: wallet.address,
            balance: ethers.formatEther(balance)
          };
        }
        
        result = {
          rpc: {
            url: CRESTCHAIN_RPC_URL,
            blockNumber,
            chainId: network.chainId.toString(),
            status: 'connected'
          },
          contract: {
            address: VERALIX_CONTRACT_ADDRESS,
            totalSupply: totalSupply.toString(),
            status: totalSupply !== 'Error' ? 'active' : 'error'
          },
          wallet: walletInfo,
          timestamp: new Date().toISOString()
        };
        break;
      }
      
      case 'testPinata': {
        const PINATA_JWT = Deno.env.get('PINATA_JWT');
        if (!PINATA_JWT) {
          result = {
            configured: false,
            error: 'PINATA_JWT not configured'
          };
        } else {
          try {
            const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              result = {
                configured: true,
                authenticated: true,
                message: data.message || 'Pinata authentication successful'
              };
            } else {
              result = {
                configured: true,
                authenticated: false,
                status: response.status,
                error: 'Authentication failed'
              };
            }
          } catch (e) {
            result = {
              configured: true,
              authenticated: false,
              error: e.message
            };
          }
        }
        break;
      }
      
      default:
        result = { error: 'Unknown action', availableActions: ['getBlockNumber', 'getContractInfo', 'getWalletBalance', 'fullDiagnostic', 'testPinata'] };
    }
    
    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('CrestChain RPC test error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Failed to connect to CrestChain RPC'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
