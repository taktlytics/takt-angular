# @vskstudio/takt-angular


> 📚 **Documentation**: [taktlytics.com/docs/wrappers/angular](https://taktlytics.com/docs/wrappers/angular)

Idiomatic Angular wrapper for [Takt](https://github.com/taktlytics/takt-core), privacy-friendly analytics. Standalone APIs for Angular 17+.

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
      // domain defaults to location.hostname, endpoint to https://taktlytics.com/api/event
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

The badge `alt` text is an overridable input (defaults to `"takt"`). The optional `host` input must be an absolute `http(s)` URL. Core validates it and throws on anything else (e.g. a `javascript:` URL).

`badgeUrl`, `embedUrl`, `normalizeHost`, `PublicApiError`, `optOut`, `optIn`, `isOptedOut`, the `TrackOptions` and `Payload` types and the widget/stats types are re-exported from core.

## Framework-agnostic custom element

For non-Angular pages (or a plain `<script>` tag), use the self-contained `<takt-analytics>` element. Privacy attributes are on by default; set them to `"false"` or `"0"` to disable.

```ts
import { defineTaktElement } from '@vskstudio/takt-angular/element'
defineTaktElement() // also auto-runs on import
```

```html
<takt-analytics domain="example.com" outbound files></takt-analytics>
```

Add `redact-routes` with a comma-separated list of patterns to send sensitive paths as their pattern: `<takt-analytics redact-routes="/verify/:token, /reset/:code"></takt-analytics>`. The element has no router, so it does not support `routeTemplates`.

| Attribute | Default | Description |
| --- | --- | --- |
| `domain` | `location.hostname` | Site identifier sent with every event. |
| `endpoint` | `https://taktlytics.com/api/event` | Ingestion endpoint. Pass `/api/event` for a same-origin proxy. |
| `script-origin` | none | First-party origin, endpoint becomes `{origin}/api/event`. `endpoint` wins. |
| `outbound` | off | Auto-track outbound link clicks. Presence only. |
| `files` | off | Auto-track file downloads. Presence only. |
| `file-extensions` | `pdf, zip, dmg, xlsx, csv, doc, docx, ppt, pptx, rar, 7z, gz, mp3, mp4, wav, avi, mov, exe, apk, mkv, txt` | Comma-separated extensions, read only when `files` is present. Example: `pdf, zip`. |
| `track-404` | off | Report `404` events on error pages. Alias `track404`. Presence only. |
| `tagged` | off | Auto-track clicks on `[data-takt-event]` elements. Presence only. |
| `spa` | on | Track SPA navigations. `"false"` or `"0"` disables. |
| `respect-dnt` | on | Suppress events when Do Not Track is enabled. `"false"` or `"0"` disables. |
| `exclude-localhost` | on | Suppress events on localhost and private IP ranges. `"false"` or `"0"` disables. |
| `enabled` | on | `"false"` or `"0"` disables tracking entirely. |
| `sample-rate` | `1` | Fraction of sessions to record, between `0` and `1`. Example: `sample-rate="0.5"`. |
| `track-query` | off | Include the query string in page URLs. Presence enables; `"false"` or `"0"` disables. |
| `query-params` | none | Comma-separated query params kept when the query string is stripped. Example: `utm_source, utm_medium`. |
| `exclude` | none | Comma-separated path prefixes never tracked. Example: `/app, /account`. |
| `redact-routes` | none | Comma-separated route patterns sent as their pattern. Example: `/verify/:token, /reset/:code`. |
| `redact-undecodable-paths` | on | `"false"` or `"0"` decodes undecodable paths leniently instead of masking them. |
| `debug` | off | Log each payload to the console before sending. Presence enables; `"false"` or `"0"` disables. |

Attributes are split on commas, so a `<regex>` route constraint containing a comma (such as `{1,3}`) does not fit in `redact-routes`: use `provideTakt` for it.

```html
<takt-analytics files file-extensions="pdf, zip" track-404 redact-undecodable-paths="false"></takt-analytics>
```

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

`/verify/abc123` is then sent as `/verify/:token`. Patterns accept Angular syntax (`:param`, `:param?`, `*`, `**`) as well as `[param]`, `[[optional]]`, `[...rest]` and `(group)`. The brace syntax of takt-core-php also works: `{id}`, `{id?}` and `{id<\d+>}`. The rule covers the page URL, same-origin referrers, outbound and download links, and 404 paths.

Matching is case-insensitive, decodes percent-encoding (at most five passes), normalizes dot segments and repeated slashes, and ignores matrix parameters. A `<regex>` constraint must stay in the restricted grammar of takt-core (printable ASCII, a few escapes, bounded quantifiers, no range spanning `/`). A route with a constraint outside that grammar, or one that is too ambiguous to match in bounded time, masks every path it would match as `/[redacted]`. A path that cannot be decoded is masked the same way; `redactUndecodablePaths: false` decodes it leniently instead. A masked path also loses its query string and fragment.

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

`routeTemplateFromSnapshot` follows `firstChild` from the root, joins the non-empty `routeConfig.path` values (layout routes with `path: ''` are skipped) and returns `/` when none is set. In this mode the initial pageview waits for the app to become stable, so the initial navigation has matched its route before the template is read. When the resolver returns nothing, the pageview and the 404 path carry the `redactRoutes` pattern if one covers the route, and `/[redacted]` otherwise, with no query or hash. Every download is sent as `/[redacted]` on any host, and every referrer is reduced to its origin. The package does not depend on `@angular/router`: the helper only reads the snapshot shape.

On a public site, prefer `redactRoutes`: `routeTemplates` merges every article into one row.

## API

| Export | Description |
| --- | --- |
| `provideTakt(config?)` | `EnvironmentProviders`: install at bootstrap. |
| `TaktService` | Injectable: `track`, `pageview`, `optOut`, `optIn`, `isOptedOut`, `instance`. |
| `TaktEventDirective` | `[taktEvent]` standalone directive for click tracking. |
| `TaktBadgeComponent` | `<takt-badge>` standalone component: server-rendered SVG badge. |
| `TaktEmbedComponent` | `<takt-embed>` standalone component: server-rendered iframe. |
| `createStats(opts?)` | Public stats client (`summary`/`timeseries`/`realtime`/`breakdown`). |
| `routeTemplateFromSnapshot(root)` | Builds a route template (`/users/:id`) from a router snapshot, for `routeTemplate`. |
| `TAKT_CONFIG` | InjectionToken holding the resolved config. |
| `defineTaktElement` | Registers `<takt-analytics>` (from `./element`). |

### `TaktConfig`

| Option | Default | Description |
| --- | --- | --- |
| `domain` | `location.hostname` | Site identifier sent with every event. |
| `endpoint` | `https://taktlytics.com/api/event` | Ingestion endpoint. Pass `/api/event` for a same-origin first-party proxy. |
| `scriptOrigin` | n/a | First-party origin (`{origin}/api/event`); `endpoint` takes precedence. |
| `outbound` | `false` | Auto-track outbound link clicks. |
| `files` | `false` | Auto-track file downloads (or pass `string[]` to restrict extensions). |
| `track404` | `false` | Report a `404` event on error pages (`[data-takt-404]` / `<meta name="takt:404">`). |
| `spa` | `true` | Track SPA navigations (pushState / replaceState / popstate). |
| `respectDnt` | `true` | Suppress events when the browser's Do Not Track is enabled. |
| `excludeLocalhost` | `true` | Suppress events on localhost and private IP ranges. |
| `enabled` | `true` | Set to `false` to disable tracking entirely. |
| `sampleRate` | `1` | Fraction of sessions to record, between `0` and `1`. |
| `trackQuery` | `false` | Include the whole query string in page URLs sent with events. |
| `queryParams` | `[]` | Allowlist of query-param names kept when the query string is stripped (i.e. `trackQuery` is off). |
| `exclude` | `[]` | Path prefixes never tracked, e.g. `['/app', '/account']`. Segment-bounded, case-insensitive, trailing slash ignored, matched on the percent-decoded path, checked at send time. |
| `scrubUrl` | n/a | Transform URLs before they are sent (page, referrer, and the `url` prop of outbound-link and file-download events). Function prop: dev-controlled, config only (cannot be set via the `<takt-analytics>` element attribute). |
| `tagged` | `false` | Auto-track clicks on `[data-takt-event]` elements. |
| `debug` | `false` | Log each payload to the console before sending. |
| `redactRoutes` | `[]` | Route patterns sent as the pattern instead of the real path, e.g. `['/verify/:token']`. Accepts brace syntax (`{token}`) and `<regex>` constraints. See [Route redaction](#route-redaction). |
| `redactUndecodablePaths` | `true` | A path that cannot be decoded is masked as `/[redacted]` when routes are configured. `false` decodes it leniently instead, as takt-core-php does. |
| `routeTemplates` | `false` | Send every page as its route template instead of the real path. Downloads and referrers are masked too. Needs `routeTemplate`. |
| `routeTemplate` | none | Returns the current route template. Runs in the injection context, so it can `inject(Router)`. Used when `routeTemplates` is on. When it returns nothing, the path is masked (see [Route redaction](#route-redaction)). |

## License

MIT © VSK Studio
