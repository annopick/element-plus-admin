/**
 * ESM entry for the front-end XHR mock, used by the GitHub Pages demo build.
 *
 * Why this exists: the original `mock/index.js` is CommonJS (uses `require`).
 * Vite's dev server handles CJS fine, but in the production rollup bundle a
 * statically-imported CJS `.js` file leaves `module.exports` / `require()`
 * unconverted, which throws "module is not defined" in the browser. That kills
 * mockXHR(), so every API call hits the static host (→ 405 on POST).
 *
 * Fix: load the mock route data with `import.meta.glob({ eager: true })`. Vite's
 * glob loader runs its CJS→ESM transform per-file (same path dev-server uses),
 * and the result is plain ESM Rollup can bundle. Route definitions stay a
 * single source of truth in mock/*.js; only this orchestration is ESM.
 *
 * CJS interop note: `module.exports = [...]` in a .js file is exposed by Vite
 * as `{ default: [...] }`, so we read `.default` (falling back to the module
 * itself for safety).
 */
import Mock from 'mockjs'

type MockRoute = {
  url: string
  type?: string
  response: (config: { method: string; body: unknown; query: Record<string, string> }) => unknown
}

// eager: inline the modules at build time (no separate chunk, no runtime fetch).
// as the mock data must exist before mockXHR() registers interceptors.
const eagerModules = import.meta.glob('../../mock/{user,article,remote-search}.js', {
  eager: true
}) as Record<string, { default: MockRoute[] } | MockRoute[]>

const roleModule = import.meta.glob('../../mock/role/index.js', {
  eager: true
}) as Record<string, { default: MockRoute[] } | MockRoute[]>

function unwrap(mod: { default: MockRoute[] } | MockRoute[]): MockRoute[] {
  return Array.isArray(mod) ? mod : mod.default
}

const mocks: MockRoute[] = [
  ...unwrap(eagerModules['../../mock/user.js']),
  ...unwrap(eagerModules['../../mock/article.js']),
  ...unwrap(eagerModules['../../mock/remote-search.js']),
  ...unwrap(roleModule['../../mock/role/index.js'])
]

// Inlined from mock/utils.js param2Obj — keeps this module dependency-free at
// runtime (importing the CJS utils.js would reintroduce the conversion problem).
function param2Obj(url: string): Record<string, string> {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) return {}
  const obj: Record<string, string> = {}
  for (const part of search.split('&')) {
    const idx = part.indexOf('=')
    if (idx !== -1) {
      obj[part.substring(0, idx)] = part.substring(idx + 1)
    }
  }
  return obj
}

// Note: this redefines XMLHttpRequest. It is intentional and matches the
// behavior of the original mock/index.js mockXHR(). Third-party libraries that
// rely on XHR progress events (e.g. upload progress bars) may misbehave — an
// accepted trade-off for the no-backend demo. See mock/index.js comments.
export function mockXHR(): void {
  // @types/mockjs omits the XHR internals (Mock.XHR, proxy_send, custom).
  const M = Mock as any
  // https://github.com/nuysoft/Mock/issues/300
  M.XHR.prototype.proxy_send = M.XHR.prototype.send
  M.XHR.prototype.send = function (this: any, ...args: unknown[]) {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false
      if (this.responseType) {
        this.custom.xhr.responseType = this.responseType
      }
    }
    ;(this.proxy_send as (...a: unknown[]) => void)(...args)
  }

  const wrap =
    (respond: MockRoute['response']) =>
    (options: { body: string; type: string; url: string }) => {
      let result: unknown
      if (respond instanceof Function) {
        const { body, type, url } = options
        result = respond({ method: type, body: JSON.parse(body), query: param2Obj(url) })
      } else {
        result = respond
      }
      return Mock.mock(result as Record<string, unknown>)
    }

  for (const item of mocks) {
    Mock.mock(new RegExp(item.url), item.type || 'get', wrap(item.response))
  }
}
