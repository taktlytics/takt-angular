import { TestBed } from '@angular/core/testing'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaktService } from '../src/lib/takt.service'

describe('TaktService (no-op before init)', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    TestBed.resetTestingModule()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('is providedIn root and resolves without a provider', () => {
    const svc = TestBed.inject(TaktService)
    expect(svc).toBeInstanceOf(TaktService)
  })

  it('track/pageview are never-throwing no-ops and warn once', () => {
    const svc = TestBed.inject(TaktService)
    expect(() => svc.track('X', { props: { a: 'b' } })).not.toThrow()
    expect(() => svc.pageview()).not.toThrow()
    expect(warn).toHaveBeenCalledTimes(1) // warnOnce
  })

  it('optOut/optIn are silent no-ops before init', () => {
    const svc = TestBed.inject(TaktService)
    expect(() => svc.optOut()).not.toThrow()
    expect(() => svc.optIn()).not.toThrow()
  })

  it('isOptedOut reflects the stored choice before init', () => {
    const svc = TestBed.inject(TaktService)
    svc.optOut()
    expect(svc.isOptedOut()).toBe(true)
    svc.optIn()
    expect(svc.isOptedOut()).toBe(false)
  })

  it('delegates to the live instance once set', () => {
    const svc = TestBed.inject(TaktService)
    const inst = { track: vi.fn(), pageview: vi.fn(), optOut: vi.fn(), optIn: vi.fn(), isOptedOut: vi.fn(() => true) }
    svc._setInstance(inst as never)

    svc.track('Signup', { props: { plan: 'pro' } })
    svc.pageview()
    svc.optOut()
    svc.optIn()
    expect(svc.isOptedOut()).toBe(true)

    expect(inst.track).toHaveBeenCalledWith('Signup', { props: { plan: 'pro' } })
    expect(inst.pageview).toHaveBeenCalledOnce()
    expect(inst.optOut).toHaveBeenCalledOnce()
    expect(inst.optIn).toHaveBeenCalledOnce()
    expect(warn).not.toHaveBeenCalled()
  })
})
