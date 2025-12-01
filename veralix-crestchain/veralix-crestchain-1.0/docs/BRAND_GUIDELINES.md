# Guía de Implementación del Manual de Marca Veralix

Este documento detalla cómo usar correctamente la identidad corporativa de Veralix según el Manual de Identidad Corporativa oficial.

## 📋 Tabla de Contenidos

- [Colores Oficiales](#colores-oficiales)
- [Tipografía](#tipografía)
- [Gradientes](#gradientes)
- [Sombras](#sombras)
- [Iconografía](#iconografía)
- [Elementos Decorativos](#elementos-decorativos)
- [Estilo Fotográfico](#estilo-fotográfico)
- [Componentes](#componentes)

---

## 🎨 Colores Oficiales

### Paleta Principal

Los colores oficiales de Veralix según el Manual de Marca:

| Color | Hex | HSL | Uso |
|-------|-----|-----|-----|
| **Dorado Oficial** | `#CFA349` | `43 65% 55%` | Color principal de marca |
| **Plateado Oficial** | `#C9C9C9` | `0 0% 79%` | Color secundario |
| **Negro Oficial** | `#000000` | `0 0% 0%` | Fondos y textos |
| **Blanco Oficial** | `#F4F4F4` | `0 0% 96%` | Fondos claros |

### Uso en Código

```tsx
// Usando clases de Tailwind
<div className="bg-veralix-gold text-veralix-black">
  Contenido con colores oficiales
</div>

// Usando variables CSS
<div style={{ backgroundColor: 'hsl(var(--veralix-gold))' }}>
  Contenido con variable CSS
</div>
```

### Variantes de Color

```tsx
// Dorado
className="text-veralix-gold"         // Dorado principal
className="text-veralix-gold-light"   // Dorado claro
className="text-veralix-gold-dark"    // Dorado oscuro

// Plateado
className="text-veralix-silver"       // Plateado principal
className="text-veralix-silver-light" // Plateado claro
className="text-veralix-silver-dark"  // Plateado oscuro
```

---

## ✍️ Tipografía

### Fuente Oficial: Baloo Paaji 2

La tipografía oficial de Veralix es **Baloo Paaji 2**, que transmite calidez, contemporaneidad y elegancia.

#### Pesos Disponibles
- **Regular (400)**: Textos de cuerpo
- **Medium (500)**: Subtítulos
- **SemiBold (600)**: Destacados
- **Bold (700)**: Títulos principales
- **ExtraBold (800)**: Headings especiales

### Uso en Código

```tsx
// Usando clases de Tailwind
<h1 className="font-heading font-bold">Título Principal</h1>
<p className="font-body">Texto de cuerpo</p>

// Font family completa
className="font-baloo"
```

### Jerarquía Tipográfica

```tsx
// H1 - Títulos principales
<h1 className="text-4xl font-bold font-heading">Título H1</h1>

// H2 - Subtítulos
<h2 className="text-3xl font-semibold font-heading">Título H2</h2>

// H3 - Secciones
<h3 className="text-2xl font-semibold font-heading">Título H3</h3>

// Body - Texto normal
<p className="text-base font-body">Texto de párrafo</p>
```

---

## 🌈 Gradientes

Los gradientes oficiales según el Manual de Marca:

### Gradientes Disponibles

```css
/* Degradado oro-blanco (principal) */
--gradient-veralix-gold: linear-gradient(135deg, #CFA349 0%, #F4F4F4 100%);

/* Degradado premium (negro-oro-plata) */
--gradient-veralix-premium: linear-gradient(135deg, #000000 0%, #CFA349 50%, #C9C9C9 100%);

/* Degradado plateado */
--gradient-veralix-silver: linear-gradient(135deg, #C9C9C9 0%, #F4F4F4 100%);

/* Degradado hero (negro-oro-negro) */
--gradient-veralix-hero: linear-gradient(135deg, #000000 0%, #CFA349 50%, #000000 100%);
```

### Uso en Componentes

```tsx
// Usando clases de Tailwind
<div className="bg-gradient-veralix-gold">
  Contenido con degradado dorado
</div>

// Con componente VeralixGradientOverlay
import { VeralixGradientOverlay } from "@/components/ui/veralix-gradient-overlay";

<div className="relative">
  <VeralixGradientOverlay variant="gold" opacity={10} />
  Contenido con overlay de gradiente
</div>
```

---

## ✨ Sombras

Sombras premium según el Manual de Marca:

### Sombras Disponibles

```css
/* Sombra dorada */
--shadow-veralix-gold: 0 10px 40px -10px rgba(207, 163, 73, 0.4);

/* Sombra premium */
--shadow-veralix-premium: 0 20px 60px -15px rgba(0, 0, 0, 0.5);

/* Sombra plateada suave */
--shadow-veralix-silver: 0 4px 20px -5px rgba(201, 201, 201, 0.3);
```

### Uso en Código

```tsx
// Usando clases de Tailwind
<Card className="shadow-veralix-gold">
  Tarjeta con sombra dorada
</Card>

<div className="shadow-veralix-premium">
  Elemento premium con sombra
</div>
```

---

## 🎯 Iconografía

### Principios de Iconografía Veralix

Según el Manual de Marca:
- **Precisión, elegancia y modernidad**
- **Estética minimalista**
- **Líneas finas** (strokeWidth: 1.5)

### Componente VeralixIcon

```tsx
import { VeralixIcon } from "@/components/ui/veralix-icon";
import { Shield, Star, Check } from "lucide-react";

// Uso básico
<VeralixIcon icon={Shield} />

// Con personalización
<VeralixIcon 
  icon={Star} 
  size="lg"              // xs, sm, md, lg, xl, 2xl, 3xl
  strokeWidth="thin"     // thin (default), regular, bold
  color="primary"        // primary, secondary, neutral, light
/>
```

### Configuración de Iconos

```typescript
import { veralixIconConfig } from "@/lib/iconography";

// Tamaños disponibles
veralixIconConfig.size = {
  xs: 12,   sm: 16,   md: 20,   lg: 24,
  xl: 32,   '2xl': 40,   '3xl': 48
}

// Stroke widths
veralixIconConfig.strokeWidth = {
  thin: 1.5,     // DEFAULT - Líneas finas del manual
  regular: 2,
  bold: 2.5
}
```

---

## 🎨 Elementos Decorativos

### Líneas Decorativas

Líneas finas inspiradas en el logomark según el Manual de Marca:

```tsx
import { VeralixDecorativeLines } from "@/components/ui/veralix-decorative-lines";

// Uso en headers
<header className="relative">
  <VeralixDecorativeLines position="top" variant="gold" />
  {/* Contenido del header */}
</header>

// Posiciones disponibles: 'top' | 'bottom' | 'left' | 'right'
// Variantes: 'gold' | 'silver'
```

### Overlays de Gradiente

```tsx
import { VeralixGradientOverlay } from "@/components/ui/veralix-gradient-overlay";

<section className="relative">
  <VeralixGradientOverlay 
    variant="gold"    // gold, silver, premium, hero
    opacity={10}      // 0-100
  />
  {/* Contenido de la sección */}
</section>
```

---

## 📸 Estilo Fotográfico

Según el Manual de Marca:
- **Tonos**: Negros, dorados y plateados
- **Iluminación**: Luz cálida
- **Contraste**: Suave y elegante
- **Atmósfera**: Premium y sofisticada

### Filtros Fotográficos

```tsx
// Filtro principal
<img 
  src="jewelry.jpg" 
  className="veralix-photo-filter" 
  alt="Joya"
/>

// Filtro premium para destacados
<img 
  src="hero-jewelry.jpg" 
  className="veralix-photo-premium" 
  alt="Joya destacada"
/>

// Filtro dorado
<img 
  src="gold-ring.jpg" 
  className="veralix-photo-gold" 
  alt="Anillo de oro"
/>

// Filtro plateado
<img 
  src="silver-necklace.jpg" 
  className="veralix-photo-silver" 
  alt="Collar de plata"
/>

// Con overlay
<div className="veralix-photo-overlay">
  <img src="jewelry.jpg" alt="Joya" />
</div>
```

---

## 🧩 Componentes

### Logo Veralix

```tsx
import { VeralixLogo } from "@/components/ui/veralix-logo";

<VeralixLogo size={40} className="custom-class" />
```

### Toasts Personalizados

```tsx
import { 
  veralixToast, 
  veralixToastSuccess,
  veralixToastError,
  veralixToastWarning,
  veralixToastInfo
} from "@/components/ui/veralix-toast";

// Uso de helpers
veralixToastSuccess("Operación exitosa", "Los cambios se guardaron correctamente");
veralixToastError("Error", "No se pudo completar la operación");
veralixToastWarning("Advertencia", "Verifica los datos ingresados");
veralixToastInfo("Información", "Nueva actualización disponible");

// Uso completo
veralixToast({
  title: "Título",
  description: "Descripción opcional",
  type: "success" // success, error, warning, info
});
```

### Alerta de Acceso Denegado

```tsx
import { AccessDeniedAlert } from "@/components/ui/access-denied-alert";

<AccessDeniedAlert 
  title="Acceso Restringido"
  message="No tienes permisos para acceder a esta sección"
  showBackButton={true}
/>
```

### Botones

```tsx
import { Button } from "@/components/ui/button";

// Variantes oficiales
<Button variant="default">Botón Principal</Button>
<Button variant="gold">Botón Dorado</Button>
<Button variant="premium">Botón Premium</Button>
<Button variant="outline">Botón Outline</Button>
```

---

## 🎭 Filosofía de Marca

### Valores Reflejados en el Diseño

1. **Autenticidad** 
   - Colores oficiales consistentes
   - Tipografía coherente en toda la aplicación

2. **Confianza**
   - Sombras premium que transmiten solidez
   - Gradientes suaves que generan profesionalidad

3. **Innovación**
   - Elementos decorativos modernos
   - Animaciones fluidas y elegantes

4. **Exclusividad**
   - Filtros fotográficos premium
   - Detalles refinados en cada componente

5. **Seguridad**
   - Diseño limpio y espacios amplios
   - Jerarquía visual clara

---

## ✅ Checklist de Implementación

Al crear nuevos componentes, asegúrate de:

- [ ] Usar colores oficiales (`#CFA349`, `#C9C9C9`, `#000000`, `#F4F4F4`)
- [ ] Aplicar tipografía Baloo Paaji 2
- [ ] Utilizar gradientes oficiales del manual
- [ ] Implementar sombras apropiadas
- [ ] Usar iconografía con líneas finas (strokeWidth: 1.5)
- [ ] Aplicar filtros fotográficos a imágenes
- [ ] Incluir elementos decorativos cuando sea apropiado
- [ ] Mantener amplio espacio negativo (elegancia)
- [ ] Verificar contraste en light/dark mode
- [ ] Probar responsive en todos los dispositivos

---

## 📚 Recursos

- Manual de Identidad Corporativa Veralix (PDF oficial)
- `src/index.css` - Variables CSS de colores
- `tailwind.config.ts` - Configuración de Tailwind
- `src/lib/iconography.ts` - Estándares de iconografía
- `src/styles/veralix-photography.css` - Filtros fotográficos

---

## 🆘 Soporte

Para dudas sobre la implementación del Manual de Marca, contacta al equipo de diseño de Veralix.

---

**Última actualización:** 2025-11-13  
**Versión del Manual de Marca:** 1.0
