import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

describe('noopTakt', () => {
  it('returns a stable singleton across calls', async () => {
    const { noopTakt } = await import('../src/lib/noop')
    expect(noopTakt()).toBe(noopTakt())
  })

  it('warns exactly once total across track/pageview calls', async () => {
    const { noopTakt } = await import('../src/lib/noop')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    noopTakt().track('A')
    noopTakt().track('B')
    noopTakt().pageview()
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  it('exposes enable* helpers that return callable no-op disposers', async () => {
    const { noopTakt } = await import('../src/lib/noop')
    const t = noopTakt()
    for (const enable of [t.enableSpa, t.enableOutbound, t.enableFiles, t.enable404, t.enableTagged]) {
      const dispose = enable()
      expect(dispose).toBeTypeOf('function')
      expect(() => dispose()).not.toThrow()
    }
  })

  it('optOut/optIn do not throw', async () => {
    const { noopTakt } = await import('../src/lib/noop')
    const t = noopTakt()
    expect(() => t.optOut()).not.toThrow()
    expect(() => t.optIn()).not.toThrow()
  })
  it('delegates consent to core so it works before provideTakt boots', async () => {
    const optOut = vi.fn()
    const optIn = vi.fn()
    const isOptedOut = vi.fn(() => true)
    vi.doMock('@vskstudio/takt-core', () => ({ optOut, optIn, isOptedOut }))
    const { noopTakt } = await import('../src/lib/noop')
    const t = noopTakt()
    t.optOut()
    t.optIn()
    expect(t.isOptedOut()).toBe(true)
    expect(optOut).toHaveBeenCalledOnce()
    expect(optIn).toHaveBeenCalledOnce()
    vi.doUnmock('@vskstudio/takt-core')
  })
})
