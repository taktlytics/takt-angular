import { isPlatformBrowser } from '@angular/common'
import {
  DestroyRef,
  ENVIRONMENT_INITIALIZER,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  type EnvironmentProviders,
} from '@angular/core'
import { createTakt } from '@vskstudio/takt-core'
import { TaktService } from './takt.service'
import { TAKT_CONFIG } from './tokens'
import type { TaktConfig } from './types'

/**
 * Standalone install path. Registers the config and an initializer that — only
 * in the browser — creates the instance, enables the requested autocapture,
 * fires the initial pageview, and disposes everything on app destroy.
 */
export function provideTakt(config: TaktConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TAKT_CONFIG, useValue: config },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        if (!isPlatformBrowser(inject(PLATFORM_ID))) return

        const c = inject(TAKT_CONFIG)
        const service = inject(TaktService)
        const destroyRef = inject(DestroyRef)

        const takt = createTakt({
          domain: c.domain,
          endpoint: c.endpoint,
          scriptOrigin: c.scriptOrigin,
          respectDnt: c.respectDnt ?? true,
          excludeLocalhost: c.excludeLocalhost ?? true,
          enabled: c.enabled,
          sampleRate: c.sampleRate,
          trackQuery: c.trackQuery,
          queryParams: c.queryParams,
          exclude: c.exclude,
          scrubUrl: c.scrubUrl,
          debug: c.debug,
        })

        const disposers: Array<() => void> = []
        if (c.spa ?? true) disposers.push(takt.enableSpa())
        if (c.outbound) disposers.push(takt.enableOutbound())
        if (c.files) disposers.push(takt.enableFiles(Array.isArray(c.files) ? c.files : undefined))
        if (c.track404) disposers.push(takt.enable404())
        if (c.tagged) disposers.push(takt.enableTagged())

        takt.pageview()
        service._setInstance(takt)

        destroyRef.onDestroy(() => {
          disposers.forEach((dispose) => dispose())
          service._setInstance(null)
        })
      },
    },
  ])
}
