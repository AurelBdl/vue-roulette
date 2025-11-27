import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
		port: 3000,
		host: true,
	},
	preview: {
		port: 3000,
		host: true,
	},
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CasinoRoulette',
      fileName: format => (format === 'es' ? 'casino-roulette.js' : 'casino-roulette.umd.cjs'),
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
