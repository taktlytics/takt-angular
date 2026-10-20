---
"@vskstudio/takt-angular": minor
---

Requires `@vskstudio/takt-core` 0.12.0 and exposes what it adds. `provideTakt()` gains `redactUndecodablePaths` (default `true`, forwarded to core), and `<takt-analytics>` gains the `redact-undecodable-paths` and `file-extensions` attributes, plus the existing `track404` attribute is documented. The package re-exports core's `normalizeHost` and the `TrackOptions` type. `redactRoutes` now accepts core's brace syntax and `<regex>` constraints. The minor bump is additive: new public options and a raised core peer dependency.
