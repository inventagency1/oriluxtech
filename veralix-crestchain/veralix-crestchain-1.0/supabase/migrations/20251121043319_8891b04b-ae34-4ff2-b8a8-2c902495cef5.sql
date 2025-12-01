-- ============================================
-- MIGRACIÓN: INTEGRACIÓN ORILUXCHAIN
-- Agregar campos para registro en blockchain Oriluxchain
-- ============================================

-- Agregar columnas de Oriluxchain a nft_certificates
ALTER TABLE nft_certificates
ADD COLUMN IF NOT EXISTS orilux_blockchain_hash TEXT,
ADD COLUMN IF NOT EXISTS orilux_blockchain_status TEXT CHECK (orilux_blockchain_status IN ('pending', 'verified')),
ADD COLUMN IF NOT EXISTS orilux_verification_url TEXT,
ADD COLUMN IF NOT EXISTS orilux_block_number INTEGER,
ADD COLUMN IF NOT EXISTS orilux_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS orilux_timestamp BIGINT;

-- Crear índice para búsquedas rápidas por estado de Oriluxchain
CREATE INDEX IF NOT EXISTS idx_nft_certificates_orilux_status 
ON nft_certificates(orilux_blockchain_status) 
WHERE orilux_blockchain_status IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN nft_certificates.orilux_blockchain_hash IS 'Hash del certificado registrado en Oriluxchain';
COMMENT ON COLUMN nft_certificates.orilux_blockchain_status IS 'Estado del registro en Oriluxchain: pending | verified';
COMMENT ON COLUMN nft_certificates.orilux_verification_url IS 'URL pública para verificar certificado en Oriluxchain';
COMMENT ON COLUMN nft_certificates.orilux_block_number IS 'Número de bloque en Oriluxchain donde se registró el certificado';
COMMENT ON COLUMN nft_certificates.orilux_tx_hash IS 'Hash de transacción en Oriluxchain';
COMMENT ON COLUMN nft_certificates.orilux_timestamp IS 'Timestamp del registro en Oriluxchain (Unix timestamp)';