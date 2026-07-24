# @vskstudio/takt-angular


> 📚 **Documentation** — [taktlytics.com/docs/wrappers/angular](https://taktlytics.com/docs/wrappers/angular)
Idiomatic Angular wrapper for [Takt](https://github.com/vskstudio/takt-core), privacy-friendly analytics. Standalone APIs for Angular 17+.

## Install

```bash
pnpm add @vskstudio/takt-angular @vskstudio/takt-core
```

## Setup

Register Takt once at bootstrap with `provideTakt`. It boots only in the browser, fires the initial pageview, wires up the requested autocapture, and disposes everything when the app is destroyed.

```ts
import { bootstrapApplication } from '@angular/platform-browser'
import { provideTakt } from '@vskstudio/takt-angular'
import { AppComponent } from './app/app.component'

bootstrapApplication(AppComponent, {
  providers: [
    provideTakt({
      // domain defaults to location.hostname, endpoint to /api/event
      outbound: true, // auto-track outbound links
      files: true, // auto-track downloads (or pass ['pdf', 'zip'])
      // spa: true, respectDnt: true, excludeLocalhost: true (defaults)
    }),
  ],
})
```

SSR-safe: on the server `provideTakt` is inert and `TaktService` no-ops.

## Track events imperatively

Inject `TaktService` anywhere. Every method is a never-throwing no-op before init or on the server.

```ts
import { Component, inject } from '@angular/core'
import { TaktService } from '@vskstudio/takt-angular'

@Component({ /* ... */ })
export class CheckoutComponent {
  private readonly takt = inject(TaktService)

  buy() {
    this.takt.track('Purchase', {
      props: { plan: 'pro' },
      revenue: { amount: '29.00', currency: 'EUR' },
    })
  }

  // takt.pageview(), takt.optOut(), takt.optIn() are also available.
}
```

## Track clicks declaratively

The `taktEvent` directive resolves the live instance at click time.

```ts
import { TaktEventDirective } from '@vskstudio/takt-angular'

@Component({
  standalone: true,
  imports: [TaktEventDirective],
  template: `
    <button
      taktEvent="Signup"
      [taktProps]="{ plan: 'pro' }"
      [taktRevenue]="{ amount: '29.00', currency: 'EUR' }"
    >
      Sign up
    </button>
  `,
})
export class SignupComponent {}
```

## Widgets

Standalone, server-rendered widget components. The badge is an `<img>` (SVG), the embed is a sandboxed `<iframe>` (`sandbox="allow-scripts allow-same-origin"`, `referrerpolicy="strict-origin-when-cross-origin"`).

```ts
import { TaktBadgeComponent, TaktEmbedComponent } from '@vskstudio/takt-angular'

@Component({
  standalone: true,
  imports: [TaktBadgeComponent, TaktEmbedComponent],
  template: `
    <takt-badge domain="example.com" variant="d" glyph="dash" lang="fr" />
    <takt-embed domain="example.com" theme="dark" [width]="404" [height]="264" />
  `,
})
export class StatsComponent {}
```

Read public stats programmatically with `createStats`:

```ts
import { createStats } from '@vskstudio/takt-angular'

const stats = createStats({ domain: 'example.com' })
const summary = await stats.summary({ period: '7d' })
const series = await stats.timeseries({ period: '30d' })
```

The badge `alt` text is an overridable input (defaults to `"takt"`). The optional `host` input must be an absolute `http(s)` URL — core validates it and throws on anything else (e.g. a `javascript:` URL).

`badgeUrl`, `embedUrl`, `PublicApiError` and the widget/stats types are re-exported from core.

## Framework-agnostic custom element

For non-Angular pages (or a plain `<script>` tag), use the self-contained `<takt-analytics>` element. Privacy attributes are on by default; set them to `false` to disable.

```ts
import { defineTaktElement } from '@vskstudio/takt-angular/element'
defineTaktElement() // also auto-runs on import
```

```html
<takt-analytics domain="example.com" outbound files></takt-analytics>
```

Via CDN (bundles core, no build step):

```html
<script type="module" src="https://unpkg.com/@vskstudio/takt-angular/dist/element/index.js"></script>
<takt-analytics></takt-analytics>
```

## API

| Export | Description |
| --- | --- |
| `provideTakt(config?)` | `EnvironmentProviders` — install at bootstrap. |
| `TaktService` | Injectable: `track`, `pageview`, `optOut`, `optIn`, `instance`. |
| `TaktEventDirective` | `[taktEvent]` standalone directive for click tracking. |
| `TaktBadgeComponent` | `<takt-badge>` standalone component — server-rendered SVG badge. |
| `TaktEmbedComponent` | `<takt-embed>` standalone component — server-rendered iframe. |
| `createStats(opts?)` | Public stats client (`summary`/`timeseries`/`realtime`/`breakdown`). |
| `TAKT_CONFIG` | InjectionToken holding the resolved config. |
| `defineTaktElement` | Registers `<takt-analytics>` (from `./element`). |

### `TaktConfig`

| Option | Default | Description |
| --- | --- | --- |
| `domain` | `location.hostname` | Site identifier sent with every event. |
| `endpoint` | `/api/event` | Ingestion endpoint. |
| `scriptOrigin` | — | First-party origin (`{origin}/api/event`); `endpoint` takes precedence. |
| `outbound` | `false` | Auto-track outbound link clicks. |
| `files` | `false` | Auto-track file downloads (or pass `string[]` to restrict extensions). |
| `track404` | `false` | Report a `404` event on error pages (`[data-takt-404]` / `<meta name="takt:404">`). |
| `spa` | `true` | Track SPA navigations (pushState / replaceState / popstate). |
| `respectDnt` | `true` | Suppress events when the browser's Do Not Track is enabled. |
| `excludeLocalhost` | `true` | Suppress events on localhost and private IP ranges. |
| `enabled` | `true` | Set to `false` to disable tracking entirely. |
| `sampleRate` | `1` | Fraction of sessions to record, between `0` and `1`. |
| `trackQuery` | `false` | Include the query string in page URLs sent with events. |
| `queryParams` | `[]` | Allowlist of query-param names to keep when `trackQuery` is on. |
| `exclude` | `[]` | Path prefixes never tracked, e.g. `['/app', '/account']` (segment-bounded, checked at send time). |
| `scrubUrl` | — | Transform the URL before it is sent. Function prop — dev-controlled, config only (cannot be set via the `<takt-analytics>` element attribute). |
| `tagged` | `false` | Auto-track clicks on `[data-takt-tag]` elements. |

## License

MIT © VSK Studio
