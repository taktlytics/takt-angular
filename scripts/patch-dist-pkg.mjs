import { readFileSync, writeFileSync } from 'node:fs'

// ng-packagr emits its own dist/package.json with the FESM exports but drops the
// self-contained ./element entry. Re-attach it (and the CDN fields) here.
const path = new URL('../dist/package.json', import.meta.url)
const pkg = JSON.parse(readFileSync(path, 'utf8'))

// Fail loud if a future ng-packagr drops the main entry instead of shipping a broken exports map.
if (!pkg.exports?.['.']) throw new Error('dist/package.json is missing the main "." export: ng-packagr output changed')

// Published from dist/, so the root's `files: ["dist"]` would match nothing here
// and strip the whole package. Drop it and let npm pack the built tree.
delete pkg.files

pkg.unpkg = './element/index.js'
pkg.jsdelivr = './element/index.js'
pkg.sideEffects = ['./element/index.js']
pkg.exports = {
  ...pkg.exports,
  './element': {
    types: './element/index.d.ts',
    import: './element/index.js',
    default: './element/index.js',
  },
}

writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n')
console.log('patched dist/package.json with ./element entry')
