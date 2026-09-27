export interface RouteSnapshotLike {
  routeConfig?: { path?: string } | null
  firstChild?: RouteSnapshotLike | null
}

export function routeTemplateFromSnapshot(root: RouteSnapshotLike | null | undefined): string | null {
  if (!root) return null
  const segments: string[] = []
  for (let node: RouteSnapshotLike | null | undefined = root; node; node = node.firstChild) {
    const path = node.routeConfig?.path
    if (path) segments.push(path)
  }
  return `/${segments.join('/')}`
}
