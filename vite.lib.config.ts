import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/index.ts', 'src/types.ts', 'src/components/VueRoulette.vue'],
      exclude: ['src/main.ts', 'src/App.vue', 'src/Example.vue', 'src/**/*.spec.ts', '**/vite*.config.ts', '**/tsconfig*.json', '**/*.config.ts'],
      rollupTypes: true,
      entryRoot: 'src',
      tsconfigPath: './tsconfig.app.json'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueRoulette',
      fileName: format => (format === 'es' ? 'vue-roulette.js' : 'vue-roulette.umd.cjs'),
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
