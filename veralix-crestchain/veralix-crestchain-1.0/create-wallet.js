/**
 * Script para crear wallet del sistema compatible con Crestchain
 * Usa ethers.js (ya instalado en el proyecto)
 */

import { Wallet } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 GENERADOR DE WALLET PARA CRESTCHAIN');
console.log('='.repeat(60));

// Crear wallet aleatoria
const wallet = Wallet.createRandom();

// Datos de la wallet
const walletData = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  mnemonic: wallet.mnemonic?.phrase || null,
  network: 'Crestchain',
  chainId: 85523,
  rpcUrl: 'https://rpc.crestchain.pro',
  explorerUrl: 'https://scan.crestchain.pro',
  createdAt: new Date().toISOString()
};

// Mostrar información
console.log('\n🔐 WALLET CREADA PARA CRESTCHAIN');
console.log('='.repeat(60));
console.log('\n📋 Información:');
console.log('   Address:     ', wallet.address);
console.log('   Private Key: ', wallet.privateKey);
if (wallet.mnemonic) {
  console.log('   Mnemonic:    ', wallet.mnemonic.phrase);
}
console.log('   Network:     ', walletData.network);
console.log('   Chain ID:    ', walletData.chainId);
console.log('   Created:     ', walletData.createdAt);

// Guardar en archivo
const filename = 'system_wallet.json';
const filepath = path.join(__dirname, filename);

try {
  fs.writeFileSync(filepath, JSON.stringify(walletData, null, 2));
  console.log('\n✅ Wallet guardada en:', filename);
} catch (error) {
  console.error('\n❌ Error guardando archivo:', error.message);
}

// Instrucciones de seguridad
console.log('\n' + '='.repeat(60));
console.log('⚠️  SEGURIDAD - MUY IMPORTANTE');
console.log('='.repeat(60));
console.log('   ❌ NUNCA compartas tu private key');
console.log('   ❌ NO la subas a Git');
console.log('   ❌ NO la envíes por email/chat');
console.log('   ✅ Guárdala en un lugar seguro');
console.log('   ✅ Haz backups encriptados');

// Próximos pasos
console.log('\n' + '='.repeat(60));
console.log('📝 PRÓXIMOS PASOS');
console.log('='.repeat(60));
console.log('\n1. Obtener TCT tokens (~1.5 TCT)');
console.log('   - Faucet: https://faucet.crestchain.pro (si existe)');
console.log('   - O contactar equipo de Crestchain');
console.log('\n2. Enviar TCT a tu wallet:');
console.log('   Address:', wallet.address);
console.log('\n3. Verificar balance en explorer:');
console.log('   https://scan.crestchain.pro/address/' + wallet.address);
console.log('\n4. Configurar en Supabase:');
console.log('   SYSTEM_PRIVATE_KEY=' + wallet.privateKey);
console.log('   CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro');
console.log('\n5. Desplegar smart contract:');
console.log('   cd ../veralix-contract');
console.log('   npm run deploy');

console.log('\n' + '='.repeat(60));
console.log('✅ ¡Proceso completado!');
console.log('='.repeat(60) + '\n');
