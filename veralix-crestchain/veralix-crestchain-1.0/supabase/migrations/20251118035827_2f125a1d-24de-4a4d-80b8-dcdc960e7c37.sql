-- Agregar columna para imagen social generada con AI
ALTER TABLE nft_certificates 
ADD COLUMN IF NOT EXISTS social_image_url TEXT;

COMMENT ON COLUMN nft_certificates.social_image_url IS 'URL de la imagen decorativa del certificado generada con Lovable AI para compartir en redes sociales (Open Graph, Twitter Cards)';