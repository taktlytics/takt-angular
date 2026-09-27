import { ApplicationRef, ENVIRONMENT_INITIALIZER, Injectable, inject, PendingTasks, PLATFORM_ID } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { provideTakt } from '../src/lib/provide-takt'
import { TaktService } from '../src/lib/takt.service'

const createTakt = vi.fn()
vi.mock('@vskstudio/takt-core', () => ({
  createTakt: (...a: unknown[]) => createTakt(...a),
  optOut: vi.fn(),
  optIn: vi.fn(),
  isOptedOut: vi.fn(() => false),
}))

function makeInstance() {
  return {
    track: vi.fn(),
    pageview: vi.fn(),
    enableSpa: vi.fn(() => vi.fn()),
    enableOutbound: vi.fn(() => vi.fn()),
    enableFiles: vi.fn(() => vi.fn()),
    enable404: vi.fn(() => vi.fn()),
    optOut: vi.fn(),
    optIn: vi.fn(),
    isOptedOut: vi.fn(() => false),
  }
}

describe('provideTakt', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    createTakt.mockReset()
  })

  it('boots in the browser: creates instance, fires initial pageview, stores it', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({ providers: [provideTakt({ domain: 'x.test' })] })
    const svc = TestBed.inject(TaktService)

    expect(createTakt).toHaveBeenCalledOnce()
    expect(inst.pageview).toHaveBeenCalledOnce()
    expect(svc.instance).toBe(inst)
  })

  it('enables spa by default and only outbound/files when requested', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({ providers: [provideTakt({ outbound: true })] })
    TestBed.inject(TaktService)

    expect(inst.enableSpa).toHaveBeenCalledOnce()
    expect(inst.enableOutbound).toHaveBeenCalledOnce()
    expect(inst.enableFiles).not.toHaveBeenCalled()
    expect(inst.enable404).not.toHaveBeenCalled()
  })

  it('enables 404 reporting only when track404 is set', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({ providers: [provideTakt({ track404: true })] })
    TestBed.inject(TaktService)

    expect(inst.enable404).toHaveBeenCalledOnce()
  })

  it('passes a file-extension array through to enableFiles', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({ providers: [provideTakt({ files: ['pdf', 'zip'] })] })
    TestBed.inject(TaktService)

    expect(inst.enableFiles).toHaveBeenCalledWith(['pdf', 'zip'])
  })

  it('can disable spa', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({ providers: [provideTakt({ spa: false })] })
    TestBed.inject(TaktService)

    expect(inst.enableSpa).not.toHaveBeenCalled()
  })

  it('disposes autocapture and clears the instance on app destroy', () => {
    const inst = makeInstance()
    const disposeSpa = vi.fn()
    inst.enableSpa.mockReturnValue(disposeSpa)
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({ providers: [provideTakt()] })
    const svc = TestBed.inject(TaktService)
    expect(svc.instance).toBe(inst)

    TestBed.resetTestingModule() // tears down the environment injector

    expect(disposeSpa).toHaveBeenCalledOnce()
    expect(svc.instance).not.toBe(inst)
  })

  it('forwards privacy config to createTakt', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({
      providers: [
        provideTakt({
          endpoint: '/ingest',
          scriptOrigin: 'https://takt.example.com',
          respectDnt: false,
          excludeLocalhost: false,
        }),
      ],
    })
    TestBed.inject(TaktService)

    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/ingest',
        scriptOrigin: 'https://takt.example.com',
        respectDnt: false,
        excludeLocalhost: false,
      }),
    )
  })

  it('forwards debug to createTakt', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({ providers: [provideTakt({ debug: true })] })
    TestBed.inject(TaktService)

    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ debug: true }))
  })

  it('forwards redactRoutes and routeTemplates to createTakt', () => {
    createTakt.mockReturnValue(makeInstance())

    TestBed.configureTestingModule({
      providers: [provideTakt({ redactRoutes: ['/verify/:token'], routeTemplates: true })],
    })
    TestBed.inject(TaktService)

    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ redactRoutes: ['/verify/:token'], routeTemplates: true }),
    )
  })

  it('leaves routeTemplate undefined when no resolver is given', () => {
    createTakt.mockReturnValue(makeInstance())

    TestBed.configureTestingModule({ providers: [provideTakt()] })
    TestBed.inject(TaktService)

    expect(createTakt.mock.calls[0][0].routeTemplate).toBeUndefined()
  })

  it('runs routeTemplate inside the injection context so it can inject()', () => {
    @Injectable({ providedIn: 'root' })
    class FakeRouter {
      template = '/users/:id'
    }
    createTakt.mockReturnValue(makeInstance())

    TestBed.configureTestingModule({
      providers: [provideTakt({ routeTemplates: true, routeTemplate: () => inject(FakeRouter).template })],
    })
    TestBed.inject(TaktService)

    const resolver = createTakt.mock.calls[0][0].routeTemplate as () => string
    expect(resolver()).toBe('/users/:id')
    TestBed.inject(FakeRouter).template = '/blog/:slug'
    expect(resolver()).toBe('/blog/:slug')
  })

  function holdStability(): { release: () => void } {
    const hold = { release: () => {} }
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ENVIRONMENT_INITIALIZER,
          multi: true,
          useValue: () => {
            hold.release = inject(PendingTasks).add()
          },
        },
        provideTakt({ routeTemplates: true, routeTemplate: () => '/users/:id' }),
      ],
    })
    return hold
  }

  it('defers the initial pageview until the app is stable when routeTemplates is on', async () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const hold = holdStability()

    TestBed.inject(TaktService)
    await Promise.resolve()
    expect(inst.pageview).not.toHaveBeenCalled()

    hold.release()
    await TestBed.inject(ApplicationRef).whenStable()
    expect(inst.pageview).toHaveBeenCalledOnce()
  })

  it('skips the deferred initial pageview when destroyed before the app is stable', async () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const hold = holdStability()

    TestBed.inject(TaktService)
    TestBed.resetTestingModule()
    hold.release()
    await Promise.resolve()

    expect(inst.pageview).not.toHaveBeenCalled()
  })

  it('fires the initial pageview synchronously when routeTemplates is on without a resolver', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({ providers: [provideTakt({ routeTemplates: true })] })
    TestBed.inject(TaktService)

    expect(inst.pageview).toHaveBeenCalledOnce()
  })

  it('exposes optOut/optIn/isOptedOut through the booted instance', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)

    TestBed.configureTestingModule({ providers: [provideTakt()] })
    const svc = TestBed.inject(TaktService)
    svc.optOut()
    svc.optIn()
    svc.isOptedOut()

    expect(inst.optOut).toHaveBeenCalledOnce()
    expect(inst.optIn).toHaveBeenCalledOnce()
    expect(inst.isOptedOut).toHaveBeenCalledOnce()
  })

  it('does NOT boot on the server', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }, provideTakt()],
    })
    TestBed.inject(TaktService)

    expect(createTakt).not.toHaveBeenCalled()
  })
})
