# @vskstudio/takt-angular

## 0.6.2

### Patch Changes

- Republish from `dist/` so the package ships its `exports`/`module`/`types` entry points again. 0.6.1 was published from the repo root (whose `package.json` lacks those fields), which left the package unresolvable — the same regression as 0.5.0. A `prepublishOnly` guard (`scripts/guard-publish-dir.mjs`) now aborts any publish started outside the built `dist/` tree, so the mistake can no longer reach the registry.

## 0.5.2

### Patch Changes

- Require takt-core >=0.6.0, whose default ingest endpoint and stats/widget host are now the hosted Takt origin (https://taktlytics.com). Docs updated to match; no wrapper code change.

## 0.5.1

### Patch Changes

- Republish from `dist/` so the package ships its `exports`/`module`/`types` entry points. 0.5.0 was published from the repo root (whose `package.json` lacks those fields), which left the package unresolvable; the `release` script now publishes the built `dist/` tree.

## 0.5.0

### Minor Changes

- 8e69653: Expose advanced tracker options: enabled, sampleRate, trackQuery, queryParams,
  scrubUrl (function prop / config only) and tagged. Peer dep raised to takt-core >=0.5.0.

## 0.3.1

### Patch Changes

- Harden the embed iframe: add `referrerpolicy="strict-origin-when-cross-origin"` and document that the bypassed `src` only ever sees a `host` that core has scheme-validated.

## 0.3.0

### Minor Changes

- Add native `TaktBadge` and `TaktEmbed` widget components and re-export the public stats client (`createStats`) and widget URL builders from `@vskstudio/takt-core`. Requires `@vskstudio/takt-core` >= 0.3.0.

## 0.2.0

### Minor Changes

- Initial release. Idiomatic Angular wrapper for `@vskstudio/takt-core`:
  - `provideTakt(config)` — standalone `EnvironmentProviders` that boots Takt in the browser only, fires the initial pageview, enables spa/outbound/files autocapture, and disposes on app destroy.
  - `TaktService` — root-provided injectable (`track`, `pageview`, `optOut`, `optIn`, `instance`), a never-throwing no-op before init and on the server.
  - `TaktEventDirective` — `[taktEvent]` standalone directive for declarative click tracking with `[taktProps]` and `[taktRevenue]`.
  - `./element` — the framework-agnostic `<takt-analytics>` custom element with a self-contained CDN bundle.
