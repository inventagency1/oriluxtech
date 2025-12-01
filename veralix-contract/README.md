# Veralix Certificate Smart Contract

NFT Certificate contract for Veralix jewelry authentication on Crestchain.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your private key to `.env`:
```
PRIVATE_KEY=your_private_key_here
```

⚠️ **IMPORTANT:** Never commit `.env` file with real private key!

## Get CREST Tokens

You need CREST tokens for gas fees. Options:

1. **Faucet** (if available): https://faucet.crestchain.pro
2. **Exchange**: Buy CREST tokens
3. **Bridge**: Bridge from another chain

Recommended: ~1 CREST for deployment + testing

## Deploy

```bash
npm run deploy
```

This will:
1. Compile the contract
2. Deploy to Crestchain
3. Wait for confirmations
4. Verify on explorer (if possible)

## After Deployment

1. Copy the contract address from deployment output
2. Add to Supabase Edge Functions secrets:
   ```
   VERALIX_CONTRACT_ADDRESS=0x...
   ```
3. Redeploy Edge Functions:
   ```bash
   npx supabase functions deploy mint-nft-crestchain
   ```

## Contract Information

- **Name:** Veralix Certificate
- **Symbol:** VRX
- **Network:** Crestchain (Chain ID: 85523)
- **Standard:** ERC-721 (NFT)

## Functions

### `createCertificate`
Creates a new certificate NFT with jewelry information.

**Parameters:**
- `certificateId`: Unique ID (VRX-XXXXX)
- `jewelryType`: Type of jewelry
- `description`: Jewelry description
- `imageHash`: IPFS hash of image
- `metadataURI`: IPFS URI of metadata
- `ownerAddress`: Owner's wallet
- `appraisalValue`: Appraisal value
- `appraisalCurrency`: Currency code

**Returns:** Token ID

### `getCertificate`
Gets certificate information by token ID.

### `getTokenIdByCertificateId`
Gets token ID from certificate ID.

### `certificateExists`
Checks if a certificate exists.

## Verification

View your contract on Crestchain explorer:
```
https://scan.crestchain.pro/address/YOUR_CONTRACT_ADDRESS
```

## Security

- Only contract owner can mint certificates
- Certificates are immutable once created
- Standard ERC-721 transfer functions
- OpenZeppelin audited contracts

## License

MIT
