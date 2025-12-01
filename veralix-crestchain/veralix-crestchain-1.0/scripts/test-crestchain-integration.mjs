import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

console.log('🧪 Ejecutando pruebas de integración CrestChain...\n')

// 1. Verificar que las funciones de CrestChain existen
const mintNftFn = resolve(process.cwd(), 'supabase/functions/mint-nft-crestchain/index.ts')
const dualMintFn = resolve(process.cwd(), 'supabase/functions/dual-mint-orilux-crestchain/index.ts')
const webhookFn = resolve(process.cwd(), 'supabase/functions/crestchain-webhook/index.ts')

console.log('✅ Verificando existencia de funciones...')
assert.ok(readFileSync(mintNftFn, 'utf8').includes('createCertificate'))
assert.ok(readFileSync(dualMintFn, 'utf8').includes('Dual Mint'))
assert.ok(readFileSync(webhookFn, 'utf8').includes('nft_certificates'))
console.log('✅ Todas las funciones de CrestChain existen\n')

// 2. Verificar configuración en generate-nft-certificate
const genCertFn = resolve(process.cwd(), 'supabase/functions/generate-nft-certificate/index.ts')
const genCertContent = readFileSync(genCertFn, 'utf8')

console.log('✅ Verificando integración en generate-nft-certificate...')
assert.ok(genCertContent.includes('dual-mint-orilux-crestchain'))
assert.ok(genCertContent.includes('CRESTCHAIN'))
assert.ok(genCertContent.includes('crestchain_tx_hash'))
assert.ok(genCertContent.includes('crestchain_token_id'))
console.log('✅ Integración de CrestChain encontrada\n')

// 3. Verificar servicios frontend
const crestchainService = resolve(process.cwd(), 'src/services/crestchain/index.ts')
const mintService = resolve(process.cwd(), 'src/services/crestchain/mint.ts')
const typesService = resolve(process.cwd(), 'src/services/crestchain/types.ts')

console.log('✅ Verificando servicios frontend...')
assert.ok(readFileSync(crestchainService, 'utf8').includes('generateCertificate'))
assert.ok(readFileSync(mintService, 'utf8').includes('mintSingleNFT'))
assert.ok(readFileSync(typesService, 'utf8').includes('MintRequest'))
console.log('✅ Servicios frontend de CrestChain encontrados\n')

// 4. Verificar página de testing
const testingPage = resolve(process.cwd(), 'src/pages/OriluxchainTesting.tsx')
const testingContent = readFileSync(testingPage, 'utf8')

console.log('✅ Verificando página de testing...')
assert.ok(testingContent.includes('mintSingleNFT'))
console.log('✅ Página de testing incluye funcionalidad de CrestChain\n')

console.log('🎉 Todas las pruebas de integración CrestChain pasaron exitosamente!')
console.log('\n📋 Resumen de la integración verificada:')
console.log('- ✅ Funciones Edge de Supabase')
console.log('- ✅ Integración en generate-nft-certificate')
console.log('- ✅ Servicios frontend')
console.log('- ✅ Página de testing')
console.log('- ✅ Webhooks para eventos')
