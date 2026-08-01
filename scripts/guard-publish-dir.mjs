import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// `npm publish` runs prepublishOnly from the directory it publishes. This package
// must only ever be published from the built `dist/` tree: the repo root's
// package.json has no exports/module/types, so a root publish ships an
// unresolvable package (that is what happened to 0.5.0 and again to 0.6.1).
const dir = process.cwd()
const pkgPath = join(dir, 'package.json')

const fail = (reason) => {
  console.error(
    [
      `refus de publier depuis ${dir}`,
      `  ${reason}`,
      '',
      "Ce paquet se publie depuis le dossier `dist/` produit par le build, jamais depuis la racine :",
      'un publish racine livre un package.json sans exports/module/types, donc inimportable.',
      '',
      'Utilise `pnpm release` (build + publish depuis dist/).',
    ].join('\n'),
  )
  process.exit(1)
}

if (!existsSync(pkgPath)) fail('aucun package.json ici.')

if (existsSync(join(dir, 'ng-package.json'))) {
  fail('`ng-package.json` est présent : c\'est la racine du dépôt, pas la sortie de build.')
}

let pkg
try {
  pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
} catch (err) {
  fail(`package.json illisible (${err.message}).`)
}

if (!pkg.exports?.['.']) fail('package.json sans entrée `exports["."]` : ce n\'est pas la sortie de build.')
if (!pkg.module) fail('package.json sans champ `module` : ce n\'est pas la sortie de build.')
if (!pkg.types && !pkg.typings) fail('package.json sans champ `types`/`typings` : ce n\'est pas la sortie de build.')

console.log(`publish autorisé depuis ${dir}`)
