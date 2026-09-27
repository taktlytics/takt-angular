---
'@vskstudio/takt-angular': minor
---

New `debug` option on `provideTakt()` and `debug` attribute on `<takt-analytics>`. `TaktService.optOut()`, `optIn()` and the new `isOptedOut()` work before `provideTakt()` boots, and the package re-exports `optOut`, `optIn` and `isOptedOut` from core. Requires `@vskstudio/takt-core` 0.9.0, where `scrubUrl` also covers outbound-link and file-download URLs.
