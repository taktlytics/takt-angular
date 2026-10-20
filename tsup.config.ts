import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { 'element/index': 'src/element/index.ts' },
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  clean: false,
  noExternal: ['@vskstudio/takt-core'],
})
