-- Add memorable_message column to nft_certificates table
ALTER TABLE nft_certificates 
ADD COLUMN IF NOT EXISTS memorable_message TEXT;

COMMENT ON COLUMN nft_certificates.memorable_message IS 'Mensaje memorable inmutable que el cliente puede agregar al certificado';