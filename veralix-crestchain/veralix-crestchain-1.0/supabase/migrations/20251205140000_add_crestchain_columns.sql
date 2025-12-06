-- Agregar columnas de CrestChain a nft_certificates si no existen
DO $$ 
BEGIN
    -- crestchain_tx_hash
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_certificates' AND column_name = 'crestchain_tx_hash') THEN
        ALTER TABLE public.nft_certificates ADD COLUMN crestchain_tx_hash TEXT;
    END IF;

    -- crestchain_token_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_certificates' AND column_name = 'crestchain_token_id') THEN
        ALTER TABLE public.nft_certificates ADD COLUMN crestchain_token_id TEXT;
    END IF;

    -- crestchain_contract_address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_certificates' AND column_name = 'crestchain_contract_address') THEN
        ALTER TABLE public.nft_certificates ADD COLUMN crestchain_contract_address TEXT;
    END IF;

    -- crestchain_block_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_certificates' AND column_name = 'crestchain_block_number') THEN
        ALTER TABLE public.nft_certificates ADD COLUMN crestchain_block_number INTEGER;
    END IF;

    -- crestchain_verification_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_certificates' AND column_name = 'crestchain_verification_url') THEN
        ALTER TABLE public.nft_certificates ADD COLUMN crestchain_verification_url TEXT;
    END IF;

    -- crestchain_network
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_certificates' AND column_name = 'crestchain_network') THEN
        ALTER TABLE public.nft_certificates ADD COLUMN crestchain_network TEXT DEFAULT 'CRESTCHAIN';
    END IF;

    -- dual_verification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nft_certificates' AND column_name = 'dual_verification') THEN
        ALTER TABLE public.nft_certificates ADD COLUMN dual_verification BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Agregar columnas a jewelry_items si no existen
DO $$ 
BEGIN
    -- crestchain_certificate_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jewelry_items' AND column_name = 'crestchain_certificate_id') THEN
        ALTER TABLE public.jewelry_items ADD COLUMN crestchain_certificate_id TEXT;
    END IF;

    -- crestchain_tx_hash
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jewelry_items' AND column_name = 'crestchain_tx_hash') THEN
        ALTER TABLE public.jewelry_items ADD COLUMN crestchain_tx_hash TEXT;
    END IF;

    -- crestchain_verification_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jewelry_items' AND column_name = 'crestchain_verification_url') THEN
        ALTER TABLE public.jewelry_items ADD COLUMN crestchain_verification_url TEXT;
    END IF;
END $$;

-- Comentarios
COMMENT ON COLUMN public.nft_certificates.crestchain_tx_hash IS 'Transaction hash en CrestChain';
COMMENT ON COLUMN public.nft_certificates.crestchain_network IS 'Red de CrestChain utilizada';
COMMENT ON COLUMN public.nft_certificates.dual_verification IS 'True si está verificado en ambas blockchains';
