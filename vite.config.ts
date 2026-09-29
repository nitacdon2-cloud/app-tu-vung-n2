import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'assets/*'],
      manifest: {
        name: 'JMaster N2 - Ứng Dụng Học Từ Vựng',
        short_name: 'JMaster N2',
        description: 'Học từ vựng JLPT N2 offline dễ dàng',
        theme_color: '#1E88E5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp,mp3}'],
        maximumFileSizeToCacheInBytes: 15000000 // 15MB
      }
    })
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/mazii-embed': {
        target: 'https://mazii.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/mazii-embed/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
          });
        },
      },
    },
  },
});
