import * as path from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/admin',
  build: {
    sourcemap: true,
  },
  plugins: [react(), EnvironmentPlugin(['REACT_APP_TEXT', 'REACT_APP_SERVER_URL', 'REACT_APP_SERVER_FILE'])],
  publicDir: 'public',
  server: {
    host: true,
    port: 3001,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
