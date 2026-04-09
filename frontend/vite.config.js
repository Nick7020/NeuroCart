import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://localhost:5000' } },
  build: {
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('recharts') || id.includes('d3')) return 'charts'
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor'
          if (id.includes('axios')) return 'http'
        },
      },
    },
  },
})
