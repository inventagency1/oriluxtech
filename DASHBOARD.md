# 🎨 Dashboard de Oriluxchain

Dashboard web moderno y en tiempo real para visualizar y gestionar tu blockchain Oriluxchain.

## 🌟 Características

### Visualización en Tiempo Real
- **Blockchain completa**: Visualiza todos los bloques con sus hashes, proof of work y transacciones
- **Auto-refresh**: Actualización automática cada 10 segundos
- **Animaciones suaves**: Transiciones y efectos visuales modernos

### Gestión de Transacciones
- **Crear transacciones**: Formulario intuitivo para enviar OLX entre direcciones
- **Transacciones pendientes**: Vista de todas las transacciones esperando ser minadas
- **Historial completo**: Todas las transacciones confirmadas en cada bloque

### Minería
- **Minado con un clic**: Botón para minar bloques instantáneamente
- **Tiempo de minado**: Visualiza cuánto tarda en minar cada bloque
- **Recompensas**: Recibe 50 OLX por cada bloque minado

### Información del Nodo
- **Estadísticas en vivo**: Longitud de cadena, dificultad, transacciones totales
- **Wallet del nodo**: Dirección y balance actualizados
- **Nodos conectados**: Cantidad de peers en la red P2P

## 🚀 Cómo Usar

### 1. Iniciar el Servidor

```bash
python main.py --port 5000 --difficulty 3
```

### 2. Abrir el Dashboard

Abre tu navegador en: **http://localhost:5000**

### 3. Funcionalidades Principales

#### Crear una Transacción
1. Completa el formulario en la parte inferior:
   - **Remitente**: Dirección de origen
   - **Destinatario**: Dirección de destino
   - **Cantidad**: Monto en OLX
2. Haz clic en "Enviar Transacción"
3. La transacción aparecerá en "Pendientes"

#### Minar un Bloque
1. Haz clic en el botón "⛏️ Minar Bloque"
2. Espera mientras se encuentra el proof of work
3. El nuevo bloque aparecerá en la blockchain
4. Tu wallet recibirá 50 OLX de recompensa

#### Ver Detalles de Bloques
- Cada bloque muestra:
  - **Índice**: Posición en la cadena
  - **Hash**: Identificador único del bloque
  - **Hash anterior**: Enlace con el bloque previo
  - **Proof**: Número encontrado por el algoritmo PoW
  - **Transacciones**: Cantidad de transacciones incluidas
  - **Timestamp**: Fecha y hora de creación

## 🎨 Interfaz

### Secciones del Dashboard

1. **Header**: Título y descripción de Oriluxchain
2. **Estadísticas**: 4 tarjetas con métricas clave
3. **Blockchain**: Visualización de todos los bloques
4. **Mi Wallet**: Información de tu wallet y botón de minería
5. **Pendientes**: Transacciones esperando confirmación
6. **Nueva Transacción**: Formulario para crear transacciones

### Características Visuales

- **Gradientes modernos**: Colores púrpura y azul
- **Animaciones**: Efectos de entrada y hover
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Tipografía**: Fuente Inter para mejor legibilidad
- **Iconos**: Emojis para identificación rápida

## ⚙️ Configuración

### Auto-refresh
Activa/desactiva la actualización automática con el checkbox en la sección de Blockchain.

### Dificultad de Minería
Ajusta la dificultad al iniciar el servidor:

```bash
# Dificultad baja (más rápido)
python main.py --difficulty 2

# Dificultad media (recomendado)
python main.py --difficulty 3

# Dificultad alta (más lento)
python main.py --difficulty 4
```

## 🔧 Archivos del Dashboard

```
Oriluxchain/
├── templates/
│   └── index.html          # HTML principal
├── static/
│   ├── css/
│   │   └── style.css       # Estilos personalizados
│   └── js/
│       └── app.js          # Lógica del dashboard
└── api.py                  # Backend Flask (modificado)
```

## 📊 API Endpoints Usados

El dashboard consume los siguientes endpoints:

- `GET /?api=true` - Información del nodo
- `GET /chain` - Blockchain completa
- `GET /wallet` - Información de wallet
- `POST /transactions/new` - Crear transacción
- `POST /mine` - Minar bloque
- `GET /balance/:address` - Consultar balance

## 🎯 Próximas Mejoras

- [ ] Gráficos de estadísticas con Chart.js
- [ ] Búsqueda de bloques y transacciones
- [ ] Exportar blockchain a JSON
- [ ] Modo oscuro/claro
- [ ] Notificaciones push para nuevos bloques
- [ ] Visualización de red P2P
- [ ] Panel de administración de nodos

## 💡 Tips

1. **Primero mina, luego transacciona**: Necesitas OLX en tu wallet para enviar
2. **Usa direcciones cortas**: Para pruebas, nombres como "Alice", "Bob" funcionan
3. **Observa el proof**: Números más altos = más trabajo de minería
4. **Auto-refresh**: Déjalo activado para ver cambios en tiempo real

## 🐛 Solución de Problemas

### El dashboard no carga
- Verifica que el servidor esté corriendo en el puerto 5000
- Revisa la consola del navegador para errores

### Las transacciones no aparecen
- Asegúrate de completar todos los campos del formulario
- Verifica que la cantidad sea mayor a 0

### El minado es muy lento
- Reduce la dificultad al iniciar el servidor
- Es normal que tome varios segundos con dificultad 3+

---

**Desarrollado con ❤️ para Oriluxchain**
