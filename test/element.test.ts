import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTaktAnalyticsElement } from '../src/element/TaktAnalyticsElement'
import { defineTaktElement } from '../src/element/index'

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
    enableTagged: vi.fn(() => vi.fn()),
    optOut: vi.fn(),
    optIn: vi.fn(),
    isOptedOut: vi.fn(() => false),
  }
}

// jsdom forbids `new` on an unregistered custom-element constructor, so each
// test registers the lazy class under a unique tag and drives it through the DOM.
let seq = 0
function register(): string {
  const tag = `takt-analytics-test-${seq++}`
  customElements.define(tag, createTaktAnalyticsElement())
  return tag
}

describe('<takt-analytics> custom element', () => {
  beforeEach(() => createTakt.mockReset())

  it('registers idempotently', () => {
    defineTaktElement()
    defineTaktElement()
    expect(customElements.get('takt-analytics')).toBeTypeOf('function')
  })

  it('parses attrs: privacy default-on, presence flags, and fires pageview', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('domain', 'a.test')
    el.setAttribute('outbound', '')
    document.body.appendChild(el)

    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ domain: 'a.test', respectDnt: true, excludeLocalhost: true }),
    )
    expect(inst.enableSpa).toHaveBeenCalledOnce() // spa default-on
    expect(inst.enableOutbound).toHaveBeenCalledOnce()
    expect(inst.enableFiles).not.toHaveBeenCalled()
    expect(inst.enable404).not.toHaveBeenCalled()
    expect(inst.pageview).toHaveBeenCalledOnce()
    el.remove()
  })

  it('enables 404 reporting only when the track404 attribute is present', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('track404', '')
    document.body.appendChild(el)

    expect(inst.enable404).toHaveBeenCalledOnce()
    el.remove()
  })

  it('explicit "false" disables privacy/spa defaults', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('respect-dnt', 'false')
    el.setAttribute('spa', 'false')
    document.body.appendChild(el)

    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ respectDnt: false }))
    expect(inst.enableSpa).not.toHaveBeenCalled()
    el.remove()
  })

  it('forwards script-origin to the core', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('script-origin', 'https://t.example.com')
    document.body.appendChild(el)

    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ scriptOrigin: 'https://t.example.com' }),
    )
    el.remove()
  })

  it('disposes autocapture on disconnect', () => {
    const inst = makeInstance()
    const dispose = vi.fn()
    inst.enableSpa.mockReturnValue(dispose)
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    document.body.appendChild(el)
    el.remove()

    expect(dispose).toHaveBeenCalledOnce()
  })

  it('forwards sample-rate as a float to sampleRate', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('sample-rate', '0.5')
    document.body.appendChild(el)

    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ sampleRate: 0.5 }))
    el.remove()
  })

  it('forwards track-query attribute as trackQuery: true', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('track-query', '')
    document.body.appendChild(el)

    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ trackQuery: true }))
    el.remove()
  })

  it('splits query-params CSV into an array', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('query-params', 'utm_source, utm_medium')
    document.body.appendChild(el)

    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ queryParams: ['utm_source', 'utm_medium'] }),
    )
    el.remove()
  })

  it('forwards debug presence as debug: true', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('debug', '')
    document.body.appendChild(el)

    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ debug: true }))
    el.remove()
  })

  it('leaves debug undefined when the attribute is absent', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    document.body.appendChild(el)

    expect(createTakt.mock.calls[0][0].debug).toBeUndefined()
    el.remove()
  })

  it('parses enabled="false" as false', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('enabled', 'false')
    document.body.appendChild(el)

    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    el.remove()
  })

  it('splits redact-routes CSV into redactRoutes', () => {
    createTakt.mockReturnValue(makeInstance())
    const el = document.createElement(register())
    el.setAttribute('redact-routes', '/verify/:token, /reset/[code],')
    document.body.appendChild(el)

    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ redactRoutes: ['/verify/:token', '/reset/[code]'] }),
    )
    el.remove()
  })

  it('leaves redactRoutes undefined without the attribute and never sets routeTemplates', () => {
    createTakt.mockReturnValue(makeInstance())
    const el = document.createElement(register())
    el.setAttribute('redact-routes', ' , ')
    document.body.appendChild(el)

    const config = createTakt.mock.calls[0][0]
    expect(config.redactRoutes).toBeUndefined()
    expect(config.routeTemplates).toBeUndefined()
    el.remove()
  })

  it('calls enableTagged when tagged attr present, skips when absent', () => {
    const inst = makeInstance()
    createTakt.mockReturnValue(inst)
    const el = document.createElement(register())
    el.setAttribute('tagged', '')
    document.body.appendChild(el)
    expect(inst.enableTagged).toHaveBeenCalledOnce()
    el.remove()

    createTakt.mockReset()
    const inst2 = makeInstance()
    createTakt.mockReturnValue(inst2)
    const el2 = document.createElement(register())
    document.body.appendChild(el2)
    expect(inst2.enableTagged).not.toHaveBeenCalled()
    el2.remove()
  })
})
