import { describe, it, expect } from 'vitest'
import { routeTemplateFromSnapshot, type RouteSnapshotLike } from '../src/lib/route-template'

function chain(...paths: Array<string | undefined | null>): RouteSnapshotLike {
  const root: RouteSnapshotLike = { routeConfig: null, firstChild: null }
  let node = root
  for (const path of paths) {
    const child: RouteSnapshotLike = { routeConfig: path === null ? null : { path }, firstChild: null }
    node.firstChild = child
    node = child
  }
  return root
}

describe('routeTemplateFromSnapshot', () => {
  it('returns null without a root', () => {
    expect(routeTemplateFromSnapshot(null)).toBeNull()
    expect(routeTemplateFromSnapshot(undefined)).toBeNull()
  })

  it('returns / for a bare root', () => {
    expect(routeTemplateFromSnapshot({ routeConfig: null, firstChild: null })).toBe('/')
  })

  it('joins nested route paths', () => {
    expect(routeTemplateFromSnapshot(chain('users', ':id', 'posts/:postId'))).toBe('/users/:id/posts/:postId')
  })

  it('skips empty layout paths and missing route configs', () => {
    expect(routeTemplateFromSnapshot(chain('', 'blog', undefined, null, ':slug'))).toBe('/blog/:slug')
  })

  it('returns / when every path is empty', () => {
    expect(routeTemplateFromSnapshot(chain('', ''))).toBe('/')
  })

  it('keeps the ** wildcard', () => {
    expect(routeTemplateFromSnapshot(chain('docs', '**'))).toBe('/docs/**')
  })

  it('accepts a root whose own routeConfig carries a path', () => {
    expect(routeTemplateFromSnapshot({ routeConfig: { path: 'admin' } })).toBe('/admin')
  })
})
