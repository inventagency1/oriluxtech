
# Faltante para la Migración Completa

## Conexiones y Secrets
- Falta confirmar y cargar en Supabase:
  - SUPABASE_SERVICE_ROLE_KEY
  - BSC_TESTNET_RPC_URL
  - VERALIX_CONTRACT_ADDRESS
  - SYSTEM_PRIVATE_KEY
- Falta habilitar MCP SUPABASE_ACCESS_TOKEN para listar tablas y generar tipos.

## Datos (3000 NFTs y metadatos)
- No existe en este repo una carpeta con 3000 NFTs y sus metadatos.
- Plan: importar dataset desde origen y ubicarlo en `data/nfts/` (local) y/o bucket `nft-metadata` en Supabase Storage.
- Acciones:
  - Definir formato JSON para metadatos (ERC-721 compatible).
  - Subir a Storage y guardar URIs en `nft_certificates.metadata_uri`.

## Integración UI Productiva
- Crear flag (ej. `CRESTCHAIN_ENABLED`) y adaptar `useNFTCertificate` para usar `mint.ts` bajo flag.
- Añadir controles y feedback de minteo en componentes existentes.

## Tipos TS y Validaciones
- Generar tipos TS del proyecto y sincronizar modelos.
- Ejecutar pruebas de seguridad SQL (docs/SECURITY_TESTING.md) y validar RLS.

## DevOps y Código
- Push rama `integracion-crestchain` y PR.
- Ajustar CI para funciones y deploy.
- Revisar PWA SW en dev.
- Reducir warnings de deprecación.
