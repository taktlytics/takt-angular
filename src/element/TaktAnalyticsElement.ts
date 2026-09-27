import { createTakt } from '@vskstudio/takt-core'

// Privacy attrs are default-on: only an explicit "false"/"0" disables them, so
// an absent attribute keeps the core default. Presence flags (outbound/files)
// are on when the attribute exists at all.
const truthy = (v: string | null): boolean => v !== 'false' && v !== '0'

// Built lazily: referencing HTMLElement at module load throws under SSR (Node),
// so the class is created only when registration runs in a DOM environment.
export function createTaktAnalyticsElement(): CustomElementConstructor {
  return class TaktAnalyticsElement extends HTMLElement {
    private disposers: Array<() => void> = []

    connectedCallback(): void {
      const attr = (name: string): string | null => this.getAttribute(name)
      const sampleRateRaw = attr('sample-rate')
      const queryParamsRaw = attr('query-params')
      const queryParams = queryParamsRaw
        ? queryParamsRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined
      const excludeRaw = attr('exclude')
      const exclude = excludeRaw
        ? excludeRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined
      const takt = createTakt({
        domain: attr('domain') ?? undefined,
        endpoint: attr('endpoint') ?? undefined,
        scriptOrigin: attr('script-origin') ?? undefined,
        respectDnt: truthy(attr('respect-dnt')),
        excludeLocalhost: truthy(attr('exclude-localhost')),
        enabled: this.hasAttribute('enabled') ? truthy(attr('enabled')) : undefined,
        sampleRate: sampleRateRaw !== null && Number.isFinite(parseFloat(sampleRateRaw)) ? parseFloat(sampleRateRaw) : undefined,
        trackQuery: this.hasAttribute('track-query') ? truthy(attr('track-query')) : undefined,
        debug: this.hasAttribute('debug') ? truthy(attr('debug')) : undefined,
        queryParams: queryParams?.length ? queryParams : undefined,
        exclude: exclude?.length ? exclude : undefined,
      })
      if (truthy(attr('spa'))) this.disposers.push(takt.enableSpa())
      if (this.hasAttribute('outbound')) this.disposers.push(takt.enableOutbound())
      if (this.hasAttribute('files')) this.disposers.push(takt.enableFiles())
      if (this.hasAttribute('track404')) this.disposers.push(takt.enable404())
      if (this.hasAttribute('tagged')) this.disposers.push(takt.enableTagged())
      takt.pageview()
    }

    disconnectedCallback(): void {
      this.disposers.forEach((dispose) => dispose())
      this.disposers = []
    }
  }
}
