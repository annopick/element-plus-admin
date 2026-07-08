/**
 * Browser-safe posix path utilities (replacement for Node's path module).
 * Used by sidebar/tags-view route path resolution.
 */

function normalizeArray(parts: string[], allowAboveRoot: boolean): string[] {
  const res: string[] = []
  for (const p of parts) {
    if (!p || p === '.') continue
    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop()
      } else if (allowAboveRoot) {
        res.push('..')
      }
    } else {
      res.push(p)
    }
  }
  return res
}

export function resolve(...args: string[]): string {
  let resolvedPath = ''
  let resolvedAbsolute = false
  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? args[i] : '/'
    if (!path) continue
    resolvedPath = path + '/' + resolvedPath
    resolvedAbsolute = path[0] === '/'
  }
  resolvedPath = normalizeArray(resolvedPath.split('/').filter(Boolean), !resolvedAbsolute).join('/')
  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.'
}

export default { resolve }
