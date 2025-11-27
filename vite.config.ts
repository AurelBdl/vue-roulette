import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => {
  const isBuildLib = command === 'build' && process.env.BUILD_MODE === 'lib'

  return {
    plugins: [vue()],

    // Si on build la lib → config lib
    ...(isBuildLib
      ? {
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
        }
      : {
          // Sinon → build classique pour la démo
          build: {
            outDir: 'dist-demo'
          },
          server: {
            host: '0.0.0.0'
          },
          preview: {
            host: '0.0.0.0'
          }
        })
  }
})
