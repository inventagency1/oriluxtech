-- ============================================================================
-- MIGRATION: Sistema de Caché para Certificados NFT
-- ============================================================================
-- Objetivo: Reducir latencia de carga de certificados de 3-5s a <500ms
-- Implementa caché de HTML de certificados en Supabase
-- ============================================================================

-- Tabla para cachear HTML de certificados
CREATE TABLE IF NOT EXISTS public.certificate_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text NOT NULL UNIQUE,
  html_content text NOT NULL,
  ipfs_hash text NOT NULL,
  cached_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  access_count integer DEFAULT 0,
  last_accessed_at timestamptz DEFAULT now()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_certificate_cache_certificate_id 
  ON public.certificate_cache(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_cache_expires_at 
  ON public.certificate_cache(expires_at);

-- Comentarios para documentación
COMMENT ON TABLE public.certificate_cache IS 'Caché de HTML de certificados para reducir latencia de carga desde IPFS';
COMMENT ON COLUMN public.certificate_cache.certificate_id IS 'ID del certificado (ej: VRX-001)';
COMMENT ON COLUMN public.certificate_cache.html_content IS 'HTML completo del certificado cacheado';
COMMENT ON COLUMN public.certificate_cache.ipfs_hash IS 'Hash IPFS del certificado original';
COMMENT ON COLUMN public.certificate_cache.access_count IS 'Número de veces que se ha accedido a este caché';

-- Habilitar RLS
ALTER TABLE public.certificate_cache ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Lectura pública (certificados son públicos)
CREATE POLICY "Certificados en caché son públicos para lectura"
  ON public.certificate_cache FOR SELECT
  USING (true);

-- Solo sistema puede insertar en caché (a través de edge functions)
CREATE POLICY "Solo sistema puede insertar en caché"
  ON public.certificate_cache FOR INSERT
  WITH CHECK (false);

-- Solo sistema puede actualizar caché
CREATE POLICY "Solo sistema puede actualizar caché"
  ON public.certificate_cache FOR UPDATE
  USING (false);

-- Función para incrementar contador de accesos al caché
CREATE OR REPLACE FUNCTION public.increment_cache_access(cache_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.certificate_cache
  SET 
    access_count = access_count + 1,
    last_accessed_at = now()
  WHERE id = cache_id;
END;
$$;

-- Comentario en la función
COMMENT ON FUNCTION public.increment_cache_access IS 'Incrementa el contador de accesos al caché de un certificado';

-- Función para limpiar caché expirado (para usar con cron job)
CREATE OR REPLACE FUNCTION public.clean_expired_certificate_cache()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.certificate_cache 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Limpiados % certificados expirados del caché', deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- Comentario en la función
COMMENT ON FUNCTION public.clean_expired_certificate_cache IS 'Elimina certificados expirados del caché. Retorna número de registros eliminados';

-- Trigger para actualizar last_accessed_at en lectura
CREATE OR REPLACE FUNCTION public.update_cache_last_accessed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_cache_timestamp
  BEFORE UPDATE ON public.certificate_cache
  FOR EACH ROW
  WHEN (OLD.access_count IS DISTINCT FROM NEW.access_count)
  EXECUTE FUNCTION public.update_cache_last_accessed();

-- Log de auditoría
INSERT INTO public.audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Sistema
  'cache_system_created',
  'certificate_cache',
  'table_created',
  jsonb_build_object(
    'description', 'Sistema de caché de certificados implementado',
    'expected_performance_improvement', '10x más rápido (3-5s → <500ms)',
    'cache_expiration', '30 días',
    'created_at', now()
  )
);