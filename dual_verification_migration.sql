-- Agregar columnas para dual verification (Oriluxchain + Crestchain)
-- Ejecutar este script en Supabase SQL Editor

-- Columnas para Crestchain
ALTER TABLE nft_certificates
ADD COLUMN IF NOT EXISTS crestchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS crestchain_token_id TEXT,
ADD COLUMN IF NOT EXISTS crestchain_contract_address TEXT,
ADD COLUMN IF NOT EXISTS crestchain_block_number INTEGER,
ADD COLUMN IF NOT EXISTS crestchain_verification_url TEXT,
ADD COLUMN IF NOT EXISTS crestchain_network TEXT DEFAULT 'CRESTCHAIN',

-- Estado de dual verification
ADD COLUMN IF NOT EXISTS dual_verification BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'oriluxchain_only',

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_nft_certificates_dual_verification ON nft_certificates(dual_verification);
CREATE INDEX IF NOT EXISTS idx_nft_certificates_verification_status ON nft_certificates(verification_status);
CREATE INDEX IF NOT EXISTS idx_nft_certificates_crestchain_tx ON nft_certificates(crestchain_tx_hash);

-- Actualizar registros existentes que ya tienen datos de Crestchain
UPDATE nft_certificates
SET
  dual_verification = CASE
    WHEN crestchain_tx_hash IS NOT NULL THEN TRUE
    ELSE FALSE
  END,
  verification_status = CASE
    WHEN crestchain_tx_hash IS NOT NULL THEN 'dual_verified'
    ELSE 'oriluxchain_only'
  END
WHERE verification_status IS NULL;
