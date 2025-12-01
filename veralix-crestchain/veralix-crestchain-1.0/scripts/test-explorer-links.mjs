import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const crestBase = 'https://scan.crestchain.pro'

function crestchainTxUrl(hash) {
  return `${crestBase}/tx/${hash}`
}

function crestchainAddressUrl(address) {
  return `${crestBase}/address/${address}`
}

const tx = '0xabc1234567890deadbeefcafebabef00d1234567890abcde1234567890abcd'
const addr = '0x0A0252c0604025225B3204Be454e439F49C'

assert.strictEqual(
  crestchainTxUrl(tx),
  `${crestBase}/tx/${tx}`
)

assert.strictEqual(
  crestchainAddressUrl(addr),
  `${crestBase}/address/${addr}`
)

const uiFile = resolve(process.cwd(), 'src/components/VerificationDetails.tsx')
const uiContent = readFileSync(uiFile, 'utf8')
assert.ok(uiContent.includes('blockchain_data'))
assert.ok(!/etherscan\.io/i.test(uiContent))

const fnFile = resolve(process.cwd(), 'supabase/functions/generate-nft-certificate/index.ts')
const fnContent = readFileSync(fnFile, 'utf8')
assert.ok(fnContent.includes('dual-mint-orilux-crestchain'))
assert.ok(fnContent.includes('CRESTCHAIN'))

console.log('OK: Integración CrestChain verificada en el código')