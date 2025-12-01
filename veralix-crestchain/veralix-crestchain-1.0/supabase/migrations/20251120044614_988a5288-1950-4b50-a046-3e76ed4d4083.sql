-- =====================================================
-- MIGRACIÓN DE SEGURIDAD: Corregir exposición de datos
-- =====================================================

-- 1. BLOQUEAR ACCESO PÚBLICO A PROFILES
-- Problema: Tabla profiles expuesta públicamente con datos PII
-- Solución: Denegar acceso anónimo explícitamente

CREATE POLICY "Block public access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 2. ELIMINAR POLÍTICA PELIGROSA EN NFT_CERTIFICATES
-- Problema: Política "Anyone can verify certificates publicly" expone owner_id, user_id, transaction_hash
-- Solución: Eliminar política. La verificación pública se hace a través de certificate_verification view

DROP POLICY IF EXISTS "Anyone can verify certificates publicly" ON public.nft_certificates;

-- 3. VERIFICAR CERTIFICATE_VERIFICATION VIEW (Ya existe, solo documentamos)
-- La view certificate_verification ya está implementada correctamente y solo expone:
-- - certificate_id, verification_url, qr_code_url, is_verified, created_at
-- - jewelry_name, jewelry_type, jewelry_image
-- NO expone: owner_id, user_id, transaction_hash, contract_address, token_id

-- Log de auditoría para el cambio de seguridad
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'audit_logs') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, -- Sistema
      'security_hardening',
      'system',
      'rls_policies',
      jsonb_build_object(
        'changes', ARRAY[
          'Added anon blocking policy to profiles table',
          'Removed overly permissive nft_certificates public policy'
        ],
        'reason', 'Prevent PII and sensitive blockchain data exposure',
        'timestamp', now()
      )
    );
  END IF;
END $$;