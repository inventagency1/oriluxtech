
-- ============================================================================
-- MIGRATION: Correcciones de Seguridad del Linter
-- ============================================================================
-- Objetivo: Resolver todos los warnings/errors del Supabase Linter
-- 
-- 1. Habilitar RLS en vistas públicas (certificate_verification, marketplace_public_listings)
-- 2. Agregar search_path a función update_waitlist_updated_at
-- 3. Documentar Leaked Password Protection (se habilita en Auth UI)
-- ============================================================================

-- ============================================================================
-- PARTE 1: Habilitar RLS en vistas públicas
-- ============================================================================
-- Estas vistas son intencionalmente públicas, pero necesitan políticas RLS
-- explícitas para cumplir con las mejores prácticas de seguridad

-- Vista: certificate_verification
-- Propósito: Permitir verificación pública de certificados
ALTER VIEW certificate_verification SET (security_invoker = on);

-- Vista: marketplace_public_listings  
-- Propósito: Permitir visualización pública de listings activos
ALTER VIEW marketplace_public_listings SET (security_invoker = on);

-- ============================================================================
-- PARTE 2: Agregar search_path a función trigger
-- ============================================================================
-- Función: update_waitlist_updated_at
-- Propósito: Actualizar timestamp updated_at en tabla waitlist_entries

CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PARTE 3: Documentación de Leaked Password Protection
-- ============================================================================
-- NOTA IMPORTANTE: 
-- El warning "Leaked Password Protection Disabled" debe resolverse manualmente
-- en el dashboard de Supabase:
-- 
-- 1. Ir a: https://supabase.com/dashboard/project/hykegpmjnpaupvwptxtl/auth/providers
-- 2. Scroll hasta "Security and Protection"
-- 3. Habilitar "Leaked Password Protection"
-- 4. Esto protegerá contra contraseñas comprometidas usando la API de HaveIBeenPwned
-- ============================================================================

-- Log de auditoría para esta migración de seguridad
DO $$
BEGIN
  -- Solo insertar si existe un usuario autenticado
  IF current_setting('request.jwt.claims', true)::json->>'sub' IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
      'security_hardening',
      'system',
      'linter_fixes',
      jsonb_build_object(
        'fixes_applied', ARRAY[
          'enabled_security_invoker_on_certificate_verification_view',
          'enabled_security_invoker_on_marketplace_public_listings_view',
          'added_search_path_to_update_waitlist_updated_at_function'
        ],
        'manual_action_required', 'Enable Leaked Password Protection in Supabase Auth UI',
        'migration_date', now()
      )
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Si falla el log de auditoría, continuar con la migración
    NULL;
END $$;
