# Guía de Migración al Nuevo Sistema de Layout

## ✅ ¿Qué hemos logrado con el nuevo sistema?

1. **Header Unificado**: Un solo header responsive que se adapta a móvil y desktop
2. **Sidebar Inteligente**: Menú hamburguesa automático en móvil (<768px) 
3. **Navegación por Roles**: Items específicos según Cliente/Joyero/Admin
4. **Diseño Consistente**: Mismo look & feel en toda la aplicación
5. **Mobile-First**: Optimizado para dispositivos móviles

## 🏗️ Estructura del Nuevo Sistema

```
src/components/layout/
├── AppLayout.tsx          # Layout principal con SidebarProvider
├── AppSidebar.tsx         # Sidebar responsive con navegación por roles
├── UnifiedHeader.tsx      # Header unificado para todas las páginas  
├── NavigationItems.tsx    # Items de navegación organizados
└── MigratedMarketplace.tsx # Ejemplo de migración
```

## 🔄 Cómo Migrar una Página

### Antes (página con header propio):
```tsx
const MiPagina = () => {
  // Header local definido aquí
  const Header = () => (
    <header className="w-full py-4 px-6 flex justify-between items-center...">
      {/* Lógica duplicada de navegación */}
    </header>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Contenido de la página */}
    </div>
  );
};
```

### Después (usando AppLayout):
```tsx
import { AppLayout } from "@/components/layout/AppLayout";

const MiPagina = () => {
  return (
    <AppLayout>
      {/* Solo el contenido específico de la página */}
    </AppLayout>
  );
};
```

## 📱 Beneficios del Nuevo Sistema

### Mobile Responsive
- **< 768px**: Sidebar se convierte en menú hamburguesa automáticamente
- **> 768px**: Sidebar visible, colapsible con icono
- **Header**: Se adapta ocultando elementos no esenciales en móvil

### Navegación Inteligente 
- **Cliente**: Ve Marketplace, Mis Compras, Verificar
- **Joyero**: Ve todo lo anterior + Nueva Joya, Crear Listado, Certificados
- **Admin**: Ve todo + Auditoría, Gestión del Sistema

### Consistencia
- Mismo header en todas las páginas
- Navegación unificada
- Tema y colores consistentes
- Comportamiento responsive uniforme

## 🚀 Próximos Pasos

1. **Migrar páginas existentes** una por una al nuevo sistema
2. **Eliminar headers duplicados** de cada página  
3. **Optimizar navegación** según feedback del uso
4. **Añadir breadcrumbs** para mejor UX de navegación

## 📋 Páginas Pendientes de Migrar

- [ ] src/pages/Dashboard.tsx
- [ ] src/pages/Index.tsx (landing page - no necesita sidebar)
- [ ] src/pages/Certificates.tsx
- [ ] src/pages/NewJewelry.tsx
- [ ] src/pages/CreateListing.tsx
- [ ] src/pages/MyMarketplace.tsx
- [ ] src/pages/Payment.tsx
- [ ] Y otras páginas con headers duplicados...

## 💡 Notas de Implementación

- **showSidebar={false}** para páginas como landing page
- **title="Mi Página"** para mostrar título específico en header
- **showAuth={false}** para páginas públicas sin autenticación
- La navegación se actualiza automáticamente según el rol del usuario