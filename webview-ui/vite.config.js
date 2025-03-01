import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],

  server: {
    cors: true,
    host: true,
    port: 8932,
  },

  build: {
    outDir: '../dist/webview-ui',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        manualChunks: () => 'app', // https://github.com/rollup/rollup/issues/2756, https://github.com/vitejs/vite/issues/1683
      },
    },
  },
})
