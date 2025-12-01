import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['veralix-favicon.png', 'veralix-logo.png', 'veralix-logo-email.png'],
      manifest: {
        name: 'Veralix - Certificación NFT de Joyería',
        short_name: 'Veralix',
        description: 'Certifica la autenticidad de tus joyas con tecnología blockchain NFT. Marketplace offline-ready.',
        theme_color: '#D4AF37',
        background_color: '#0A0A0A',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'any',
        categories: ['shopping', 'lifestyle', 'finance'],
        icons: [
          {
            src: 'veralix-favicon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'veralix-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB para imágenes optimizadas
        runtimeCaching: [
          // Estrategia 1: Imágenes de joyería optimizadas (StaleWhileRevalidate)
          {
            urlPattern: /^https:\/\/hykegpmjnpaupvwptxtl\.supabase\.co\/storage\/v1\/object\/public\/jewelry-images\/.*\.(png|jpg|jpeg|webp|avif)(\?.*)?$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'jewelry-images-optimized',
              expiration: {
                maxEntries: 150, // Cachear hasta 150 imágenes
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              plugins: [
                {
                  // Plugin personalizado para logging
                  cacheWillUpdate: async ({ response }) => {
                    if (response && response.status === 200) {
                      console.log('✅ [PWA] Caching optimized jewelry image');
                    }
                    return response;
                  },
                },
              ],
            },
          },
          // Estrategia 2: API de marketplace (NetworkFirst con fallback)
          {
            urlPattern: /^https:\/\/hykegpmjnpaupvwptxtl\.supabase\.co\/rest\/v1\/(marketplace_listings|jewelry_items).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'marketplace-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Estrategia 3: Assets estáticos (CacheFirst)
          {
            urlPattern: /^https:\/\/hykegpmjnpaupvwptxtl\.supabase\.co\/storage\/v1\/object\/public\/((?!jewelry-images).)*$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Estrategia 4: Google Fonts (CacheFirst)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // Deshabilitar en desarrollo para evitar conflictos
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
