# 🔧 Guía de Solución de Problemas - Pasarela de Pago Wompi

## 📅 Fecha: 17 de Noviembre, 2025

---

## ✅ Mejoras Implementadas

### 1. **Optimización de Carga del Script de Wompi**
**Archivo modificado:** `index.html`

**Cambio realizado:**
```html
<!-- ANTES -->
<script src="https://checkout.wompi.co/widget.js"></script>

<!-- DESPUÉS -->
<script src="https://checkout.wompi.co/widget.js" async defer crossorigin="anonymous"></script>
```

**Beneficios:**
- ✅ Carga asíncrona que no bloquea el renderizado de la página
- ✅ Mejor rendimiento general de la aplicación
- ✅ Manejo de CORS mejorado

---

### 2. **Mejora en el Manejo de Errores del Widget**
**Archivo:** `src/hooks/useWompiWidget.tsx`

**Funcionalidad añadida:**
- Espera inteligente para la carga del script (hasta 10 intentos)
- Logs detallados en cada paso del proceso
- Validaciones robustas antes de abrir el widget
- Manejo de errores con mensajes claros para el usuario

**Código clave:**
```typescript
const waitForWidget = (maxAttempts = 10, interval = 500): Promise<boolean> => {
  return new Promise((resolve) => {
    let attempts = 0;
    const checkWidget = () => {
      attempts++;
      if (window.WidgetCheckout) {
        resolve(true);
      } else if (attempts >= maxAttempts) {
        resolve(false);
      } else {
        setTimeout(checkWidget, interval);
      }
    };
    checkWidget();
  });
};
```

---

## 🔍 Herramientas de Diagnóstico Disponibles

### 1. **Página de Diagnóstico de Wompi**
**URL:** `/wompi-diagnostics`

Esta página te permite:
- ✅ Verificar configuración de claves API
- ✅ Probar creación de transacciones
- ✅ Validar acceptance token
- ✅ Ver información del merchant
- ✅ Obtener recomendaciones específicas

**Cómo usar:**
1. Navega a `/wompi-diagnostics` en tu aplicación
2. Haz clic en "🚀 Ejecutar Diagnóstico Completo"
3. Revisa los resultados y recomendaciones

---

### 2. **Panel de Monitoreo de Wompi**
**URL:** `/admin/wompi-monitoring`

Permite monitorear:
- 📊 Pagos pendientes
- 📨 Webhooks recibidos
- ✅ Compras completadas
- ❌ Errores en procesamiento

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: Widget de Wompi no se abre

**Síntomas:**
- El botón de pago no responde
- Consola muestra: `⚠️ Wompi Widget not loaded yet`

**Soluciones:**

1. **Verificar bloqueadores de anuncios**
   - Desactiva AdBlock, uBlock Origin u otros bloqueadores
   - Añade `checkout.wompi.co` a la lista blanca

2. **Verificar consola del navegador**
   ```javascript
   // Abre DevTools (F12) y ejecuta:
   console.log('Widget disponible:', !!window.WidgetCheckout);
   ```

3. **Verificar dominios permitidos en Wompi Dashboard**
   - Ve a: https://comercios.wompi.co
   - Configuración → Dominios permitidos
   - Asegúrate de tener:
     - `*.lovableproject.com`
     - `veralix.io`
     - `*.supabase.co`
     - `localhost` (para desarrollo)

4. **Limpiar caché del navegador**
   - Ctrl + Shift + Delete
   - Selecciona "Caché" y "Cookies"
   - Recarga la página con Ctrl + Shift + R

---

### Problema 2: Pago completado pero certificados no se otorgan

**Síntomas:**
- Pago aparece como exitoso en Wompi
- Los certificados no se acreditan a la cuenta
- `pending_payment` no se elimina

**Diagnóstico:**

1. **Verificar logs de webhooks en Supabase**
   ```sql
   SELECT * FROM wompi_webhook_logs 
   WHERE order_id = 'TU_ORDER_ID'
   ORDER BY created_at DESC;
   ```

2. **Verificar si el webhook llegó**
   - Si NO hay registro → Problema con URL de eventos
   - Si hay registro pero `processed = false` → Error en procesamiento
   - Si `signature_valid = false` → Problema con secret

**Soluciones:**

1. **Verificar URL de eventos en Wompi Dashboard**
   - URL correcta: `https://hykegpmjnpaupvwptxtl.supabase.co/functions/v1/wompi-payments`
   - ⚠️ NO debe tener `/webhook` al final
   - ⚠️ Debe usar HTTPS, no HTTP

2. **Verificar Secrets en Supabase**
   ```bash
   # Ir a: Supabase Dashboard → Edge Functions → Secrets
   # Verificar que existan:
   WOMPI_PUBLIC_KEY=pub_prod_XXXXXXXX
   WOMPI_PRIVATE_KEY=prv_prod_XXXXXXXX
   WOMPI_EVENTS_SECRET=events_XXXXXXXX
   ```

3. **Ver logs del Edge Function**
   - Supabase Dashboard → Edge Functions → wompi-payments → Logs
   - Buscar errores relacionados con el order_id

---

### Problema 3: Error de monto inválido

**Síntomas:**
- Error: `amount_in_cents must be at least 100`
- Monto mostrado en Wompi no coincide

**Solución:**

Verificar conversión a centavos en `CertificateBundleCheckout.tsx`:

```typescript
// ✅ CORRECTO
const amount = parseFloat(pkg.price.replace(/\./g, '')); // Elimina TODOS los puntos
const amountInCents = Math.round(totalAmount * 100);

// ❌ INCORRECTO
const amount = parseFloat(pkg.price); // No elimina puntos de miles
const amountInCents = totalAmount; // Falta multiplicar por 100
```

---

### Problema 4: Error de clave pública inválida

**Síntomas:**
- Error: `Clave pública de Wompi inválida`
- Widget no se abre

**Solución:**

1. **Verificar formato de la clave**
   - Debe empezar con `pub_prod_` (producción)
   - O `pub_test_` (pruebas)

2. **Verificar variable de entorno**
   ```env
   # Archivo .env
   VITE_WOMPI_PUBLIC_KEY="pub_prod_XHaKFhY9SF4YB3GSxBhm7o1kCxr7a1OQ"
   ```

3. **Recargar servidor de desarrollo**
   ```bash
   # Detener servidor (Ctrl + C)
   # Reiniciar
   npm run dev
   ```

4. **Verificar en código**
   ```typescript
   // En CertificateBundleCheckout.tsx
   console.log('Clave pública:', import.meta.env.VITE_WOMPI_PUBLIC_KEY);
   ```

---

## 📋 Checklist de Configuración Completa

### Frontend (.env)
```env
VITE_SUPABASE_URL="https://hykegpmjnpaupvwptxtl.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_WOMPI_PUBLIC_KEY="pub_prod_XHaKFhY9SF4YB3GSxBhm7o1kCxr7a1OQ"
```

### Backend (Supabase Edge Functions Secrets)
```bash
WOMPI_PUBLIC_KEY=pub_prod_XXXXXXXX
WOMPI_PRIVATE_KEY=prv_prod_XXXXXXXX
WOMPI_EVENTS_SECRET=events_XXXXXXXX
WOMPI_INTEGRITY_SECRET=integrity_XXXXXXXX
```

### Wompi Dashboard
- [ ] Cuenta verificada
- [ ] Modo producción activado
- [ ] Dominios permitidos configurados
- [ ] URL de eventos configurada
- [ ] Eventos suscritos: `transaction.updated`, `transaction.created`
- [ ] Límites de transacción configurados

---

## 🧪 Pruebas Recomendadas

### 1. Prueba de Widget
```javascript
// En la consola del navegador (F12):
console.log('Widget cargado:', !!window.WidgetCheckout);
console.log('Tipo:', typeof window.WidgetCheckout);
```

### 2. Prueba de Configuración
1. Ve a `/wompi-diagnostics`
2. Ejecuta diagnóstico completo
3. Verifica que todos los checks estén en verde

### 3. Prueba de Pago Real (⚠️ Cobra dinero real)
1. Selecciona el paquete más económico
2. Completa el checkout
3. Usa PSE con banco de pruebas (si disponible)
4. Verifica que los certificados se acrediten

### 4. Prueba de Webhook
```sql
-- Después de un pago, verificar:
SELECT * FROM wompi_webhook_logs 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar que processed = true
-- Verificar que signature_valid = true
```

---

## 📞 Contacto y Soporte

### Wompi
- **Dashboard:** https://comercios.wompi.co
- **Documentación:** https://docs.wompi.co
- **Soporte:** soporte@wompi.co
- **Teléfono:** +57 (1) 234 5678

### Supabase
- **Dashboard:** https://supabase.com/dashboard
- **Documentación:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com

---

## 🔄 Próximos Pasos Recomendados

1. **Ejecutar diagnóstico**
   - Ve a `/wompi-diagnostics`
   - Ejecuta el diagnóstico completo
   - Anota cualquier error o advertencia

2. **Verificar configuración en Wompi Dashboard**
   - Revisa dominios permitidos
   - Verifica URL de eventos
   - Confirma que estás en modo producción

3. **Probar con una transacción pequeña**
   - Usa el paquete más económico
   - Monitorea logs en tiempo real
   - Verifica que el webhook llegue

4. **Configurar monitoreo**
   - Revisa el panel de monitoreo diariamente
   - Configura alertas para pagos pendientes antiguos
   - Monitorea webhooks no procesados

---

## 📊 Queries Útiles para Debugging

```sql
-- Ver pagos pendientes antiguos (más de 1 hora)
SELECT * FROM pending_payments 
WHERE created_at < NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Ver webhooks no procesados
SELECT * FROM wompi_webhook_logs 
WHERE processed = false
ORDER BY created_at DESC;

-- Ver webhooks con errores
SELECT * FROM wompi_webhook_logs 
WHERE processing_error IS NOT NULL
ORDER BY created_at DESC;

-- Ver compras de hoy
SELECT * FROM certificate_purchases 
WHERE purchased_at::date = CURRENT_DATE
ORDER BY purchased_at DESC;

-- Ver últimas transacciones con detalles
SELECT 
  wl.event_type,
  wl.transaction_id,
  wl.status,
  wl.reference,
  wl.amount_in_cents / 100 as amount_cop,
  wl.processed,
  wl.signature_valid,
  wl.created_at
FROM wompi_webhook_logs wl
ORDER BY wl.created_at DESC
LIMIT 10;
```

---

## ✨ Mejoras Futuras Sugeridas

1. **Notificaciones automáticas**
   - Alertas por email cuando un webhook falla
   - Notificaciones de pagos pendientes antiguos

2. **Dashboard mejorado**
   - Gráficos de pagos por día/semana/mes
   - Estadísticas de conversión
   - Análisis de métodos de pago más usados

3. **Retry automático de webhooks**
   - Sistema de reintentos para webhooks fallidos
   - Cola de procesamiento con backoff exponencial

4. **Ambiente de pruebas**
   - Solicitar cuenta de pruebas a Wompi
   - Configurar ambiente staging separado

---

## 📝 Notas Importantes

⚠️ **IMPORTANTE:** Wompi NO tiene ambiente sandbox. Todas las transacciones en producción son reales y cobran dinero real.

⚠️ **SEGURIDAD:** Nunca expongas las claves privadas en el frontend. Solo la clave pública debe estar en variables de entorno del frontend.

⚠️ **WEBHOOKS:** Los webhooks son críticos para el funcionamiento. Si no llegan, los pagos no se procesarán automáticamente.

---

## 📚 Documentación Adicional

- [Integración de Wompi - Documentación Técnica](./docs/WOMPI_INTEGRATION.md)
- [Documentación oficial de Wompi](https://docs.wompi.co)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Última actualización:** 17 de Noviembre, 2025
**Versión:** 1.0.0
