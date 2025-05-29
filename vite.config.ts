import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting for better loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep OpenAI and related dependencies together
          'openai-vendor': ['openai'],
          // Keep PDF processing together
          'pdf-vendor': ['pdfjs-dist'],
          // Keep document processing together  
          'docs-vendor': ['mammoth']
        }
      }
    },
    // Increase chunk size limit to prevent splitting critical modules
    chunkSizeWarningLimit: 1000
  }
})
