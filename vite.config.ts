import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // GitHub Pages uses /<repo>/; other hosts and local development use /.
  base: process.env.GITHUB_PAGES_BASE || '/',
  plugins: [vue()],
  build: { target: ['es2020', 'safari14'] },
})
