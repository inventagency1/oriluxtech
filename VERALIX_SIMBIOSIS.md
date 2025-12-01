# ⚡ SIMBIOSIS ORILUXCHAIN ↔️ VERALIX

## ✅ Nuevo Dashboard de Integración

Hemos implementado una interfaz visual exclusiva para monitorizar la "simbiosis" entre Oriluxchain y Veralix.

### 🌐 Acceso
- **URL**: http://localhost:5000/veralix-integration
- **Estado**: Listo para usar

### 🚀 Funcionalidades

1.  **Monitor de Conectividad (En Vivo)**
    - Verifica automáticamente la conexión con Veralix (localhost:8080)
    - Monitoriza el estado de 4 endpoints clave:
        - `/api/veralix/health` (Estado del sistema)
        - `/api/users/packages` (Verificación de cupo)
        - `/api/veralix/sync` (Sincronización de datos)
        - `/api/certificates/create` (Motor de certificación)

2.  **Verificación de Paquetes (Simbiosis de Usuario)**
    - Permite ingresar un ID de usuario de Veralix
    - Consulta si el usuario tiene paquetes/créditos disponibles
    - Muestra visualmente si la solicitud es APROBADA o DENEGADA

3.  **Log de Eventos en Tiempo Real**
    - Muestra una consola de "matrix" con los eventos de integración
    - Confirma la recepción de webhooks y sincronizaciones

### 🛠️ Cómo probar

1.  **Reinicia Oriluxchain**:
    ```bash
    # Detener con CTRL+C y luego:
    python start_with_veralix.py
    ```

2.  **Abre el Dashboard**:
    Ve a `http://localhost:5000/veralix-integration`

3.  **Prueba la Simbiosis**:
    - Verás que los indicadores de conexión se ponen en VERDE si Veralix responde.
    - En "Verificación de Paquetes", escribe cualquier ID (ej: `user123`) y haz clic en "Verificar Cupo".
    - El sistema simulará una consulta a la base de datos de Veralix y te dirá si tiene créditos.

---

**Oriluxchain v1.0 + Veralix Integration Module**
