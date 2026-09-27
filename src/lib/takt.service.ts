import { Injectable } from '@angular/core'
import type { TrackOptions } from '@vskstudio/takt-core'
import { noopTakt } from './noop'
import type { TaktInstance } from './types'

/**
 * Injectable facade over the live Takt instance. Tracking is a never-throwing
 * no-op before {@link provideTakt} boots or on the server; consent goes to core.
 */
@Injectable({ providedIn: 'root' })
export class TaktService {
  private _instance: TaktInstance | null = null

  /** The live instance once booted, otherwise a shared no-op. */
  get instance(): TaktInstance {
    return this._instance ?? noopTakt()
  }

  /** @internal Set by {@link provideTakt} after createTakt runs in the browser. */
  _setInstance(instance: TaktInstance | null): void {
    this._instance = instance
  }

  track(name: string, opts?: TrackOptions): void {
    this.instance.track(name, opts)
  }

  pageview(): void {
    this.instance.pageview()
  }

  optOut(): void {
    this.instance.optOut()
  }

  optIn(): void {
    this.instance.optIn()
  }

  isOptedOut(): boolean {
    return this.instance.isOptedOut()
  }
}
