import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  // Mesmo alias que o tsconfig declara ("@/*" → "src/*"): TypeScript e Rollup resolvem igual.
  resolve: { alias: { '@': '/src' } },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/status': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Three.js só é baixado pela página inicial (carregamento sob demanda)
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap', '@gsap/react'],
        },
      },
    },
  },
  optimizeDeps: { exclude: ['lucide-react'] },
});
