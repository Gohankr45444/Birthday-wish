import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Birthday-wish/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion', 'zustand'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
});
