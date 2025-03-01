import {defineConfig} from 'vite'

export default defineConfig({
  server: {
    cors: true,
    host: true,
    port: 8942,
  },

  build: {
    lib: {
      entry: './src/extension.js',
      formats: ['cjs'],
      fileName: 'extension',
    },
    sourcemap: true,
    outDir: './dist',
    emptyOutDir: false,
    rollupOptions: {
      external: ['vscode'],
    },
  },
})
