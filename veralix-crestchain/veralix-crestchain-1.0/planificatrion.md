
# Plan de Migración Completa (Crestchain + Supabase)

Ubicación de trabajo: /Volumes/DATOS/veralix/repos/veralix-certify-your-sparkle
Rama de trabajo: integracion-crestchain (local). Push al remoto pendiente.
Proyecto Supabase: https://hykegpmjnpaupvwptxtl.supabase.co

## Objetivo
Integrar la creación de NFTs (Crestchain) al frontend descargado y consolidar la lógica de backend en Supabase, sin romper el flujo actual.

## Estado Actual
- Servidor local activo en http://localhost:8082/
- Cliente Supabase lee variables de entorno desde `.env`:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_PUBLISHABLE_KEY
- Lógica Crestchain agregada sin tocar componentes críticos.

## Estructura y Archivos Clave
- Frontend
  - src/integrations/supabase/client.ts → conexión Supabase (usa VITE_*)
  - src/services/crestchain/index.ts → adapter a generate-nft-certificate
  - src/services/crestchain/types.ts → tipos para mint
  - src/services/crestchain/mint.ts → invoca mint-nft-crestchain
  - src/pages/OriluxchainTesting.tsx → flujo de prueba end-to-end con botón “Mintear en Crestchain”
- Backend (Edge Functions)
  - supabase/functions/generate-nft-certificate/index.ts → certificación base (MVP existente)
  - supabase/functions/mint-nft-crestchain/index.ts → minteo en cadena, inserta en nft_certificates
  - supabase/functions/crestchain-webhook/index.ts → verificación/actualización de datos blockchain

## Conexión Supabase
- client.ts: import.meta.env.VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
- Secrets en Supabase requeridos para Edge Functions:
  - SUPABASE_SERVICE_ROLE_KEY
  - BSC_TESTNET_RPC_URL
  - VERALIX_CONTRACT_ADDRESS
  - SYSTEM_PRIVATE_KEY

## Flujo de Datos
1) Usuario crea joya → tabla `jewelry_items`
2) Generación certificado (generate-nft-certificate) → tabla `nft_certificates` (estado pending)
3) Minteo Crestchain (mint-nft-crestchain) → escribe `transaction_hash`, `token_id`, `contract_address`
4) Webhook de verificación (crestchain-webhook) → actualiza `is_verified`, `block_number`, `tx_hash`
5) Realtime UI escucha cambios en `nft_certificates` (CertificateStatusPanel)

## Validación
- Navegar a `/oriluxchain-testing`
- Ejecutar: Crear joya → Generar certificado → Mintear Crestchain → Simular webhook (opcional)
- Confirmar cambios en DB y UI.

## Seguridad
- Sin secretos en el frontend.
- Edge Functions con service role en secrets.
- RLS existente se mantiene; no se cambió.

## Despliegue (cuando corresponda)
- `supabase functions deploy mint-nft-crestchain`
- `supabase functions deploy crestchain-webhook`
- Push rama `integracion-crestchain` y crear PR.

## Notas
- PWA SW warning en dev no afecta.
- Linter muestra issues históricos; no bloquea build.
