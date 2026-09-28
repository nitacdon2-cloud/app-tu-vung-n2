import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
