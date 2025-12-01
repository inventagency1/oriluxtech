-- Arreglar Security Definer View Issue
-- Las vistas no deben ser SECURITY DEFINER, deben heredar permisos del usuario

-- Eliminar la vista anterior y recrearla sin SECURITY DEFINER
DROP VIEW IF EXISTS public.certificate_verification CASCADE;

-- Recrear vista como vista normal (sin SECURITY DEFINER)
CREATE VIEW public.certificate_verification 
WITH (security_barrier = true) -- Asegurar que las políticas RLS se apliquen
AS
SELECT 
  nc.certificate_id,
  nc.created_at,
  nc.verification_date,
  nc.verification_url,
  nc.qr_code_url,
  nc.jewelry_item_id,
  nc.is_verified,
  -- NO exponer datos sensibles: contract_address, transaction_hash, token_id, metadata_uri, user_id, owner_id
  ji.name as jewelry_name,
  ji.type as jewelry_type,
  ji.main_image_url as jewelry_image
FROM public.nft_certificates nc
LEFT JOIN public.jewelry_items ji ON nc.jewelry_item_id = ji.id
WHERE nc.is_verified = true;

-- Permitir acceso público a la vista de verificación
GRANT SELECT ON public.certificate_verification TO anon;
GRANT SELECT ON public.certificate_verification TO authenticated;

-- Comentario de seguridad
COMMENT ON VIEW public.certificate_verification IS 
'Vista pública segura para verificación de certificados. Solo expone datos no sensibles. Security barrier habilitado para RLS.';