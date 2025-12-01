-- ============================================================
-- FIX: Agregar valores al ENUM blockchain_network
-- El ENUM original solo tiene: ethereum, solana, polygon
-- Necesitamos agregar: crestchain, oriluxchain, dual
-- ============================================================

-- Agregar nuevos valores al ENUM
ALTER TYPE public.blockchain_network ADD VALUE IF NOT EXISTS 'crestchain';
ALTER TYPE public.blockchain_network ADD VALUE IF NOT EXISTS 'oriluxchain';
ALTER TYPE public.blockchain_network ADD VALUE IF NOT EXISTS 'dual';

-- Alternativa: Si el ALTER TYPE falla, cambiar la columna a TEXT
-- ALTER TABLE public.nft_certificates ALTER COLUMN blockchain_network TYPE TEXT;
