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

Inject `TaktService` anywhere. Tracking methods are never-throwing no-ops before init or on the server, while the consent methods always work (see [Consent](#consent)).

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

  // takt.pageview(), takt.optOut(), takt.optIn(), takt.isOptedOut() are also available.
}
```

## Consent

Consent works before `provideTakt()` has booted and on pages that never install it: `TaktService.optOut()`, `optIn()` and `isOptedOut()` go straight to the stored choice, and so do the `optOut`, `optIn` and `isOptedOut` functions exported by the package. A consent banner can therefore render first, and the instance created later honours the choice.

```ts
import { Component, signal } from '@angular/core'
import { isOptedOut, optIn, optOut } from '@vskstudio/takt-angular'

@Component({
  selector: 'app-analytics-toggle',
  standalone: true,
  template: `<button (click)="toggle()">{{ blocked() ? 'Enable analytics' : 'Disable analytics' }}</button>`,
})
export class AnalyticsToggleComponent {
  readonly blocked = signal(isOptedOut())

  toggle() {
    this.blocked() ? optIn() : optOut()
    this.blocked.set(isOptedOut())
  }
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

`badgeUrl`, `embedUrl`, `PublicApiError`, `optOut`, `optIn`, `isOptedOut` and the widget/stats types are re-exported from core.

## Framework-agnostic custom element

For non-Angular pages (or a plain `<script>` tag), use the self-contained `<takt-analytics>` element. Privacy attributes are on by default; set them to `false` to disable.

```ts
import { defineTaktElement } from '@vskstudio/takt-angular/element'
defineTaktElement() // also auto-runs on import
```

```html
<takt-analytics domain="example.com" outbound files></takt-analytics>
```

Add `redact-routes` with a comma-separated list of patterns to send sensitive paths as their pattern: `<takt-analytics redact-routes="/verify/:token, /reset/:code"></takt-analytics>`. The element has no router, so it does not support `routeTemplates`.

Add the `debug` attribute to log each payload to the console before it is sent. It applies only when present, and `debug="false"` turns it off.

Via CDN (bundles core, no build step):

```html
<script type="module" src="https://unpkg.com/@vskstudio/takt-angular/dist/element/index.js"></script>
<takt-analytics></takt-analytics>
```

## Route redaction

Query strings are stripped by default, but path segments are sent as they are: `/verify/abc123` leaks the token. List the sensitive routes with `redactRoutes` and a matching path is sent as its pattern, while every other path keeps its real value.

```ts
provideTakt({
  redactRoutes: ['/verify/:token', '/invoices/:id'],
})
```

`/verify/abc123` is then sent as `/verify/:token`. Patterns accept Angular syntax (`:param`, `:param?`, `*`, `**`) as well as `[param]`, `[[optional]]`, `[...rest]` and `(group)`. The rule covers the page URL, same-origin referrers, outbound and download links, and 404 paths.

For a fully private app, `routeTemplates: true` sends every page as its route template (`/users/42` becomes `/users/:id`). Give it a `routeTemplate` resolver: it runs in the injection context of `provideTakt`, so it can `inject()` the router, and `routeTemplateFromSnapshot` turns the router snapshot into a template.

```ts
import { inject } from '@angular/core'
import { provideRouter, Router } from '@angular/router'
import { provideTakt, routeTemplateFromSnapshot } from '@vskstudio/takt-angular'

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideTakt({
      routeTemplates: true,
      routeTemplate: () => routeTemplateFromSnapshot(inject(Router).routerState.snapshot.root),
    }),
  ],
})
```

`routeTemplateFromSnapshot` follows `firstChild` from the root, joins the non-empty `routeConfig.path` values (layout routes with `path: ''` are skipped) and returns `/` when none is set. In this mode the initial pageview waits for the app to become stable, so the initial navigation has matched its route before the template is read. When the resolver returns nothing, `redactRoutes` still applies and the real path is sent otherwise. The package does not depend on `@angular/router`: the helper only reads the snapshot shape.

On a public site, prefer `redactRoutes`: `routeTemplates` merges every article into one row.

## API

| Export | Description |
| --- | --- |
| `provideTakt(config?)` | `EnvironmentProviders` — install at bootstrap. |
| `TaktService` | Injectable: `track`, `pageview`, `optOut`, `optIn`, `isOptedOut`, `instance`. |
| `TaktEventDirective` | `[taktEvent]` standalone directive for click tracking. |
| `TaktBadgeComponent` | `<takt-badge>` standalone component — server-rendered SVG badge. |
| `TaktEmbedComponent` | `<takt-embed>` standalone component — server-rendered iframe. |
| `createStats(opts?)` | Public stats client (`summary`/`timeseries`/`realtime`/`breakdown`). |
| `routeTemplateFromSnapshot(root)` | Builds a route template (`/users/:id`) from a router snapshot, for `routeTemplate`. |
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
| `scrubUrl` | — | Transform URLs before they are sent (page, referrer, and the `url` prop of outbound-link and file-download events). Function prop — dev-controlled, config only (cannot be set via the `<takt-analytics>` element attribute). |
| `tagged` | `false` | Auto-track clicks on `[data-takt-tag]` elements. |
| `debug` | `false` | Log each payload to the console before sending. |
| `redactRoutes` | `[]` | Route patterns sent as the pattern instead of the real path, e.g. `['/verify/:token']`. See [Route redaction](#route-redaction). |
| `routeTemplates` | `false` | Send every page as its route template instead of the real path. Needs `routeTemplate`. |
| `routeTemplate` | none | Returns the current route template. Runs in the injection context, so it can `inject(Router)`. Used when `routeTemplates` is on. |

## License

MIT © VSK Studio
