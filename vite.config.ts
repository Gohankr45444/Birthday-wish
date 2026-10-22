import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Birthday-wish/',
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'three'],
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },
});