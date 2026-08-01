import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const repoRoot = resolve(__dirname, '..')
const guard = join(repoRoot, 'scripts', 'guard-publish-dir.mjs')

const run = (cwd: string) => spawnSync(process.execPath, [guard], { cwd, encoding: 'utf8' })

const distLikePkg = {
  name: '@vskstudio/takt-angular',
  version: '0.0.0',
  module: 'fesm2022/vskstudio-takt-angular.mjs',
  typings: 'index.d.ts',
  exports: { '.': { types: './index.d.ts', default: './fesm2022/vskstudio-takt-angular.mjs' } },
}

const fixture = (pkg: unknown) => {
  const dir = mkdtempSync(join(tmpdir(), 'takt-guard-'))
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg))
  return dir
}

describe('guard-publish-dir', () => {
  it('rejects a publish from the repo root', () => {
    const res = run(repoRoot)
    expect(res.status).toBe(1)
    expect(res.stderr).toContain('ng-package.json')
    expect(res.stderr).toContain('pnpm release')
  })

  it('accepts a publish from a built dist tree', () => {
    const res = run(fixture(distLikePkg))
    expect(res.status).toBe(0)
  })

  it('accepts the real dist/ output when it has been built', () => {
    const dist = join(repoRoot, 'dist')
    if (!existsSync(join(dist, 'package.json'))) return
    expect(run(dist).status).toBe(0)
  })

  it('rejects a package.json without exports, module or types', () => {
    for (const pkg of [
      { ...distLikePkg, exports: undefined },
      { ...distLikePkg, module: undefined },
      { ...distLikePkg, typings: undefined },
    ]) {
      expect(run(fixture(pkg)).status).toBe(1)
    }
  })

  it('rejects a directory holding ng-package.json even with a valid package.json', () => {
    const dir = fixture(distLikePkg)
    writeFileSync(join(dir, 'ng-package.json'), '{}')
    expect(run(dir).status).toBe(1)
  })

  it('rejects a directory with no package.json at all', () => {
    const dir = mkdtempSync(join(tmpdir(), 'takt-guard-'))
    mkdirSync(join(dir, 'empty'))
    expect(run(join(dir, 'empty')).status).toBe(1)
  })
})
