import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url' // добавляем этот импорт для путей

export default defineConfig({
  base: '/BRO-SNB/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // жестко прописываем, что @ = папка src
    }
  }
})
