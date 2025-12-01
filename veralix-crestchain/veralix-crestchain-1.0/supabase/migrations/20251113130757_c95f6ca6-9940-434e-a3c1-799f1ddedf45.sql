-- Agregar columnas para separar URLs de visualización y verificación blockchain
ALTER TABLE nft_certificates 
ADD COLUMN IF NOT EXISTS certificate_view_url TEXT,
ADD COLUMN IF NOT EXISTS blockchain_verification_url TEXT;

-- Comentarios para documentar el propósito de cada columna
COMMENT ON COLUMN nft_certificates.certificate_view_url IS 
'URL pública para ver el certificado PDF embebido en la web (ej: /certificate/CERT-123)';

COMMENT ON COLUMN nft_certificates.blockchain_verification_url IS 
'URL para verificar detalles técnicos de blockchain como token, contract y transaction (ej: /verify/CERT-123)';

-- Migrar datos existentes: convertir verification_url en las dos nuevas URLs
UPDATE nft_certificates 
SET 
  certificate_view_url = REPLACE(verification_url, '/verify/', '/certificate/'),
  blockchain_verification_url = verification_url
WHERE certificate_view_url IS NULL AND verification_url IS NOT NULL;

-- Crear índice para búsquedas rápidas por certificate_view_url
CREATE INDEX IF NOT EXISTS idx_nft_certificates_view_url 
ON nft_certificates(certificate_view_url);

-- Crear índice para búsquedas por blockchain_verification_url
CREATE INDEX IF NOT EXISTS idx_nft_certificates_blockchain_url 
ON nft_certificates(blockchain_verification_url);