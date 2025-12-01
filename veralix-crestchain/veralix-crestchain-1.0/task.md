
# Tareas de Migración (task.md)

Ubicación: /Volumes/DATOS/veralix/repos/veralix-certify-your-sparkle
Rama: integracion-crestchain

## Lista de tareas
- Configurar secrets en Supabase (SERVICE_ROLE, RPC, CONTRACT, PRIVATE_KEY)
- Servir funciones localmente para pruebas: mint-nft-crestchain, crestchain-webhook
- Generar tipos TS desde Supabase (MCP token) → src/integrations/supabase/types.ts
- Verificar flujo OriluxchainTesting: crear joya, generar certificado, mintear, validar DB
- Habilitar feature flag para usar mint crestchain en `useNFTCertificate`
- Integrar UI productiva bajo flag sin romper el flujo actual
- Push rama `integracion-crestchain` y crear PR
- Preparar checklist de seguridad (docs/SECURITY_TESTING.md)
- Resolver PWA SW MIME en dev (opcional)
- Resolver warnings de deprecación (npm audit, dependencias)

## Comandos útiles
- supabase functions serve mint-nft-crestchain
- supabase functions serve crestchain-webhook
- npx supabase gen types typescript --project-id <PROJECT_ID> > src/integrations/supabase/types.ts
- npm run dev -- --port 8082
- git push origin integracion-crestchain
