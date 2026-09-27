import type { createTakt, RouteTemplateResolver } from '@vskstudio/takt-core'

// Public structural surface of core's Analytics. Picking the public methods
// drops the class's private members, which otherwise make the emitted .d.ts
// for token/service values invalid (TS4094).
export type TaktInstance = Pick<
  ReturnType<typeof createTakt>,
  'track' | 'pageview' | 'enableSpa' | 'enableOutbound' | 'enableFiles' | 'enable404' | 'enableTagged' | 'optOut' | 'optIn' | 'isOptedOut'
>

/** Configuration for {@link provideTakt}. Mirrors the React wrapper's props. */
export interface TaktConfig {
  /** Site identifier sent with every event. Defaults to `location.hostname`. */
  domain?: string
  /** Ingestion endpoint. Defaults to `https://taktlytics.com/api/event` (the hosted Takt origin); pass `/api/event` for a same-origin first-party proxy. */
  endpoint?: string
  /**
   * First-party origin to derive the endpoint from (`{origin}/api/event`) —
   * a custom domain you proxy through to dodge ad-blockers
   * (`endpoint` wins over it).
   */
  scriptOrigin?: string
  /** Auto-track outbound link clicks. */
  outbound?: boolean
  /** Auto-track file downloads. Pass an array to restrict to those extensions. */
  files?: boolean | string[]
  /** Track SPA navigations (history pushState/replaceState + popstate). */
  spa?: boolean
  /**
   * Report a `404` event when the page is an error page
   * (`[data-takt-404]` / `<meta name="takt:404">` marker, or a 404 HTTP status).
   */
  track404?: boolean
  /** Suppress events when the browser's Do Not Track is enabled. */
  respectDnt?: boolean
  /** Suppress events on localhost and private IP ranges. */
  excludeLocalhost?: boolean
  /** Disable tracking entirely (overrides all other options). */
  enabled?: boolean
  /** Fraction of sessions to track, between 0 and 1. */
  sampleRate?: number
  /** Include the query string in the page URL sent with events. */
  trackQuery?: boolean
  /** Allowlist of query-param names to preserve when `trackQuery` is on. */
  queryParams?: string[]
  /** Path prefixes never tracked, e.g. `['/app','/account']`. Segment-bounded: `'/app'` matches `'/app'` and `'/app/…'` but not `'/application'`. */
  exclude?: string[]
  /**
   * Transform the URL before it is sent. Called server-side only (via config);
   * cannot be set via a custom-element attribute.
   */
  scrubUrl?: (url: string) => string
  /** Auto-track clicks on `[data-takt-tag]` elements. */
  tagged?: boolean
  debug?: boolean
  redactRoutes?: string[]
  routeTemplates?: boolean
  routeTemplate?: RouteTemplateResolver
}
