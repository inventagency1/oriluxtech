-- Migration: Add DIAN fiscal fields for electronic invoicing compliance (FIXED)
-- Adds invoice tracking to transactions and fiscal data to profiles

-- 1. Add DIAN invoice fields to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS cufe TEXT,
ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS invoice_xml_url TEXT,
ADD COLUMN IF NOT EXISTS dian_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS invoice_issued_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS customer_tax_id TEXT;

-- Add unique constraint for cufe
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_cufe_unique UNIQUE (cufe);

-- Add index for invoice lookups
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_number ON public.transactions(invoice_number);
CREATE INDEX IF NOT EXISTS idx_transactions_cufe ON public.transactions(cufe);
CREATE INDEX IF NOT EXISTS idx_transactions_dian_status ON public.transactions(dian_status);

-- Add comments for documentation
COMMENT ON COLUMN public.transactions.invoice_number IS 'DIAN electronic invoice number';
COMMENT ON COLUMN public.transactions.cufe IS 'Código Único de Factura Electrónica - DIAN unique code';
COMMENT ON COLUMN public.transactions.invoice_pdf_url IS 'URL to downloadable invoice PDF';
COMMENT ON COLUMN public.transactions.invoice_xml_url IS 'URL to DIAN XML invoice file';
COMMENT ON COLUMN public.transactions.dian_status IS 'Invoice status: pending, issued, failed, cancelled';
COMMENT ON COLUMN public.transactions.invoice_issued_at IS 'Timestamp when invoice was issued to DIAN';
COMMENT ON COLUMN public.transactions.customer_tax_id IS 'Customer NIT/Cédula for invoice';

-- 2. Add fiscal fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS tax_regime TEXT DEFAULT 'simplified',
ADD COLUMN IF NOT EXISTS fiscal_address JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS fiscal_data_verified BOOLEAN DEFAULT false;

-- Add index for tax_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tax_id ON public.profiles(tax_id);

-- Add comments
COMMENT ON COLUMN public.profiles.tax_id IS 'NIT or Cédula for DIAN invoicing';
COMMENT ON COLUMN public.profiles.tax_regime IS 'Tax regime: simplified, common, special';
COMMENT ON COLUMN public.profiles.fiscal_address IS 'Complete fiscal address for invoicing: {street, city, department, country, postal_code}';
COMMENT ON COLUMN public.profiles.fiscal_data_verified IS 'Whether fiscal data has been verified for invoicing';