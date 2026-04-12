import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'framer': ['framer-motion'],
        }
      }
    },
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
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
