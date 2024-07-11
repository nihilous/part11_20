import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const baseUrls = {
  development: 'http://localhost:3001/api/persons',
  production: '/api/persons',
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    define: {
      'process.env.BASE_URL': JSON.stringify(baseUrls[mode]),
    },
  }
})