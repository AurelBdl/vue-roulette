import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue({
      customElement: false,
      style: {
        // Ne pas ajouter de scoped ID aux styles
        filename: undefined
      }
    }),
    dts({
      insertTypesEntry: true,
      include: ['src/index.ts', 'src/types.ts', 'src/components/VueRoulette.vue'],
      exclude: ['src/main.ts', 'src/App.vue', 'src/Example.vue', 'src/**/*.spec.ts', '**/vite*.config.ts', '**/tsconfig*.json', '**/*.config.ts'],
      rollupTypes: true,
      entryRoot: 'src',
      tsconfigPath: './tsconfig.app.json'
    }),
    {
      name: 'remove-scope-id',
      renderChunk(code, chunk) {
        // Retirer les scopeIds du code généré
        return {
          code: code.replace(/,\s*\["__scopeId",\s*"data-v-[a-z0-9]+"\]/g, ''),
          map: null
        }
      },
      generateBundle(options, bundle) {
        // Nettoyer le CSS
        for (const fileName in bundle) {
          const file = bundle[fileName]
          if (fileName.endsWith('.css') && file.type === 'asset') {
            const source = file.source as string
            file.source = source.replace(/\[data-v-[a-z0-9]+\]/g, '')
          }
        }
      }
    }
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueRoulette',
      fileName: format => (format === 'es' ? 'vue-roulette.js' : 'vue-roulette.umd.cjs'),
      formats: ['es', 'umd']
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue'
        },
        assetFileNames: (assetInfo) => {
          // Nettoyer le CSS en retirant les data-v
          if (assetInfo.name === 'style.css') {
            return 'vue-roulette.css'
          }
          return assetInfo.name || ''
        }
      }
    }
  }
})
