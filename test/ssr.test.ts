// @vitest-environment node
import { describe, it, expect } from 'vitest'

describe('SSR safety (Node, no DOM globals)', () => {
  it('public-api imports without touching window/document/customElements', async () => {
    const mod = await import('../src/public-api')
    expect(typeof mod.provideTakt).toBe('function')
    expect(typeof mod.TaktService).toBe('function')
    expect(typeof mod.TaktEventDirective).toBe('function')
    expect(mod.TAKT_CONFIG).toBeDefined()
    expect(typeof mod.optOut).toBe('function')
    expect(typeof mod.optIn).toBe('function')
    expect(typeof mod.isOptedOut).toBe('function')
  })

  it('element entry imports without registering (no customElements on server)', async () => {
    await expect(import('../src/element/index')).resolves.toBeDefined()
  })

  it('TaktService instantiates and no-ops on the server', async () => {
    const { TaktService } = await import('../src/public-api')
    const svc = new TaktService()
    expect(() => svc.track('X')).not.toThrow()
    expect(() => svc.pageview()).not.toThrow()
  })
})
