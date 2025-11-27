import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  preview: {
		port: 3000,
		host: true,    // This enables listening on all network interfaces
	},
	server: {        // Also add this for development server
		host: true,    // This enables listening on all network interfaces
		port: 3000
	},
})
