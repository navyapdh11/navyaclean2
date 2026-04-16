import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js ecosystem — lazy loaded, not in initial bundle
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // Animation library
          'framer': ['framer-motion'],
          // Form handling
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Router
          'router': ['react-router-dom'],
        }
      }
    },
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    // Report compressed sizes
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'framer-motion'],
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 4173,
  },
})
