# 🚀 IMPLEMENTACIÓN CRESTCHAIN - PLAN DE EJECUCIÓN

**Fecha:** 25 de Noviembre, 2025 - 6:15 PM  
**Objetivo:** Implementar Crestchain completo con lógica de negocio funcional

---

## 📋 PLAN DE IMPLEMENTACIÓN

### FASE 1: Preparación (30 min)
- [ ] Analizar smart contract actual
- [ ] Preparar contrato mejorado
- [ ] Configurar wallet y obtener CREST tokens

### FASE 2: Smart Contract (1-2 horas)
- [ ] Desplegar contrato en Crestchain
- [ ] Verificar contrato en explorer
- [ ] Probar funciones básicas

### FASE 3: Edge Functions (2-3 horas)
- [ ] Actualizar mint-nft-crestchain con datos reales
- [ ] Eliminar hardcoded values
- [ ] Implementar mapeo de datos de joya

### FASE 4: Testing (1 hora)
- [ ] Crear certificado de prueba
- [ ] Verificar en Crestchain explorer
- [ ] Validar metadata en IPFS

### FASE 5: Integración (1 hora)
- [ ] Conectar con frontend
- [ ] Actualizar UI para mostrar TX en Crestchain
- [ ] Testing end-to-end

---

## 🔧 PASO 1: ANÁLISIS DEL SMART CONTRACT ACTUAL

### Contrato Actual (del código):

```solidity
// ABI actual en mint-nft-crestchain/index.ts
{
  inputs: [
    { internalType: "string", name: "certificateNumber", type: "string" },
    { internalType: "string", name: "jewelryType", type: "string" },
    { internalType: "string", name: "description", type: "string" },
    { internalType: "string", name: "imageHash", type: "string" },
    { internalType: "string", name: "metadataURI", type: "string" },
    { internalType: "address", name: "owner", type: "address" },
    { internalType: "uint256", name: "appraisalValue", type: "uint256" },
    { internalType: "string", name: "appraisalCurrency", type: "string" },
  ],
  name: "createCertificate",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "nonpayable",
  type: "function",
}
```

### ❌ Problemas:
1. Contrato NO está desplegado
2. Address es 0x000...
3. No hay código fuente

---

## 📝 PASO 2: SMART CONTRACT MEJORADO

Voy a crear un contrato completo para Veralix:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VeralixCertificate is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Estructura de certificado
    struct Certificate {
        string certificateId;      // VRX-XXXXX
        string jewelryType;        // Ring, Necklace, etc.
        string description;        // Descripción de la joya
        string imageHash;          // IPFS hash de la imagen
        string metadataURI;        // IPFS URI de metadata completa
        address owner;             // Propietario actual
        uint256 appraisalValue;    // Valor de tasación
        string appraisalCurrency;  // COP, USD, etc.
        uint256 createdAt;         // Timestamp de creación
        bool isActive;             // Estado del certificado
    }

    // Mapeo de tokenId a certificado
    mapping(uint256 => Certificate) public certificates;
    
    // Mapeo de certificateId a tokenId
    mapping(string => uint256) public certificateIdToTokenId;
    
    // Eventos
    event CertificateCreated(
        uint256 indexed tokenId,
        string certificateId,
        address owner,
        string metadataURI
    );
    
    event CertificateTransferred(
        uint256 indexed tokenId,
        address from,
        address to
    );

    constructor() ERC721("Veralix Certificate", "VRX") {}

    /**
     * @dev Crea un nuevo certificado NFT
     */
    function createCertificate(
        string memory certificateId,
        string memory jewelryType,
        string memory description,
        string memory imageHash,
        string memory metadataURI,
        address ownerAddress,
        uint256 appraisalValue,
        string memory appraisalCurrency
    ) public onlyOwner returns (uint256) {
        require(
            certificateIdToTokenId[certificateId] == 0,
            "Certificate ID already exists"
        );

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(ownerAddress, tokenId);
        _setTokenURI(tokenId, metadataURI);

        certificates[tokenId] = Certificate({
            certificateId: certificateId,
            jewelryType: jewelryType,
            description: description,
            imageHash: imageHash,
            metadataURI: metadataURI,
            owner: ownerAddress,
            appraisalValue: appraisalValue,
            appraisalCurrency: appraisalCurrency,
            createdAt: block.timestamp,
            isActive: true
        });

        certificateIdToTokenId[certificateId] = tokenId;

        emit CertificateCreated(tokenId, certificateId, ownerAddress, metadataURI);

        return tokenId;
    }

    /**
     * @dev Obtiene información de un certificado por tokenId
     */
    function getCertificate(uint256 tokenId) 
        public 
        view 
        returns (Certificate memory) 
    {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }

    /**
     * @dev Obtiene tokenId por certificateId
     */
    function getTokenIdByCertificateId(string memory certificateId) 
        public 
        view 
        returns (uint256) 
    {
        uint256 tokenId = certificateIdToTokenId[certificateId];
        require(tokenId != 0, "Certificate ID not found");
        return tokenId;
    }

    /**
     * @dev Verifica si un certificado existe
     */
    function certificateExists(string memory certificateId) 
        public 
        view 
        returns (bool) 
    {
        return certificateIdToTokenId[certificateId] != 0;
    }

    /**
     * @dev Override para manejar transferencias
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            certificates[tokenId].owner = to;
            emit CertificateTransferred(tokenId, from, to);
        }
    }

    // Overrides requeridos
    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

---

## 🔑 PASO 3: CONFIGURACIÓN NECESARIA

### 3.1. Variables de Entorno (Supabase Edge Functions)

```bash
# En Supabase Dashboard → Project Settings → Edge Functions → Secrets

# Crestchain RPC
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro

# Smart Contract (después de desplegar)
VERALIX_CONTRACT_ADDRESS=0x... # Se obtiene después del deployment

# Wallet del sistema (necesitas crear una)
SYSTEM_PRIVATE_KEY=0x... # Private key de la wallet que desplegará contratos

# Pinata (ya debería estar)
PINATA_JWT=tu_jwt_de_pinata
```

### 3.2. Obtener CREST Tokens

**Opciones:**
1. **Faucet** (si existe): https://faucet.crestchain.pro
2. **Exchange** (comprar CREST)
3. **Bridge** (desde otra chain)

**Necesitas:**
- ~0.5 CREST para deployment del contrato
- ~0.1 CREST por certificado (gas fees)

---

## 📝 PASO 4: DEPLOYMENT DEL CONTRATO

### Opción A: Usando Hardhat (Recomendado)

```bash
# Crear proyecto Hardhat
mkdir veralix-contract
cd veralix-contract
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts

# Inicializar Hardhat
npx hardhat init
```

**hardhat.config.js:**
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    crestchain: {
      url: "https://rpc.crestchain.pro",
      chainId: 85523,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      crestchain: "no-api-key-needed"
    },
    customChains: [
      {
        network: "crestchain",
        chainId: 85523,
        urls: {
          apiURL: "https://scan.crestchain.pro/api",
          browserURL: "https://scan.crestchain.pro"
        }
      }
    ]
  }
};
```

**Script de deployment:**
```javascript
// scripts/deploy.js
async function main() {
  const VeralixCertificate = await ethers.getContractFactory("VeralixCertificate");
  const contract = await VeralixCertificate.deploy();
  await contract.deployed();

  console.log("VeralixCertificate deployed to:", contract.address);
  
  // Esperar confirmaciones
  await contract.deployTransaction.wait(5);
  
  // Verificar en explorer
  console.log("Verifying contract...");
  await hre.run("verify:verify", {
    address: contract.address,
    constructorArguments: [],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

**Desplegar:**
```bash
# Configurar private key
export PRIVATE_KEY=0x...

# Desplegar
npx hardhat run scripts/deploy.js --network crestchain

# Resultado esperado:
# VeralixCertificate deployed to: 0xABC123...
```

---

## 🔄 PASO 5: ACTUALIZAR EDGE FUNCTION

Ahora voy a actualizar `mint-nft-crestchain` para usar datos REALES:

```typescript
// supabase/functions/mint-nft-crestchain/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { ethers } from "npm:ethers@6.13.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuración de Crestchain
const RPC_URL = Deno.env.get("CRESTCHAIN_RPC_URL") || "https://rpc.crestchain.pro";
const CONTRACT_ADDRESS = Deno.env.get("VERALIX_CONTRACT_ADDRESS");
const SYSTEM_PRIVATE_KEY = Deno.env.get("SYSTEM_PRIVATE_KEY");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ABI del contrato (solo la función que necesitamos)
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "certificateId", type: "string" },
      { internalType: "string", name: "jewelryType", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "string", name: "imageHash", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "address", name: "ownerAddress", type: "address" },
      { internalType: "uint256", name: "appraisalValue", type: "uint256" },
      { internalType: "string", name: "appraisalCurrency", type: "string" },
    ],
    name: "createCertificate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

interface MintRequestBody {
  certificateId: string;
  jewelryItemId: string;
  userId: string;
  metadataUri: string;
  imageUri: string;
  ownerAddress?: string;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { 
    status, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

async function mintCertificate(req: MintRequestBody) {
  console.log('🚀 Iniciando minteo en Crestchain...');
  
  // Validaciones
  if (!SYSTEM_PRIVATE_KEY) {
    return { success: false, error: "SYSTEM_PRIVATE_KEY not configured" };
  }
  
  if (!CONTRACT_ADDRESS) {
    return { success: false, error: "VERALIX_CONTRACT_ADDRESS not configured" };
  }

  try {
    // 1. Obtener datos de la joya desde Supabase
    console.log('📦 Obteniendo datos de la joya...');
    const { data: jewelryData, error: jewelryError } = await supabase
      .from('jewelry_items')
      .select('*')
      .eq('id', req.jewelryItemId)
      .single();

    if (jewelryError || !jewelryData) {
      throw new Error('Jewelry item not found');
    }

    console.log('✅ Datos de joya obtenidos:', jewelryData.name);

    // 2. Obtener datos del usuario/propietario
    const { data: userData } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('user_id', req.userId)
      .single();

    // 3. Preparar datos REALES (NO hardcoded)
    const certificateId = req.certificateId;
    const jewelryType = jewelryData.type || 'Jewelry';
    const description = jewelryData.description || `${jewelryData.name} - Veralix Certified`;
    const imageHash = req.imageUri.replace('ipfs://', ''); // Remover prefijo
    const metadataURI = req.metadataUri;
    const ownerAddress = req.ownerAddress || userData?.wallet_address || 
                        '0x0000000000000000000000000000000000000000'; // Fallback
    
    // Convertir valor a Wei (si existe)
    const appraisalValue = jewelryData.sale_price 
      ? ethers.parseUnits(jewelryData.sale_price.toString(), 0) // Sin decimales para COP
      : 0n;
    const appraisalCurrency = jewelryData.currency || 'COP';

    console.log('📝 Datos preparados:', {
      certificateId,
      jewelryType,
      ownerAddress,
      appraisalValue: appraisalValue.toString(),
      appraisalCurrency
    });

    // 4. Conectar a Crestchain
    console.log('🔗 Conectando a Crestchain...');
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(SYSTEM_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    console.log('💰 Wallet address:', wallet.address);

    // 5. Verificar balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💵 Balance:', ethers.formatEther(balance), 'CREST');

    if (balance === 0n) {
      throw new Error('Insufficient CREST balance for gas fees');
    }

    // 6. Crear certificado en blockchain
    console.log('⛏️ Minteando NFT en Crestchain...');
    const tx = await contract.createCertificate(
      certificateId,
      jewelryType,
      description,
      imageHash,
      metadataURI,
      ownerAddress,
      appraisalValue,
      appraisalCurrency,
      {
        gasLimit: 500000 // Gas limit explícito
      }
    );

    console.log('📤 Transacción enviada:', tx.hash);
    console.log('⏳ Esperando confirmación...');

    // 7. Esperar confirmación
    const receipt = await tx.wait();
    console.log('✅ Transacción confirmada en bloque:', receipt.blockNumber);

    // 8. Extraer tokenId del evento
    const tokenId = receipt?.logs?.[0]?.topics?.[1] 
      ? BigInt(receipt.logs[0].topics[1]).toString()
      : undefined;

    console.log('🎫 Token ID:', tokenId);

    // 9. Guardar en Supabase
    const { data: inserted, error: insertError } = await supabase
      .from("nft_certificates")
      .insert({
        certificate_id: req.certificateId,
        jewelry_item_id: req.jewelryItemId,
        user_id: req.userId,
        owner_id: req.userId,
        metadata_uri: metadataURI,
        transaction_hash: tx.hash,
        token_id: tokenId,
        contract_address: CONTRACT_ADDRESS,
        block_number: receipt.blockNumber.toString(),
        blockchain_network: "crestchain",
        is_verified: true,
        verification_date: new Date().toISOString(),
        blockchain_verification_url: `https://scan.crestchain.pro/tx/${tx.hash}`
      })
      .select("id")
      .single();

    if (insertError) {
      console.error('⚠️ Error guardando en Supabase:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('💾 Guardado en Supabase con ID:', inserted.id);

    // 10. Actualizar estado de la joya
    await supabase
      .from('jewelry_items')
      .update({ status: 'certified' })
      .eq('id', req.jewelryItemId);

    return {
      success: true,
      certificateId: inserted.id,
      transactionHash: tx.hash,
      tokenId: tokenId,
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://scan.crestchain.pro/tx/${tx.hash}`
    };

  } catch (error: any) {
    console.error('❌ Error minteando:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to mint NFT' 
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as MintRequestBody;
    
    console.log('📥 Request recibido:', {
      certificateId: body.certificateId,
      jewelryItemId: body.jewelryItemId
    });

    const result = await mintCertificate(body);
    
    if (!result.success) {
      return errorResponse(result.error || "mint_failed", 500);
    }

    return jsonResponse(result);
    
  } catch (e) {
    console.error('❌ Error general:', e);
    return errorResponse(e instanceof Error ? e.message : String(e), 500);
  }
});
```

---

## 🔄 PASO 6: ACTUALIZAR generate-nft-certificate

Necesitamos que pase los datos correctos a mint-nft-crestchain:

```typescript
// Al final de generate-nft-certificate/index.ts
// Después de subir metadata a IPFS

// Llamar a mint-nft-crestchain con datos reales
const { data: mintData, error: mintError } = await supabaseAdmin.functions.invoke(
  'mint-nft-crestchain',
  {
    body: {
      certificateId: certificateId,
      jewelryItemId: jewelryItemId,
      userId: userId,
      metadataUri: metadataUri,
      imageUri: jewelryImageUri || 'ipfs://placeholder',
      ownerAddress: userData?.wallet_address
    }
  }
);

if (mintError) {
  console.error('⚠️ Error minteando NFT:', mintError);
  // No fallar la generación del certificado
} else {
  console.log('✅ NFT minteado:', mintData);
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Pre-requisitos
- [ ] Crear wallet nueva para el sistema
- [ ] Obtener CREST tokens (~1 CREST)
- [ ] Guardar private key de forma segura

### Deployment
- [ ] Compilar smart contract
- [ ] Desplegar en Crestchain
- [ ] Verificar en scan.crestchain.pro
- [ ] Copiar contract address

### Configuración
- [ ] Agregar CRESTCHAIN_RPC_URL en Supabase
- [ ] Agregar VERALIX_CONTRACT_ADDRESS en Supabase
- [ ] Agregar SYSTEM_PRIVATE_KEY en Supabase

### Edge Functions
- [ ] Actualizar mint-nft-crestchain
- [ ] Actualizar generate-nft-certificate
- [ ] Redesplegar ambas funciones

### Testing
- [ ] Crear joya de prueba en Veralix
- [ ] Generar certificado
- [ ] Verificar TX en scan.crestchain.pro
- [ ] Verificar metadata en IPFS
- [ ] Verificar en Supabase

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Desplegar contrato
cd veralix-contract
npx hardhat run scripts/deploy.js --network crestchain

# Redesplegar Edge Functions
cd ../veralix-crestchain-1.0
npx supabase functions deploy mint-nft-crestchain
npx supabase functions deploy generate-nft-certificate

# Ver logs
npx supabase functions logs mint-nft-crestchain --follow
```

---

**¿Listo para empezar? Dime si necesitas ayuda con algún paso específico.** 🚀
