-- ============================================
-- RESET PRODUCTION DATABASE - VERALIX
-- Fecha: 2025-11-27
-- ============================================

-- ⚠️ ADVERTENCIA: Este script borra TODOS los datos de producción
-- Solo ejecutar si estás seguro de querer reiniciar

-- 1. Deshabilitar triggers temporalmente
SET session_replication_role = 'replica';

-- 2. Limpiar tablas de datos (en orden por dependencias)
TRUNCATE TABLE public.nft_certificates CASCADE;
TRUNCATE TABLE public.jewelry_items CASCADE;
TRUNCATE TABLE public.marketplace_listings CASCADE;
TRUNCATE TABLE public.marketplace_messages CASCADE;
TRUNCATE TABLE public.certificate_transactions CASCADE;
TRUNCATE TABLE public.certificate_packages CASCADE;
TRUNCATE TABLE public.user_subscriptions CASCADE;
TRUNCATE TABLE public.payment_transactions CASCADE;
TRUNCATE TABLE public.audit_logs CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 3. Rehabilitar triggers
SET session_replication_role = 'origin';

-- 4. Eliminar usuarios de auth (esto requiere permisos de service_role)
-- Los usuarios se eliminarán manualmente desde el dashboard de Supabase
-- o se pueden mantener y solo resetear sus datos

-- ============================================
-- NOTA: Los usuarios deben registrarse de nuevo
-- Después de registrarse, ejecutar el siguiente script
-- para asignarles el rol de admin
-- ============================================
