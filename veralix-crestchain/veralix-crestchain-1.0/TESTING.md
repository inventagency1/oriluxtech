# Usuarios de Testing - Veralix

## Credenciales de Testing

### 1. Administrador
- **Email:** `admin@veralix-test.com`
- **Contraseña:** `Testing2025!`
- **Rol:** admin
- **Propósito:** Gestionar usuarios, aprobar joyeros, ver estadísticas del sistema

### 2. Joyero
- **Email:** `joyero@veralix-test.com`
- **Contraseña:** `Testing2025!`
- **Rol:** joyero
- **Propósito:** Crear joyas, generar certificados NFT, vender en marketplace

### 3. Cliente
- **Email:** `cliente@veralix-test.com`
- **Contraseña:** `Testing2025!`
- **Rol:** cliente
- **Propósito:** Comprar joyas, verificar certificados, dejar reviews

---

## Pasos para Configurar los Usuarios

### Paso 1: Crear las 3 Cuentas
1. Ve a la página de registro: `/register`
2. Crea cada cuenta con los emails y contraseña indicados arriba
3. Usa cualquier nombre (ej: "Admin Test", "Joyero Test", "Cliente Test")

### Paso 2: Obtener los UUIDs
1. Ve al [Panel de Usuarios de Supabase](https://supabase.com/dashboard/project/hykegpmjnpaupvwptxtl/auth/users)
2. Busca cada email y copia su UUID
3. Anota los UUIDs:
   - Admin UUID: `_______________`
   - Joyero UUID: `_______________`
   - Cliente UUID: `_______________`

### Paso 3: Asignar Roles con SQL
1. Ve al [SQL Editor de Supabase](https://supabase.com/dashboard/project/hykegpmjnpaupvwptxtl/sql/new)
2. Ejecuta estos queries (reemplaza los UUIDs con los reales):

```sql
-- Asignar rol de ADMIN
SELECT testing_change_role('REEMPLAZAR-CON-UUID-ADMIN', 'admin'::app_role);

-- Asignar rol de JOYERO
SELECT testing_change_role('REEMPLAZAR-CON-UUID-JOYERO', 'joyero'::app_role);

-- Asignar rol de CLIENTE (opcional, ya es el rol por defecto)
SELECT testing_change_role('REEMPLAZAR-CON-UUID-CLIENTE', 'cliente'::app_role);
```

### Paso 4: Verificar los Roles
Ejecuta este query para confirmar que los roles se asignaron correctamente:

```sql
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email IN (
  'admin@veralix-test.com',
  'joyero@veralix-test.com',
  'cliente@veralix-test.com'
)
ORDER BY ur.role;
```

### Paso 5: Configurar Perfiles

#### Para el Admin:
1. Login como admin
2. Ve a `/profile`
3. Completa información básica
4. **No necesita WhatsApp**

#### Para el Joyero:
1. Login como joyero
2. Ve a `/profile`
3. Completa toda la información:
   - Nombre del negocio
   - Descripción
   - **WhatsApp (REQUERIDO):** Usa formato `+57XXXXXXXXXX`
   - País: Colombia
4. El estado de cuenta debe ser "active" (aprobado)

#### Para el Cliente:
1. Login como cliente
2. Ve a `/profile`
3. Completa información básica
4. Agrega dirección de envío si quieres probar compras

---

## Flujos de Testing Recomendados

### 1. Flujo de Certificación NFT (Joyero → Cliente)
1. **Como Joyero:**
   - Crear una joya nueva
   - Generar certificado NFT
   - Publicar en marketplace
2. **Como Cliente:**
   - Buscar la joya en marketplace
   - Ver el certificado
   - Verificar autenticidad con QR

### 2. Flujo de Compra-Venta
1. **Como Joyero:**
   - Crear listing en marketplace
2. **Como Cliente:**
   - Comprar el producto
   - Enviar mensaje al vendedor
   - Dejar review después de recibir
3. **Como Joyero:**
   - Ver orden
   - Comunicarse con comprador
   - Marcar como enviado

### 3. Flujo de Administración
1. **Como Admin:**
   - Ver estadísticas del sistema
   - Gestionar usuarios en User Management
   - Aprobar/rechazar solicitudes de cambio de rol
   - Ver audit logs

---

## Notas Importantes

⚠️ **SEGURIDAD:**
- Estos usuarios son SOLO para testing
- NO usar en producción con datos reales
- La función `testing_change_role` bypasea seguridad - usar SOLO en desarrollo

✅ **PRODUCCIÓN:**
- Los usuarios reales SIEMPRE empiezan como "cliente"
- Para ser joyero: solicitar cambio de rol desde `/profile`
- Solo admins pueden aprobar cambios a joyero
- NADIE puede auto-promocionarse a admin

📝 **MANTENIMIENTO:**
- Puedes resetear estos usuarios borrándolos y recreándolos
- Si olvidas las contraseñas, usa "Recuperar contraseña"
- Para cambiar roles de nuevo, usa `testing_change_role` en SQL

---

## Solución de Problemas

### El joyero no puede crear certificados
- Verificar que el estado de cuenta sea "active"
- Verificar que tenga WhatsApp configurado
- Verificar que el rol sea efectivamente "joyero" en la DB

### El admin no ve el panel de administración
- Verificar con el SQL query que el rol sea "admin"
- Logout y login de nuevo
- Limpiar localStorage y cookies

### No puedo cambiar entre cuentas
- Siempre hacer logout completo antes de cambiar
- Usar modo incógnito para tener múltiples sesiones simultáneas
- O usar diferentes navegadores para cada cuenta
