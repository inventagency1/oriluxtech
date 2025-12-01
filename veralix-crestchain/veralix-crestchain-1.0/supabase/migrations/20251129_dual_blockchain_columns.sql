-- ============================================================
-- MIGRACIÓN: Agregar columnas para Dual-Blockchain (Oriluxchain + CrestChain)
-- Fecha: 2025-11-29
-- ============================================================

-- ============================================================
-- 1. AGREGAR COLUMNAS A nft_certificates
-- ============================================================

-- Columnas para Oriluxchain
ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS orilux_tx_hash TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS orilux_token_id TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS orilux_block_number TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS orilux_verification_url TEXT;

-- Columnas para CrestChain
ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS crestchain_tx_hash TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS crestchain_token_id TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS crestchain_block_number TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS crestchain_contract_address TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS crestchain_verification_url TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS crestchain_network TEXT DEFAULT 'CrestChain';

-- Columnas adicionales para dual-blockchain
ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS dual_verification BOOLEAN DEFAULT true;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS certificate_view_url TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS blockchain_verification_url TEXT;

ALTER TABLE public.nft_certificates 
ADD COLUMN IF NOT EXISTS social_image_url TEXT;

-- ============================================================
-- 2. AGREGAR COLUMNAS A jewelry_items
-- ============================================================

-- Columnas para Oriluxchain
ALTER TABLE public.jewelry_items 
ADD COLUMN IF NOT EXISTS orilux_certificate_id TEXT;

ALTER TABLE public.jewelry_items 
ADD COLUMN IF NOT EXISTS orilux_tx_hash TEXT;

ALTER TABLE public.jewelry_items 
ADD COLUMN IF NOT EXISTS orilux_verification_url TEXT;

-- Columnas para CrestChain
ALTER TABLE public.jewelry_items 
ADD COLUMN IF NOT EXISTS crestchain_certificate_id TEXT;

ALTER TABLE public.jewelry_items 
ADD COLUMN IF NOT EXISTS crestchain_tx_hash TEXT;

ALTER TABLE public.jewelry_items 
ADD COLUMN IF NOT EXISTS crestchain_verification_url TEXT;

-- Columna de estado de certificación
ALTER TABLE public.jewelry_items 
ADD COLUMN IF NOT EXISTS is_certified BOOLEAN DEFAULT false;

-- ============================================================
-- 3. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_nft_certificates_orilux_tx 
ON public.nft_certificates(orilux_tx_hash);

CREATE INDEX IF NOT EXISTS idx_nft_certificates_crestchain_tx 
ON public.nft_certificates(crestchain_tx_hash);

CREATE INDEX IF NOT EXISTS idx_nft_certificates_dual_verification 
ON public.nft_certificates(dual_verification);

CREATE INDEX IF NOT EXISTS idx_jewelry_items_is_certified 
ON public.jewelry_items(is_certified);

-- ============================================================
-- 4. ACTUALIZAR POLÍTICAS RLS (si es necesario)
-- ============================================================

-- Las políticas existentes deberían cubrir las nuevas columnas
-- ya que operan a nivel de fila, no de columna.

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- Ejecutar después de la migración para verificar:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'nft_certificates' ORDER BY ordinal_position;

