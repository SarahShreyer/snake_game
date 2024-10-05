import { defineConfig } from 'vite'
import { resolve } from 'path'
import copyAssetsPlugin from './vite-plugin-copy-assets'

export default defineConfig({
  build: {
    outDir: 'server/public',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [copyAssetsPlugin()]
})