---
'@vskstudio/takt-angular': minor
---

New `redactRoutes`, `routeTemplates` and `routeTemplate` options on `provideTakt()`, forwarded to core, and a `redact-routes` attribute on `<takt-analytics>`. The `routeTemplate` resolver runs in the injection context of `provideTakt`, so it can `inject(Router)`, and the new `routeTemplateFromSnapshot()` helper turns a router snapshot into a template such as `/users/:id` without adding a dependency on `@angular/router`. With `routeTemplates` on, the initial pageview waits for the app to become stable so the initial navigation has matched its route. Requires `@vskstudio/takt-core` 0.10.0.
