# 🔌 Configuración Local de Oriluxchain

## ✅ Estado Actual
- **Veralix:** Corriendo en `localhost:8080`
- **Oriluxchain:** Corriendo en `localhost:5000`
- **Endpoint de Integración:** `http://localhost:5000/api/veralix/webhook`

## 🛠️ Cambios Realizados
He modificado la Edge Function `generate-nft-certificate` para soportar entornos locales.

### 1. URL Dinámica
Ahora la función busca la variable de entorno `ORILUXCHAIN_API_URL`.
- Si no existe, usa por defecto: `http://host.docker.internal:5000/api/veralix/webhook`
- Esto permite que Supabase (corriendo en Docker) vea tu `localhost:5000`.

## 🚀 Pasos para Probar la Integración

1. **Asegúrate de que Oriluxchain tenga el endpoint correcto**
   Verificaste `/api/blockchain/info`, pero el endpoint que usa Veralix es:
   `POST /api/veralix/webhook`
   
   Confirma que tu servidor en el puerto 5000 acepte POST en esa ruta.

2. **Configurar Variable (Opcional)**
   Si estás corriendo Supabase localmente con `supabase start`, no necesitas hacer nada más, ya que el fallback `host.docker.internal` funcionará automáticamente.

   Si necesitas cambiar la URL, crea un archivo `.env.local` en la carpeta `supabase/functions`:
   ```env
   ORILUXCHAIN_API_URL=http://host.docker.internal:5000/api/veralix/webhook
   ```

3. **Probar Generación de Certificado**
   - Ve a Veralix (localhost:8080)
   - Crea una joya y genera un certificado
   - Revisa la consola de Oriluxchain (localhost:5000) para ver si llega el request POST.

## 🔍 Debugging

Si ves errores de conexión:
- Verifica que Oriluxchain escuche en `0.0.0.0` y no solo en `127.0.0.1`.
- Revisa los logs de la función: `supabase functions logs generate-nft-certificate --follow`

---
**Nota:** La integración enviará el evento `jewelry_certified` a tu servidor local.
