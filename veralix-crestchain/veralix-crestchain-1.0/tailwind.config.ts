import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        /* Colores Principales Veralix */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
          light: "hsl(var(--primary-light))",
        },
        
        /* Colores Secundarios Veralix */
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          light: "hsl(var(--secondary-light))",
          dark: "hsl(var(--secondary-dark))",
        },
        
        /* Paleta Veralix Original del Logo */
        "veralix-gold": {
          DEFAULT: "hsl(var(--veralix-gold))",
          light: "hsl(var(--veralix-gold-light))",
          dark: "hsl(var(--veralix-gold-dark))",
        },
        "veralix-silver": {
          DEFAULT: "hsl(var(--veralix-silver))",
          light: "hsl(var(--veralix-silver-light))",
          dark: "hsl(var(--veralix-silver-dark))",
        },
        "veralix-black": {
          DEFAULT: "hsl(var(--veralix-black))",
          soft: "hsl(var(--veralix-black-soft))",
        },
        
        /* Compatibilidad con nombres existentes */
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
        },
        
        /* Colores del Sistema */
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          premium: "hsl(var(--card-premium))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        "sidebar-foreground": "#0A0A0A",
        "sidebar-accent": "#F7F5F2",
        "sidebar-accent-foreground": "#0A0A0A",
      },
      backgroundImage: {
        /* Gradientes Veralix basados en el logo */
        "gradient-veralix-gold": "var(--gradient-veralix-gold)",
        "gradient-veralix-premium": "var(--gradient-veralix-premium)",
        "gradient-veralix-silver": "var(--gradient-veralix-silver)",
        "gradient-veralix-hero": "var(--gradient-veralix-hero)",
        
        /* Compatibilidad con nombres existentes */
        "gradient-gold": "var(--gradient-gold)",
        "gradient-crypto": "var(--gradient-crypto)",
        "gradient-premium": "var(--gradient-premium)",
        "gradient-hero": "var(--gradient-hero)",
      },
      boxShadow: {
        /* Sombras Veralix basadas en el logo */
        "veralix-gold": "var(--shadow-veralix-gold)",
        "veralix-premium": "var(--shadow-veralix-premium)",
        "veralix-silver": "var(--shadow-veralix-silver)",
        
        /* Compatibilidad con nombres existentes */
        "gold": "var(--shadow-gold)",
        "premium": "var(--shadow-premium)",
        "crypto": "var(--shadow-crypto)",
      },
      fontFamily: {
        'heading': ['Baloo Paaji 2', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['Baloo Paaji 2', 'system-ui', '-apple-system', 'sans-serif'],
        'baloo': ['Baloo Paaji 2', 'sans-serif'],
      },
      transitionProperty: {
        "premium": "var(--transition-premium)",
        "fast": "var(--transition-fast)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-3d": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        // FASE 5: Nuevas animaciones premium
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-scale": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            filter: "drop-shadow(0 0 2px hsl(var(--veralix-gold)))",
            transform: "scale(1)" 
          },
          "50%": { 
            filter: "drop-shadow(0 0 8px hsl(var(--veralix-gold)))",
            transform: "scale(1.05)" 
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "spin-reverse": "spin 6s linear infinite reverse",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "float-delayed": "float 3s ease-in-out infinite 1s",
        "float-slow": "float 4s ease-in-out infinite 2s",
        "spin-3d": "spin-3d 4s linear infinite",
        // FASE 5: Nuevas animaciones premium
        "shimmer": "shimmer 2s linear infinite",
        "bounce-in": "bounce-in 0.5s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "fade-scale": "fade-scale 0.3s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;