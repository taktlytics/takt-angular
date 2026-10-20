---
"@vskstudio/takt-angular": minor
---

Requires `@vskstudio/takt-core` 0.12.1 and exposes what it adds. `provideTakt()` gains `redactUndecodablePaths` (default `true`, forwarded to core), and `<takt-analytics>` gains the `redact-undecodable-paths` and `file-extensions` attributes, and `<takt-analytics track-404>` enables 404 reporting (`track404` stays accepted as an alias). The package re-exports core's `normalizeHost` and the `TrackOptions` and `Payload` types. `redactRoutes` now accepts core's brace syntax and `<regex>` constraints. The minor bump is additive: new public options and a raised core peer dependency.
