import angular from '@analogjs/vite-plugin-angular'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [angular({ tsconfig: resolve(__dirname, 'tsconfig.app.json') })],
  resolve: {
    alias: {
      '@vskstudio/takt-angular': resolve(__dirname, '../../dist/fesm2022/vskstudio-takt-angular.mjs'),
    },
  },
})
