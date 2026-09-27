export { provideTakt } from './lib/provide-takt'
export { TaktService } from './lib/takt.service'
export { TaktEventDirective } from './lib/takt-event.directive'
export { TaktBadgeComponent } from './lib/takt-badge.component'
export { TaktEmbedComponent } from './lib/takt-embed.component'
export { TAKT_CONFIG } from './lib/tokens'
export { routeTemplateFromSnapshot } from './lib/route-template'
export type { RouteSnapshotLike } from './lib/route-template'
export type { TaktConfig, TaktInstance } from './lib/types'

export { createStats, PublicApiError, badgeUrl, embedUrl, optOut, optIn, isOptedOut } from '@vskstudio/takt-core'
export type {
  Config,
  RouteTemplateResolver,
  BadgeOptions,
  EmbedOptions,
  BadgeVariant,
  BadgeGlyph,
  EmbedTheme,
  WidgetLang,
  StatsClient,
  StatsClientOptions,
  StatsParams,
  StatsPeriod,
  StatsDimension,
  StatsMetrics,
  StatsSummary,
  StatsPoint,
  StatsTimeseries,
  StatsBreakdownRow,
  StatsBreakdown,
  StatsRealtime,
} from '@vskstudio/takt-core'
