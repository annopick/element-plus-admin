# Milestone 1: 骨架搭建 + 核心闭环 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 vue-element-admin 从 Vue2/JS/Element UI 就地迁移到 Vite + Vue3 + TS + Element Plus 的可登录骨架，admin/editor 账号能登录进 dashboard 并通过核心闭环 e2e。

**Architecture:** 自底向上（方案 A）。先搭 Vite + TS + Pinia + Element Plus 骨架（Phase 0），再迁移登录/布局/权限/仪表盘核心闭环（Phase 1）。每个 Task 产出可编译、可运行的代码并提交。验收靠 `vue-tsc` + `npm run dev` + Playwright `core-loop.spec.ts`。

**Tech Stack:** Vite 5, Vue 3.4+, TypeScript 5 (strict), Pinia (setup stores), vue-router 4, Element Plus (按需自动导入), @playwright/test, vitest

**Spec:** `docs/superpowers/specs/2026-07-08-vue3-elementplus-migration-design.md`

**Scope of THIS plan:** Phase 0（骨架）+ Phase 1（核心闭环）。Phase 2-6 后续单独出计划。

---

## File Structure

新建/修改文件清单（本计划范围）：

**构建/配置（Task 1-2）**
- Create: `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `env.d.ts`, `types/router.d.ts`, `index.html`（从 public/ 移入）
- Modify: `package.json`（依赖大换血）, `.eslintrc.cjs`, `.env.*`
- Delete: `vue.config.js`, `babel.config.js`, `postcss.config.js`, `jsconfig.json`

**核心基础设施（Task 3-5）**
- Create: `src/main.ts`, `src/settings.ts`, `src/store/index.ts`, `src/store/modules/{app,user,settings,permission,tagsView,errorLog}.ts`, `src/icons/index.ts`
- Modify: `src/utils/{auth,get-page-title,validate,index}.js→.ts`, `src/utils/filters.ts`(新，合并 filters/), `src/utils/request.js→.ts`, `src/api/{user,role,article,remote-search,qiniu}.js→.ts`
- Delete: `src/main.js`, `src/store/index.js`, `src/store/getters.js`, `src/store/modules/*.js`, `src/filters/index.js`, `src/icons/index.js`

**路由 + 权限 + 指令 + composables（Task 6-8）**
- Create: `src/router/index.ts`, `src/router/modules/{components,charts,table,nested}.ts`, `src/permission.ts`, `src/composables/useResizeHandler.ts`, `src/composables/useChartResize.ts`, `src/directive/index.ts`
- Modify: `src/directive/{permission,clipboard,waves,el-drag-dialog,el-table}/*` 重写为 Vue3 指令

**布局组件（Task 9）**
- Modify: `src/layout/index.vue` + `src/layout/components/*`（11 个）全部 `<script setup>`

**核心公共组件（Task 10）**
- Modify: `src/components/{Breadcrumb,Hamburger,SvgIcon,Screenfull,SizeSelect,HeaderSearch,ErrorLog,GithubCorner,RightPanel}/*`

**核心页面（Task 11）**
- Modify: `src/views/{login,redirect,error-page,dashboard}/*`

**e2e 验收（Task 12-13）**
- Create: `playwright.config.ts`, `e2e/fixtures/{auth,console}.ts`, `e2e/core-loop.spec.ts`

---

## Task 1: 重写 package.json 依赖与脚本

**Files:**
- Modify: `package.json`
- Delete: `vue.config.js`, `babel.config.js`, `postcss.config.js`, `jsconfig.json`

- [ ] **Step 1: 备份当前 package.json，重写依赖**

完整替换 `package.json`（保留 name/repository 等元信息）：

```json
{
  "name": "vue-element-admin",
  "version": "5.0.0",
  "description": "A magical vue admin. Vue3 + TypeScript + Element Plus.",
  "author": "Pan <panfree23@gmail.com>",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "build:stage": "vue-tsc --noEmit && vite build --mode staging",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.ts --fix",
    "type-check": "vue-tsc --noEmit",
    "test:unit": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "report:e2e": "playwright show-report"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "js-cookie": "^3.0.5",
    "normalize.css": "^8.0.1",
    "nprogress": "^0.2.0",
    "path-to-regexp": "^6.2.2",
    "pinia": "^2.1.7",
    "vue": "^3.4.0",
    "vue-router": "^4.3.0"
  },
  "devDependencies": {
    "@element-plus/icons-vue": "^2.3.1",
    "@playwright/test": "^1.44.0",
    "@types/js-cookie": "^3.0.6",
    "@types/node": "^20.12.0",
    "@types/nprogress": "^0.2.3",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/eslint-config-typescript": "^13.0.0",
    "@vue/test-utils": "^2.4.5",
    "@vue/tsconfig": "^0.5.1",
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.24.0",
    "element-plus": "^2.7.0",
    "jsdom": "^24.0.0",
    "sass": "^1.75.0",
    "typescript": "^5.4.0",
    "unplugin-auto-import": "^0.17.0",
    "unplugin-vue-components": "^0.27.0",
    "vite": "^5.2.0",
    "vite-plugin-svg-icons": "^2.0.1",
    "vitest": "^1.5.0",
    "vue-tsc": "^2.0.0"
  },
  "engines": {
    "node": ">=18"
  },
  "license": "MIT"
}
```

> 注：第三方重度依赖（echarts、md-editor-v3 等）在 Phase 2-4 按需加入，本里程碑不加，避免 Phase 1 编译负担。mock 仍用 express，但 devDependencies 里需要 express + body-parser + chalk + mockjs（vite 中间件挂载）。补到 devDependencies：

```json
    "body-parser": "^1.20.0",
    "chalk": "^4.1.2",
    "express": "^4.19.0",
    "mockjs": "^1.1.0"
```

> 注意：`chalk` 用 v4（CJS），v5 是 ESM-only 会和 mock-server.js 的 require 冲突。

- [ ] **Step 2: 删除 webpack/vue-cli 专用配置文件**

```bash
rm -f vue.config.js babel.config.js postcss.config.js jsconfig.json
```

- [ ] **Step 3: 安装依赖**

Run: `npm install`
Expected: 安装成功，无 peer dependency error（element-plus 对 vue3 兼容）。

> 若有 peer 警告关于 echarts/element-plus，可忽略；本里程碑不引入二者以外的重度库。

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git rm vue.config.js babel.config.js postcss.config.js jsconfig.json
git commit -m "build: replace vue-cli/webpack with Vite, upgrade to Vue3/TS/Element Plus deps"
```

---

## Task 2: Vite/TS 配置 + index.html + env

**Files:**
- Create: `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `env.d.ts`, `types/router.d.ts`, `index.html`
- Modify: `.env.development`, `.env.production`, `.env.staging`

- [ ] **Step 1: 创建 vite.config.ts**

```ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

// 把原 mock/mock-server.js(express) 挂到 Vite dev 中间件
function mockPlugin() {
  return {
    name: 'mock-server',
    configureServer(server) {
      const { default: express } = require('express')
      const app = express()
      // 原 mock-server.js 导出的是 (app) => {...} 形式
      require('./mock/mock-server.js')(app)
      server.middlewares.use(app)
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/icons/svg')],
        symbolId: 'icon-[name]'
      }),
      AutoImport({ resolvers: [ElementPlusResolver()] }),
      Components({ resolvers: [ElementPlusResolver()] }),
      mockPlugin()
    ],
    resolve: {
      alias: { '@': resolve(__dirname, 'src') }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    },
    server: {
      port: 9527,
      open: true,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: `http://localhost:${9527}`,
          changeOrigin: true
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'element-plus': ['element-plus'],
            vendor: ['vue', 'vue-router', 'pinia']
          }
        }
      }
    }
  }
})
```

> ⚠️ `mockPlugin` 用 `require` —— Vite 配置文件走 Node CJS 上下文（tsconfig.node.json 用 module:commonjs），require 可用。`mock/mock-server.js` 内部用 `process.env.VUE_APP_BASE_API`，需在 Task 里把 env 变量改名（见 Step 6），否则正则匹配失效。下面 Step 6 处理。

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["element-plus/global", "node"],
    "strict": true,
    "noImplicitAny": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "env.d.ts",
    "types/**/*.d.ts"
  ],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: 创建 env.d.ts**

```ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_BASE_API: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 5: 创建 types/router.d.ts（扩展 RouteMeta）**

```ts
import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    roles?: string[]
    noCache?: boolean
    affix?: boolean
    breadcrumb?: boolean
    activeMenu?: string
  }
}
```

- [ ] **Step 6: 创建 index.html（从 public/index.html 移入并改造）**

先读 `public/index.html` 了解原结构，然后创建根目录 `index.html`：

```bash
# 先看原文件
cat public/index.html
```

创建 `index.html`（根目录）：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Vue Element Admin</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

删除 `public/index.html`：

```bash
rm public/index.html
```

- [ ] **Step 7: 修改 .env.* 文件（VUE_APP_ → VITE_APP_）**

`.env.development`:
```
VITE_APP_BASE_API = '/dev-api'
```
`.env.production`:
```
VITE_APP_BASE_API = '/prod-api'
```
`.env.staging`:
```
NODE_ENV = production
VITE_APP_BASE_API = '/stage-api'
```

- [ ] **Step 8: 修改 mock/mock-server.js 的 env 引用**

`mock/mock-server.js` 第 37 行：
```js
url: new RegExp(`${process.env.VUE_APP_BASE_API}${url}`),
```
改为：
```js
url: new RegExp(`${process.env.VITE_APP_BASE_API}${url}`),
```

- [ ] **Step 9: Commit**

```bash
git add vite.config.ts tsconfig.json tsconfig.node.json env.d.ts types/router.d.ts index.html .env.development .env.production .env.staging mock/mock-server.js
git rm public/index.html
git commit -m "build: add Vite/TS config, migrate index.html and env vars"
```

---

## Task 3: settings + store (Pinia) 基础设施

**Files:**
- Create: `src/settings.ts`, `src/store/index.ts`, `src/store/modules/{app,user,settings}.ts`
- Delete: `src/settings.js`, `src/store/index.js`, `src/store/getters.js`, `src/store/modules/{app,user,settings}.js`

- [ ] **Step 1: 创建 src/settings.ts**

```ts
export interface ISettings {
  title: string
  showSettings: boolean
  tagsView: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
  errorLog: 'production' | ('production' | 'development')[]
}

const settings: ISettings = {
  title: 'Vue Element Admin',
  showSettings: true,
  tagsView: true,
  fixedHeader: false,
  sidebarLogo: false,
  errorLog: 'production'
}

export default settings
```

- [ ] **Step 2: 创建 src/store/index.ts**

```ts
import { createPinia } from 'pinia'

const store = createPinia()

export default store
```

- [ ] **Step 3: 创建 src/store/modules/app.ts**

```ts
import { defineStore } from 'pinia'
import Cookies from 'js-cookie'

export interface ISidebar {
  opened: boolean
  withoutAnimation: boolean
}

export const useAppStore = defineStore('app', () => {
  const sidebar = ref<ISidebar>({
    opened: Cookies.get('sidebarStatus') ? !!Number(Cookies.get('sidebarStatus')) : true,
    withoutAnimation: false
  })
  const device = ref<'desktop' | 'mobile'>('desktop')
  const size = ref<string>(Cookies.get('size') || 'default')

  function toggleSideBar() {
    sidebar.value.opened = !sidebar.value.opened
    sidebar.value.withoutAnimation = false
    Cookies.set('sidebarStatus', sidebar.value.opened ? '1' : '0')
  }
  function closeSideBar({ withoutAnimation }: { withoutAnimation: boolean }) {
    Cookies.set('sidebarStatus', '0')
    sidebar.value.opened = false
    sidebar.value.withoutAnimation = withoutAnimation
  }
  function toggleDevice(val: 'desktop' | 'mobile') {
    device.value = val
  }
  function setSize(val: string) {
    size.value = val
    Cookies.set('size', val)
  }

  return { sidebar, device, size, toggleSideBar, closeSideBar, toggleDevice, setSize }
})
```

> 注意：Element Plus 的 size 默认值是 `default`（不是 Element UI 的 `medium`），这里改用 `default`。

- [ ] **Step 4: 创建 src/store/modules/user.ts**

```ts
import { defineStore } from 'pinia'
import { login as loginApi, getInfo as getInfoApi, logout as logoutApi } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { useTagsViewStore } from './tagsView'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const name = ref('')
  const avatar = ref('')
  const introduction = ref('')
  const roles = ref<string[]>([])

  function login(userInfo: { username: string; password: string }) {
    const { username, password } = userInfo
    return new Promise<void>((resolve, reject) => {
      loginApi({ username: username.trim(), password })
        .then((response: any) => {
          const { data } = response
          token.value = data.token
          setToken(data.token)
          resolve()
        })
        .catch((error: unknown) => reject(error))
    })
  }

  function getInfo() {
    return new Promise<any>((resolve, reject) => {
      getInfoApi(token.value)
        .then((response: any) => {
          const { data } = response
          if (!data) reject('Verification failed, please Login again.')
          const { roles: r, name: n, avatar: a, introduction: i } = data
          if (!r || r.length <= 0) reject('getInfo: roles must be a non-null array!')
          roles.value = r
          name.value = n
          avatar.value = a
          introduction.value = i
          resolve(data)
        })
        .catch((error: unknown) => reject(error))
    })
  }

  function logout() {
    return new Promise<void>((resolve, reject) => {
      logoutApi()
        .then(() => {
          token.value = ''
          roles.value = []
          removeToken()
          resetRouter()
          useTagsViewStore().delAllViews()
          resolve()
        })
        .catch((error: unknown) => reject(error))
    })
  }

  function resetToken() {
    return new Promise<void>((resolve) => {
      token.value = ''
      roles.value = []
      removeToken()
      resolve()
    })
  }

  return { token, name, avatar, introduction, roles, login, getInfo, logout, resetToken }
})
```

> 跨 store 调用：logout 里直接 `useTagsViewStore().delAllViews()`（Pinia 允许）。tagsView store 在 Task 4 创建——为避免循环依赖，本 Task 先 import 但函数体内调用，运行时 tagsView 已注册。

- [ ] **Step 5: 创建 src/store/modules/settings.ts**

```ts
import { defineStore } from 'pinia'
import defaultSettings from '@/settings'

const { showSettings, tagsView, fixedHeader, sidebarLogo } = defaultSettings

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('#1890ff')
  const showSettingsFlag = ref(showSettings)
  const tagsViewEnabled = ref(tagsView)
  const fixedHeaderEnabled = ref(fixedHeader)
  const sidebarLogoEnabled = ref(sidebarLogo)

  function changeSetting({ key, value }: { key: string; value: any }) {
    switch (key) {
      case 'theme': theme.value = value; break
      case 'showSettings': showSettingsFlag.value = value; break
      case 'tagsView': tagsViewEnabled.value = value; break
      case 'fixedHeader': fixedHeaderEnabled.value = value; break
      case 'sidebarLogo': sidebarLogoEnabled.value = value; break
    }
  }

  return { theme, showSettings: showSettingsFlag, tagsView: tagsViewEnabled, fixedHeader: fixedHeaderEnabled, sidebarLogo: sidebarLogoEnabled, changeSetting }
})
```

> 注：原 settings store 的 theme 来自 `element-variables.scss` 的 `:export`。Element Plus 改用 CSS 变量，theme 初值直接写 `#1890ff`（与原 SCSS 主色一致）。

- [ ] **Step 6: 删除旧文件**

```bash
rm src/settings.js src/store/index.js src/store/getters.js src/store/modules/app.js src/store/modules/user.js src/store/modules/settings.js
```

- [ ] **Step 7: Commit**

```bash
git add src/settings.ts src/store/
git rm src/settings.js src/store/index.js src/store/getters.js src/store/modules/app.js src/store/modules/user.js src/store/modules/settings.js
git commit -m "feat(store): migrate settings + app/user/settings stores to Pinia (setup style)"
```

---

## Task 4: 剩余 store 模块 (permission, tagsView, errorLog)

**Files:**
- Create: `src/store/modules/{permission,tagsView,errorLog}.ts`
- Delete: `src/store/modules/{permission,tagsView,errorLog}.js`

- [ ] **Step 1: 创建 src/store/modules/permission.ts**

```ts
import { defineStore } from 'pinia'
import { asyncRoutes, constantRoutes, type AppRouteRecord } from '@/router'

function hasPermission(roles: string[], route: AppRouteRecord): boolean {
  if (route.meta && route.meta.roles) {
    return roles.some((role) => route.meta!.roles!.includes(role))
  }
  return true
}

export function filterAsyncRoutes(routes: AppRouteRecord[], roles: string[]): AppRouteRecord[] {
  const res: AppRouteRecord[] = []
  routes.forEach((route) => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) tmp.children = filterAsyncRoutes(tmp.children, roles)
      res.push(tmp)
    }
  })
  return res
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<AppRouteRecord[]>([])
  const addRoutes = ref<AppRouteRecord[]>([])

  function generateRoutes(roles: string[]): Promise<AppRouteRecord[]> {
    return new Promise((resolve) => {
      let accessedRoutes: AppRouteRecord[]
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      addRoutes.value = accessedRoutes
      routes.value = constantRoutes.concat(accessedRoutes)
      resolve(accessedRoutes)
    })
  }

  return { routes, addRoutes, generateRoutes }
})
```

> 依赖 `AppRouteRecord` 类型，在 Task 6 的 router/index.ts 导出。

- [ ] **Step 2: 创建 src/store/modules/tagsView.ts**

```ts
import { defineStore } from 'pinia'

export interface TagView {
  name?: string
  path: string
  fullPath?: string
  title?: string
  meta?: { title?: string; affix?: boolean; noCache?: boolean }
  matched?: any[]
  query?: any
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  function addView(view: TagView) {
    addVisitedView(view)
    addCachedView(view)
  }
  function addVisitedView(view: TagView) {
    if (visitedViews.value.some((v) => v.path === view.path)) return
    visitedViews.value.push({ ...view, title: view.meta?.title || 'no-name' })
  }
  function addCachedView(view: TagView) {
    const name = view.name
    if (!name) return
    if (cachedViews.value.includes(name)) return
    if (!view.meta?.noCache) cachedViews.value.push(name)
  }
  function delView(view: TagView) {
    delVisitedView(view)
    delCachedView(view)
  }
  function delVisitedView(view: TagView) {
    for (const [i, v] of visitedViews.value.entries()) {
      if (v.path === view.path) { visitedViews.value.splice(i, 1); break }
    }
  }
  function delCachedView(view: TagView) {
    const name = view.name
    if (!name) return
    const index = cachedViews.value.indexOf(name)
    index > -1 && cachedViews.value.splice(index, 1)
  }
  function delOthersViews(view: TagView) {
    visitedViews.value = visitedViews.value.filter((v) => v.meta?.affix || v.path === view.path)
    const name = view.name
    const index = name ? cachedViews.value.indexOf(name) : -1
    cachedViews.value = index > -1 ? cachedViews.value.slice(index, index + 1) : []
  }
  function delAllViews() {
    const affixTags = visitedViews.value.filter((tag) => tag.meta?.affix)
    visitedViews.value = affixTags
    cachedViews.value = []
  }
  function updateVisitedView(view: TagView) {
    for (let i = 0; i < visitedViews.value.length; i++) {
      if (visitedViews.value[i].path === view.path) {
        visitedViews.value[i] = Object.assign({}, visitedViews.value[i], view)
        break
      }
    }
  }

  return {
    visitedViews, cachedViews,
    addView, addVisitedView, addCachedView,
    delView, delVisitedView, delCachedView,
    delOthersViews, delAllViews, updateVisitedView
  }
})
```

- [ ] **Step 3: 创建 src/store/modules/errorLog.ts**

```ts
import { defineStore } from 'pinia'

export interface ErrorLogEntry {
  err: Error
  vm: any
  info: string
  url: string
}

export const useErrorLogStore = defineStore('errorLog', () => {
  const logs = ref<ErrorLogEntry[]>([])

  function addErrorLog(log: ErrorLogEntry) { logs.value.push(log) }
  function clearErrorLog() { logs.value.splice(0) }

  return { logs, addErrorLog, clearErrorLog }
})
```

- [ ] **Step 4: 删除旧文件**

```bash
rm src/store/modules/permission.js src/store/modules/tagsView.js src/store/modules/errorLog.js
```

- [ ] **Step 5: Commit**

```bash
git add src/store/modules/
git rm src/store/modules/permission.js src/store/modules/tagsView.js src/store/modules/errorLog.js
git commit -m "feat(store): migrate permission/tagsView/errorLog stores to Pinia"
```

---

## Task 5: utils + api 层迁移 (.js → .ts)

**Files:**
- Modify(rename): `src/utils/{auth,get-page-title,validate,index}.js` → `.ts`
- Create: `src/utils/filters.ts` (合并 src/filters/index.js)
- Modify(rename): `src/utils/request.js` → `.ts`
- Modify(rename): `src/api/*.js` → `.ts`
- Delete: `src/filters/index.js`

- [ ] **Step 1: src/utils/auth.ts**

```ts
import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken(): string | undefined {
  return Cookies.get(TokenKey)
}
export function setToken(token: string): string | undefined {
  return Cookies.set(TokenKey, token)
}
export function removeToken(): void {
  Cookies.remove(TokenKey)
}
```

- [ ] **Step 2: src/utils/get-page-title.ts**

```ts
import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Vue Element Admin'

export default function getPageTitle(pageTitle?: string): string {
  if (pageTitle) return `${pageTitle} - ${title}`
  return `${title}`
}
```

- [ ] **Step 3: src/utils/validate.ts**（原样 + 类型签名）

```ts
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function validUsername(str: string): boolean {
  const validMap = ['admin', 'editor']
  return validMap.indexOf(str.trim()) >= 0
}

export function validURL(url: string): boolean {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

export function validLowerCase(str: string): boolean {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

export function validUpperCase(str: string): boolean {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

export function validAlphabets(str: string): boolean {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

export function validEmail(email: string): boolean {
  const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

export function isString(str: unknown): boolean {
  return typeof str === 'string' || str instanceof String
}

export function isArray(arg: unknown): arg is any[] {
  return Array.isArray(arg)
}
```

- [ ] **Step 4: src/utils/index.ts**（迁移 parseTime/formatTime/param2Obj 等全部工具函数，加类型）

把原 `src/utils/index.js` 所有函数逐一加类型签名。关键改动：
- `parseTime(time, cFormat?)`：参数 `time: Date | string | number`，返回 `string | null`
- `param2Obj(url: string): Record<string, string>`
- 其余函数加基础类型。完整文件较长，逐个函数照搬原逻辑加类型即可。

执行重命名：`git mv src/utils/index.js src/utils/index.ts` 然后编辑加类型。

- [ ] **Step 5: src/utils/filters.ts（合并 filters/）**

```ts
export { parseTime, formatTime } from '@/utils'

function pluralize(time: number, label: string): string {
  if (time === 1) return time + label
  return time + label + 's'
}

export function timeAgo(time: number): string {
  const between = Date.now() / 1000 - Number(time)
  if (between < 3600) return pluralize(~~(between / 60), ' minute')
  else if (between < 86400) return pluralize(~~(between / 3600), ' hour')
  else return pluralize(~~(between / 86400), ' day')
}

export function numberFormatter(num: number, digits: number): string {
  const si = [
    { value: 1e18, symbol: 'E' }, { value: 1e15, symbol: 'P' },
    { value: 1e12, symbol: 'T' }, { value: 1e9, symbol: 'G' },
    { value: 1e6, symbol: 'M' }, { value: 1e3, symbol: 'k' }
  ]
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
    }
  }
  return num.toString()
}

export function toThousandFilter(num: number | string): string {
  return (+num || 0).toString().replace(/^-?\d+/g, (m) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

export function uppercaseFirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
```

- [ ] **Step 6: src/utils/request.ts**

```ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/auth'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 5000
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['X-Token'] = getToken() || ''
    }
    return config
  },
  (error: unknown) => {
    console.log(error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.code !== 20000) {
      ElMessage({ message: res.message || 'Error', type: 'error', duration: 5 * 1000 })
      if ([50008, 50012, 50014].includes(res.code)) {
        ElMessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login', cancelButtonText: 'Cancel', type: 'warning'
        }).then(() => {
          useUserStore().resetToken().then(() => location.reload())
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  (error: unknown) => {
    console.log('err' + error)
    ElMessage({ message: (error as Error).message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

export default service
```

> 关键改动：`store.getters.token` → `useUserStore().token`；`MessageBox/Message` → `ElMessageBox/ElMessage`；`process.env.VUE_APP_BASE_API` → `import.meta.env.VITE_APP_BASE_API`。

- [ ] **Step 7: api 层 .js → .ts（5 个文件，加类型）**

`src/api/user.ts`:
```ts
import request from '@/utils/request'

export interface ILoginData { username: string; password: string }

export function login(data: ILoginData) {
  return request({ url: '/vue-element-admin/user/login', method: 'post', data })
}
export function getInfo(token: string) {
  return request({ url: '/vue-element-admin/user/info', method: 'get', params: { token } })
}
export function logout() {
  return request({ url: '/vue-element-admin/user/logout', method: 'post' })
}
```

其余 `role.ts`/`article.ts`/`remote-search.ts`/`qiniu.ts` 同理 `git mv *.js *.ts` 后给 data/params 加基础类型（可先用 `any` 兜底，Phase 2 补精确类型）。

- [ ] **Step 8: 删除 src/filters/**

```bash
rm -rf src/filters
```

- [ ] **Step 9: 验证类型检查**

Run: `npx vue-tsc --noEmit`
Expected: 可能有 router/store 未定义错误（还没创建），但 utils/api 自身应无错误。本步只确认 utils/api 迁移无误，router 相关错误在 Task 6 修复。

- [ ] **Step 10: Commit**

```bash
git add src/utils/ src/api/
git rm -r src/filters
git commit -m "feat(utils): migrate utils + api to TypeScript, merge filters into utils"
```

---

## Task 6: router (vue-router 4) 迁移

**Files:**
- Create: `src/router/index.ts`, `src/router/modules/{components,charts,table,nested}.ts`
- Delete: `src/router/index.js`, `src/router/modules/*.js`

- [ ] **Step 1: 创建 src/router/index.ts**

```ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

/* Router Modules */
import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import tableRouter from './modules/table'
import nestedRouter from './modules/nested'

export interface AppRouteRecord extends RouteRecordRaw {
  children?: AppRouteRecord[]
  meta?: {
    title?: string
    icon?: string
    roles?: string[]
    noCache?: boolean
    affix?: boolean
    breadcrumb?: boolean
    activeMenu?: string
  }
}

export const constantRoutes: AppRouteRecord[] = [
  {
    path: '/redirect',
    component: Layout,
    children: [
      { path: '/redirect/:path(.*)', component: () => import('@/views/redirect/index.vue') }
    ]
  } as AppRouteRecord,
  { path: '/login', component: () => import('@/views/login/index.vue') },
  { path: '/auth-redirect', component: () => import('@/views/login/auth-redirect.vue') },
  { path: '/404', component: () => import('@/views/error-page/404.vue') },
  { path: '/401', component: () => import('@/views/error-page/401.vue') },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/index.vue'), meta: { title: 'Dashboard', icon: 'dashboard', affix: true } }
    ]
  } as AppRouteRecord,
  {
    path: '/documentation',
    component: Layout,
    children: [
      { path: 'index', name: 'Documentation', component: () => import('@/views/documentation/index.vue'), meta: { title: 'Documentation', icon: 'documentation', affix: true } }
    ]
  } as AppRouteRecord,
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      { path: 'index', name: 'Guide', component: () => import('@/views/guide/index.vue'), meta: { title: 'Guide', icon: 'guide', noCache: true } }
    ]
  } as AppRouteRecord,
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    children: [
      { path: 'index', name: 'Profile', component: () => import('@/views/profile/index.vue'), meta: { title: 'Profile', icon: 'user', noCache: true } }
    ]
  } as AppRouteRecord
]

export const asyncRoutes: AppRouteRecord[] = [
  // Phase 1: 暂时只保留 permission（核心闭环需要），其余 Phase 2+ 逐步恢复
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/page',
    name: 'Permission',
    meta: { title: 'Permission', icon: 'lock', roles: ['admin', 'editor'] },
    children: [
      { path: 'page', name: 'PagePermission', component: () => import('@/views/permission/page.vue'), meta: { title: 'Page Permission', roles: ['admin'] } },
      { path: 'directive', name: 'DirectivePermission', component: () => import('@/views/permission/directive.vue'), meta: { title: 'Directive Permission' } },
      { path: 'role', name: 'RolePermission', component: () => import('@/views/permission/role.vue'), meta: { title: 'Role Permission', roles: ['admin'] } }
    ]
  } as AppRouteRecord,
  // 404 必须放最后
  { path: '/:pathMatch(.*)*', redirect: '/404', meta: { hidden: true } } as AppRouteRecord
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes
})

export function resetRouter() {
  const newRouter = createRouter({ history: createWebHistory(), scrollBehavior: () => ({ top: 0 }), routes: constantRoutes })
  // vue-router 4: 用 removeRoute 移除动态路由
  ;(router as any).matcher = (newRouter as any).matcher
}

export default router
```

> 注：`resetRouter` 在 vue-router 4 官方推荐用 `router.getRoutes()` 过滤移除，但原项目大量依赖 `matcher` 赋值。vue-router 4.x 仍保留 `matcher` 属性（虽未公开 API）可赋值，作为过渡方案。若 vue-router 版本移除了 matcher，则改为遍历 `router.removeRoute(name)`。

- [ ] **Step 2: 创建 4 个 router modules（.ts）**

逐个 `git mv src/router/modules/{components,charts,table,nested}.js .ts`，内容基本不变（路由对象已符合结构），仅需：
- 确保返回类型 `AppRouteRecord[]`
- import 的 view 用 `.vue` 后缀（Vite 要求）：`import('@/views/...')` 改为 `import('@/views/....vue')`

> Phase 1 这些模块指向的页面大部分还没迁移，会导致 `vue-tsc` 报错。**临时方案**：本 Task 先把 4 个 module 文件改为 `.ts` 但在 `asyncRoutes` 里**注释掉**它们的引用（上面 Step 1 已注释），仅保留 permission。Phase 2-4 恢复。

- [ ] **Step 3: 删除旧 router 文件**

```bash
rm src/router/index.js
```
（4 个 modules 已 git mv）

- [ ] **Step 4: Commit**

```bash
git add src/router/
git rm src/router/index.js
git commit -m "feat(router): migrate to vue-router 4 (createRouter), restore permission routes"
```

---

## Task 7: permission.ts 路由守卫 + icons/main.ts

**Files:**
- Create: `src/permission.ts`, `src/main.ts`, `src/icons/index.ts`
- Delete: `src/permission.js`, `src/main.js`, `src/icons/index.js`

- [ ] **Step 1: 创建 src/permission.ts**

```ts
import router from './router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta?.title)

  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const userStore = useUserStore()
      const hasRoles = userStore.roles && userStore.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          const { roles } = await userStore.getInfo()
          const accessRoutes = await usePermissionStore().generateRoutes(roles)
          // vue-router 4: 逐条 addRoute
          accessRoutes.forEach((route) => router.addRoute(route))
          next({ ...to, replace: true })
        } catch (error) {
          await userStore.resetToken()
          ElMessage.error((error as Error)?.message || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
```

> 关键改动：`router.addRoutes` → 循环 `router.addRoute`；`Message` → `ElMessage`；store getters → Pinia store。

- [ ] **Step 2: 创建 src/icons/index.ts**

```ts
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'
import type { App } from 'vue'

export function setupIcons(app: App) {
  app.component('svg-icon', SvgIcon)
}
```

> `virtual:svg-icons-register` 是 vite-plugin-svg-icons 提供的虚拟模块，自动注册所有 svg。需要 env.d.ts 声明（已含 `vite/client`，但 virtual 模块需补充）。追加到 env.d.ts：

```ts
declare module 'virtual:svg-icons-register'
```

- [ ] **Step 3: 创建 src/main.ts**

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import setupIcons from './icons'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import Cookies from 'js-cookie'
import 'normalize.css/normalize.css'
import '@/styles/index.scss'

import './permission'
import './router/permission-guard' // 若拆分可省，本例 permission.ts 已含守卫

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

setupIcons(app)

app.use(store)
app.use(router)
app.use(ElementPlus, { locale: zhCn, size: Cookies.get('size') || 'default' })

app.mount('#app')
```

> 删除 `import './router/permission-guard'` 这行（笔误，permission.ts 已含守卫）。最终 main.ts 不要这行。

- [ ] **Step 4: 删除旧文件**

```bash
rm src/permission.js src/main.js src/icons/index.js
```

- [ ] **Step 5: Commit**

```bash
git add src/permission.ts src/main.ts src/icons/index.ts env.d.ts
git rm src/permission.js src/main.js src/icons/index.js
git commit -m "feat: setup main.ts, permission guard, icons (Vue3 + Element Plus)"
```

---

## Task 8: 指令 + composables 迁移

**Files:**
- Create: `src/composables/useResizeHandler.ts`, `src/composables/useChartResize.ts`, `src/directive/index.ts`
- Modify: `src/directive/permission/permission.js` → `.ts`, `src/directive/clipboard/clipboard.js` → `.ts`, `src/directive/waves/waves.js` → `.ts`, `src/directive/el-drag-dialog/drag.js` → `.ts`, `src/directive/el-table/adaptive.js` → `.ts`
- Delete: `src/layout/mixin/ResizeHandler.js`, `src/components/Charts/mixins/resize.js`

- [ ] **Step 1: src/directive/permission/permission.ts（inserted→mounted, update→updated）**

```ts
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const { value } = binding
  const roles = useUserStore().roles

  if (value && value instanceof Array) {
    if (value.length > 0) {
      const permissionRoles = value
      const hasPermission = roles.some((role) => permissionRoles.includes(role))
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error(`need roles! Like v-permission="['admin','editor']"`)
  }
}

const permission: Directive = {
  mounted(el, binding) { checkPermission(el, binding) },
  updated(el, binding) { checkPermission(el, binding) }
}

export default permission
```

- [ ] **Step 2: src/directive/clipboard/clipboard.ts（WeakMap 方案）**

```ts
import type { Directive, DirectiveBinding } from 'vue'
import ClipboardJS from 'clipboard'

type ElWithClip = HTMLElement & { __clip_success__?: (e: ClipboardJS.Event) => void; __clip_error__?: (e: ClipboardJS.Event) => void }
const clipboardMap = new WeakMap<HTMLElement, ClipboardJS>()

const clipboard: Directive = {
  mounted(el: ElWithClip, binding: DirectiveBinding) {
    if (binding.arg === 'success') {
      el.__clip_success__ = binding.value
    } else if (binding.arg === 'error') {
      el.__clip_error__ = binding.value
    } else {
      const clip = new ClipboardJS(el, {
        text: () => binding.value,
        action: () => (binding.arg === 'cut' ? 'cut' : 'copy')
      })
      clip.on('success', (e) => el.__clip_success__ && el.__clip_success__(e))
      clip.on('error', (e) => el.__clip_error__ && el.__clip_error__(e))
      clipboardMap.set(el, clip)
    }
  },
  updated(el: ElWithClip, binding: DirectiveBinding) {
    if (binding.arg === 'success') {
      el.__clip_success__ = binding.value
    } else if (binding.arg === 'error') {
      el.__clip_error__ = binding.value
    } else {
      const clip = clipboardMap.get(el)
      if (clip) {
        clip.text = () => binding.value
        clip.action = () => (binding.arg === 'cut' ? 'cut' : 'copy')
      }
    }
  },
  unmounted(el: ElWithClip, binding: DirectiveBinding) {
    if (binding.arg === 'success') {
      delete el.__clip_success__
    } else if (binding.arg === 'error') {
      delete el.__clip_error__
    } else {
      const clip = clipboardMap.get(el)
      if (clip) { clip.destroy(); clipboardMap.delete(el) }
    }
  }
}

export default clipboard
```

> 需 `npm i -S clipboard @types/clipboard`（Task 1 应已含，若漏补）。

- [ ] **Step 3: src/directive/waves/waves.ts（WeakMap + 钩子重命名）**

照原 `waves.js` 逻辑，把 `bind→beforeMount`、`update→updated`、`unbind→unmounted`，`el[context]` 改用 `WeakMap<HTMLElement, { removeHandle: (e: Event) => void }>`。其余 DOM 操作逻辑不变。

- [ ] **Step 4: el-drag-dialog/drag.ts + el-table/adaptive.ts**

`git mv` 后改钩子名：`bind→beforeMount`、`update→updated`、`unbind→unmounted`、`inserted→mounted`。逻辑不变。

- [ ] **Step 5: src/directive/index.ts（统一注册）**

```ts
import type { App } from 'vue'
import permission from './permission/permission'
import clipboard from './clipboard/clipboard'
import waves from './waves/waves'
import drag from './el-drag-dialog/drag'
import adaptive from './el-table/adaptive'

export function setupDirectives(app: App) {
  app.directive('permission', permission)
  app.directive('clipboard', clipboard)
  app.directive('waves', waves)
  app.directive('drag-dialog', drag)
  app.directive('adaptive', adaptive)
}
```

> 各 directive 的 index.js（re-export）保持，但改为 .ts。

- [ ] **Step 6: src/composables/useResizeHandler.ts**

```ts
import { onBeforeMount, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/store/modules/app'

const WIDTH = 992

export function useResizeHandler() {
  const appStore = useAppStore()

  const isMobile = (): boolean => {
    const rect = document.body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }

  const resizeHandler = (): void => {
    if (!document.hidden) {
      const mobile = isMobile()
      appStore.toggleDevice(mobile ? 'mobile' : 'desktop')
      if (mobile) appStore.closeSideBar({ withoutAnimation: true })
    }
  }

  onBeforeMount(() => {
    window.addEventListener('resize', resizeHandler)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
  })
  // mounted 等价
  if (typeof window !== 'undefined' && isMobile()) {
    appStore.toggleDevice('mobile')
    appStore.closeSideBar({ withoutAnimation: true })
  }
}
```

- [ ] **Step 7: src/composables/useChartResize.ts**（Phase 1 用不到，但占位）

创建空占位 composable，Phase 4 实现 echarts resize 逻辑。先：
```ts
export function useChartResize() {
  // Phase 4 实现：echarts 5 chart 实例 resize
}
```

- [ ] **Step 8: 删除旧 mixin**

```bash
rm src/layout/mixin/ResizeHandler.js
rmdir src/layout/mixin
rm -rf src/components/Charts/mixins
```

- [ ] **Step 9: Commit**

```bash
git add src/directive/ src/composables/
git rm -r src/layout/mixin src/components/Charts/mixins
git commit -m "feat: rewrite directives for Vue3 (WeakMap), add composables, remove mixins"
```

---

## Task 9: layout 组件迁移 (11 个 .vue → script setup)

**Files:**
- Modify: `src/layout/index.vue`, `src/layout/components/{Navbar,AppMain}.vue`, `src/layout/components/Sidebar/{index,Link,Item,Logo,SidebarItem}.vue`, `src/layout/components/Settings/index.vue`, `src/layout/components/TagsView/{index,ScrollPane}.vue`

这是本里程碑最大的单 Task。每个组件统一改造：Options API → `<script setup lang="ts">`，`this.$store` → Pinia store，`this.$route/$router` → `useRoute/useRouter`，`.sync`→`v-model`，`slot-scope`→`#default`，`el-icon-x`→`<component :is>`，functional 去掉。

> 因篇幅，下面给出 **`layout/index.vue` 和 `Sidebar/Item.vue`（functional）的完整改造**，其余 9 个按相同模式逐个迁移，每个迁移完手动 `npm run dev` 验证渲染。

- [ ] **Step 1: src/layout/index.vue**

```vue
<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div :class="{ hasTagsView: needTagsView }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="settingsStore.showSettings">
        <settings />
      </right-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RightPanel from '@/components/RightPanel/index.vue'
import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components'
import { useResizeHandler } from '@/composables/useResizeHandler'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'

useResizeHandler()

const appStore = useAppStore()
const settingsStore = useSettingsStore()

const sidebar = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

function handleClickOutside() {
  appStore.closeSideBar({ withoutAnimation: false })
}
</script>

<style lang="scss" scoped>
@import "@/styles/mixin.scss";
@import "@/styles/variables.scss";
.app-wrapper { @include clearfix; position: relative; height: 100%; width: 100%;
  &.mobile.openSidebar { position: fixed; top: 0; } }
.drawer-bg { background: #000; opacity: 0.3; width: 100%; top: 0; height: 100%; position: absolute; z-index: 999; }
.fixed-header { position: fixed; top: 0; right: 0; z-index: 9; width: calc(100% - #{$sideBarWidth}); transition: width 0.28s; }
.hideSidebar .fixed-header { width: calc(100% - 54px) }
.mobile .fixed-header { width: 100%; }
</style>
```

> 关键：`@import "~@/..."` 的 `~` 在 Vite 下要去掉（Vite 不需要 ~ 前缀）。全项目搜索 `~@/` 改 `@/`，`~element-ui` 整体删除。

- [ ] **Step 2: src/layout/components/Sidebar/Item.vue（functional 去掉）**

```vue
<template>
  <span v-if="icon">
    <component :is="icon" v-if="icon.includes('el-icon')" class="sub-el-icon" />
    <svg-icon v-else :icon-class="icon" />
  </span>
  <template v-if="title"><span>{{ title }}</span></template>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title?: string }>(), { icon: '', title: '' })
</script>

<style scoped>
.sub-el-icon { color: currentColor; width: 1em; height: 1em; }
</style>
```

> 注：原 `icon.includes('el-icon')` 判断，Element Plus 图标是组件名如 `Edit`，不再有 `el-icon-` 前缀。这里判断逻辑需配合全局注册后的图标名。Phase 1 sidebar 图标用 svg-icon（dashboard/edit 等），`el-icon` 分支暂时走不到，保留兼容。

- [ ] **Step 3: 迁移其余 9 个 layout 组件**

逐个迁移 `Navbar.vue`、`AppMain.vue`、`Sidebar/index.vue`、`Sidebar/Link.vue`、`Sidebar/Logo.vue`、`Sidebar/SidebarItem.vue`、`Settings/index.vue`、`TagsView/index.vue`、`TagsView/ScrollPane.vue`。

通用改造规则（每文件执行）：
1. `<script>` → `<script setup lang="ts">`
2. `import { mapState/mapGetters } from 'vuex'` → 用对应 Pinia store 的 computed
3. `this.$route` → `const route = useRoute()`，`this.$router` → `const router = useRouter()`
4. `this.$refs.xxx` → `const xxxRef = ref()`
5. `@click.native` → `@click`
6. `.sync` → `v-model:xxx`
7. `slot-scope="..."` → `#default="..."`
8. `<style>` 里的 `~@/` → `@/`、`~element-ui` 删除

- [ ] **Step 4: 验证 dev 启动（dashboard 用占位）**

由于 dashboard 还没迁移，临时把 `src/views/dashboard/index.vue` 改为最小占位：

```vue
<template><div class="dashboard-placeholder">Dashboard (迁移中)</div></template>
<script setup lang="ts"></script>
```

Run: `npm run dev`
Expected: dev server 启动，访问 `http://localhost:9527` 重定向到 `/login`（因无 token）。登录页可能样式异常（login 未迁移），先不验证登录流程。

> 若报错，逐个修复 import 路径和类型。layout 渲染需要登录后才能看到，可在浏览器手动跳过登录直接访问 `/dashboard`（临时注释 permission.ts 守卫测试）。

- [ ] **Step 5: Commit**

```bash
git add src/layout/
git commit -m "feat(layout): migrate 11 layout components to <script setup> + Element Plus"
```

---

## Task 10: 核心公共组件迁移

**Files:**
- Modify: `src/components/{Breadcrumb,Hamburger,SvgIcon,Screenfull,SizeSelect,HeaderSearch,ErrorLog,GithubCorner,RightPanel}/*`

- [ ] **Step 1: 逐个迁移 9 个公共组件**

按 Task 9 的通用改造规则，迁移这 9 个组件。重点：
- **Breadcrumb**：用 `path-to-regexp` 6（API 破坏）。原 `import pathToRegexp from 'path-to-regexp'` + `pathToRegexp.compile(path)(params)` → v6 改为 `import { compile } from 'path-to-regexp'` + `compile(path)(params)`
- **Screenfull**：`screenfull` 6 API 基本兼容，`screenfull.isEnabled` 不变
- **SizeSelect**：`this.$ELEMENT.size = size` → `appStore.setSize(size)`
- **SvgIcon**：保持，props 加类型
- **HeaderSearch**：`fuse.js` 6 API 兼容
- **RightPanel**：`this.$store` → store，`.sync` → `v-model`

- [ ] **Step 2: 验证 layout 渲染依赖的组件无类型错误**

Run: `npx vue-tsc --noEmit`
Expected: 这 9 个组件 + layout 无类型错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/
git commit -m "feat(components): migrate 9 core components to script setup (Breadcrumb, Hamburger, etc.)"
```

---

## Task 11: 核心页面迁移 (login + redirect + error-page + dashboard)

**Files:**
- Modify: `src/views/login/index.vue` + `src/views/login/components/SocialSignin.vue`, `src/views/login/auth-redirect.vue`, `src/views/redirect/index.vue`, `src/views/error-page/{401,404}.vue`, `src/views/dashboard/{index,admin,editor}.vue`

- [ ] **Step 1: src/views/login/index.vue**

按 Task 9 通用规则改造。关键点：
- `data()` → 顶层 `ref`/`reactive`
- `this.$refs.loginForm.validate(cb)` → `loginFormRef.value?.validate(cb)`
- `@keyup.native` → `@keyup`，`@keyup.enter.native` → `@keyup.enter`
- `@click.native.prevent` → `@click.prevent`
- `el-dialog :visible.sync` → `v-model`
- `el-tooltip v-model="capsTooltip"` 保留（EP 兼容 manual 模式）
- `this.$store.dispatch('user/login')` → `useUserStore().login()`
- `this.$router.push` → `router.push`
- `this.$nextTick` → `nextTick`

参考完整改造（核心 script 部分）：
```ts
<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { validUsername } from '@/utils/validate'
import { useUserStore } from '@/store/modules/user'
import SocialSign from './components/SocialSignin.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const passwordRef = ref<InstanceType<typeof import('element-plus')['ElInput']>>()
const loginForm = reactive({ username: 'admin', password: '111111' })
const passwordType = ref('password')
const capsTooltip = ref(false)
const loading = ref(false)
const showDialog = ref(false)
const redirect = ref<string | undefined>(undefined)
const otherQuery = ref<Record<string, string>>({})

const validateUsername = (_rule: any, value: string, cb: any) => {
  if (!validUsername(value)) cb(new Error('Please enter the correct user name'))
  else cb()
}
const validatePassword = (_rule: any, value: string, cb: any) => {
  if (value.length < 6) cb(new Error('The password can not be less than 6 digits'))
  else cb()
}
const loginRules = {
  username: [{ required: true, trigger: 'blur', validator: validateUsername }],
  password: [{ required: true, trigger: 'blur', validator: validatePassword }]
}

watch(() => route.query, (query: any) => {
  if (query) { redirect.value = query.redirect; otherQuery.value = getOtherQuery(query) }
}, { immediate: true })

function checkCapslock(e: KeyboardEvent) {
  const { key } = e
  capsTooltip.value = !!(key && key.length === 1 && key >= 'A' && key <= 'Z')
}
function showPwd() {
  passwordType.value = passwordType.value === 'password' ? '' : 'password'
  nextTick(() => passwordRef.value?.focus())
}
function handleLogin() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      userStore.login(loginForm)
        .then(() => { router.push({ path: redirect.value || '/', query: otherQuery.value }); loading.value = false })
        .catch(() => { loading.value = false })
    }
  })
}
function getOtherQuery(query: Record<string, string>): Record<string, string> {
  return Object.keys(query).reduce((acc, cur) => {
    if (cur !== 'redirect') acc[cur] = query[cur]
    return acc
  }, {} as Record<string, string>)
}
onMounted(() => {
  if (loginForm.username === '') loginFormRef.value?; // 原 logic: focus username
})
</script>
```

> `onMounted` 原 logic 是 focus 空 input，迁移时用 ref 调 `.focus()`。

- [ ] **Step 2: src/views/redirect/index.vue**

```vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const { params, query } = route
const { path } = params as { path: string }
router.replace({ path: '/' + path, query })
</script>
<template><div></div></template>
```

- [ ] **Step 3: src/views/login/auth-redirect.vue**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => {
  const hash = window.location.search.slice(1)
  if (window.localStorage) {
    window.localStorage.setItem('x-admin-oauth-code', hash)
    window.close()
  }
})
</script>
<template><div></div></template>
```

- [ ] **Step 4: src/views/error-page/{401,404}.vue**

404.vue 改造：`<script>` → `<script setup>`，`computed: { message() }` → `const message = computed(() => '...')`。401 同理。

- [ ] **Step 5: src/views/dashboard/index.vue + admin + editor**

dashboard/index.vue 根据 device 路由到 admin/editor（原 logic）。admin 含 4 个 echarts 图表。

> Phase 1 范围决策：**admin 的 4 个 echarts 图表先占位**（Phase 4 echarts5 迁移时实现），dashboard 显示 PanelGroup + 占位图表区。避免本里程碑引入 echarts 5 复杂度。

dashboard/admin/components/PanelGroup.vue：vue-count-to → vue3-count-to。Phase 1 **先用静态数字占位**，Phase 4 补 count-to 动画。

具体：dashboard/admin/index.vue 改 `<script setup>`，引入 PanelGroup（迁移为 script setup），4 个 chart 组件用占位 `<div class="chart-placeholder">`。

- [ ] **Step 6: 验证完整核心闭环手动**

Run: `npm run dev`
手动测试：
1. 访问 `/` → 重定向 `/login`
2. admin/111111 登录 → 跳 `/dashboard`
3. 侧边栏、面包屑、标签页显示
4. 点 Permission 菜单 → 进入 `/permission/page`
5. 右上角退出 → 回 `/login`
6. 全程浏览器 Console 无 error

Expected: 上述流程通过，Console 无 Vue 警告或 Element Plus 报错。

- [ ] **Step 7: vue-tsc 全量检查**

Run: `npx vue-tsc --noEmit`
Expected: 零错误（仅 Phase 1 范围文件）。

- [ ] **Step 8: Commit**

```bash
git add src/views/login src/views/redirect src/views/error-page src/views/dashboard
git commit -m "feat(views): migrate login/redirect/error/dashboard to script setup + Element Plus"
```

---

## Task 12: Playwright 配置 + fixtures

**Files:**
- Create: `playwright.config.ts`, `e2e/fixtures/auth.ts`, `e2e/fixtures/console.ts`

- [ ] **Step 1: playwright.config.ts**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // 共享 dev server，避免并发
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:9527',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9527',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
```

- [ ] **Step 2: e2e/fixtures/console.ts（控制台错误捕获）**

```ts
import { test as base, expect } from '@playwright/test'

type ConsoleFixture = { errors: string[] }

export const test = base.extend<ConsoleFixture>({
  errors: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
    })
    await use(errors)
    expect(errors, `Console errors detected:\n${errors.join('\n')}`).toEqual([])
  }
})
export { expect }
```

- [ ] **Step 3: e2e/fixtures/auth.ts（登录态 storageState）**

```ts
import { test as setup } from '@playwright/test'
import path from 'path'

const ADMIN_STATE = path.join(__dirname, '../.auth/admin.json')

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('Username').fill('admin')
  await page.getByPlaceholder('Password').fill('111111')
  await page.getByRole('button', { name: 'Login' }).click()
  await page.waitForURL('**/dashboard')
  await page.context().storageState({ path: ADMIN_STATE })
})

export { ADMIN_STATE }
```

> 需要在 playwright.config.ts 增加 `globalSetup`：
```ts
import path from 'path'
export default defineConfig({
  globalSetup: path.resolve(__dirname, 'e2e/fixtures/auth.ts'),
  // ...
})
```

- [ ] **Step 4: 安装 Playwright 浏览器**

Run: `npx playwright install chromium`
Expected: 下载 chromium 成功。

- [ ] **Step 5: .gitignore 加 e2e 产物**

追加 `.gitignore`：
```
e2e/.auth/
e2e/snapshots/
playwright-report/
test-results/
```

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e/ .gitignore
git commit -m "test(e2e): add Playwright config + auth/console fixtures"
```

---

## Task 13: core-loop.spec.ts + 全量验收

**Files:**
- Create: `e2e/core-loop.spec.ts`
- Modify: `e2e/smoke-all-pages.spec.ts`（占位，Phase 2+ 扩充）

- [ ] **Step 1: e2e/core-loop.spec.ts（核心闭环 11 项断言）**

```ts
import { test, expect } from '@playwright/test'
import { ADMIN_STATE } from './fixtures/auth'
import { test as consoleTest } from './fixtures/console'

test.describe('核心闭环', () => {
  test('1. 未登录访问 / 重定向到 /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('2. 登录页元素可见', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Login Form')).toBeVisible()
    await expect(page.getByPlaceholder('Username')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  test('3. 空表单提交显示校验错误', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Username').fill('')
    await page.getByPlaceholder('Username').press('Tab')
    await expect(page.getByText('Please enter the correct user name')).toBeVisible()
  })

  test('4. 错误账号登录失败', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Username').fill('wronguser')
    await page.getByPlaceholder('Password').fill('111111')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('5. admin 登录成功跳转 dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Username').fill('admin')
    await page.getByPlaceholder('Password').fill('111111')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('6. dashboard 关键元素可见', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Username').fill('admin')
    await page.getByPlaceholder('Password').fill('111111')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('.dashboard-editor-container, .dashboard-container')).toBeVisible()
  })

  test('7. 侧边栏显示 admin 权限菜单', async ({ page }) => {
    await page.context().addCookies([{ name: 'Admin-Token', value: 'admin-token', url: 'http://localhost:9527' }])
    // 用 storageState 登录态
  })

  test('8-11. 控制台无错误（贯穿登录+dashboard）', async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE })
    const consolePage = await context.newPage()
    const errors: string[] = []
    consolePage.on('pageerror', (e) => errors.push(e.message))
    consolePage.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await consolePage.goto('/dashboard')
    await consolePage.waitForLoadState('networkidle')
    expect(errors, `Errors:\n${errors.join('\n')}`).toEqual([])
    await context.close()
  })
})
```

> 注：test 7（侧边栏权限菜单）和 editor 角色切换较复杂，可拆为单独 test 用 storageState。上面为骨架，实现时补全侧边栏菜单文本断言。

- [ ] **Step 2: e2e/smoke-all-pages.spec.ts（占位，Phase 1 只覆盖已迁移页面）**

```ts
import { test, expect } from '@playwright/test'
import { ADMIN_STATE } from './fixtures/auth'

const PAGES = [
  { name: 'login', path: '/login', selector: 'text=Login Form' },
  { name: 'dashboard', path: '/dashboard', selector: '.dashboard-editor-container, .dashboard-container' },
  { name: '404', path: '/404', selector: 'text=OOPS' },
  { name: '401', path: '/401', selector: 'body' }
]

for (const p of PAGES) {
  test(`${p.name} renders without console error`, async ({ browser }) => {
    const context = p.name === 'login'
      ? await browser.newContext()
      : await browser.newContext({ storageState: ADMIN_STATE })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(p.path)
    if (p.selector !== 'body') await expect(page.locator(p.selector).first()).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: `e2e/snapshots/${p.name}.png`, fullPage: true })
    expect(errors).toEqual([])
    await context.close()
  })
}
```

- [ ] **Step 3: 运行 e2e**

Run: `npx playwright test`
Expected: 全部 test 通过（core-loop + smoke）。失败则根据报告修复。

- [ ] **Step 4: 最终验收清单**

- [ ] `npm run dev` 启动无错误，端口 9527
- [ ] `npx vue-tsc --noEmit` 零错误
- [ ] `npm run build` 生产构建成功
- [ ] `npx playwright test` 全绿
- [ ] grep 验证无残留 Vue2 写法（Phase 1 范围）：

```bash
grep -rn "\.sync=" src/views/login src/views/redirect src/views/error-page src/views/dashboard src/layout src/components/Breadcrumb src/components/Hamburger 2>/dev/null
grep -rn "\.native" src/views/login src/layout 2>/dev/null
grep -rn "slot-scope" src/layout 2>/dev/null
grep -rn "this\.\\\$store\|this\.\\\$refs\|Vue\.filter\|new Vue" src/views/login src/layout src/store 2>/dev/null
```
Expected: 全部无输出。

- [ ] **Step 5: Commit**

```bash
git add e2e/
git commit -m "test(e2e): add core-loop spec + smoke (Phase 1 pages)"
```

---

## 自检（Self-Review）

**Spec 覆盖**：本计划覆盖 spec 的 Phase 0 + Phase 1。Phase 2-6 在后续计划。
- Phase 0（骨架）：Task 1-2 ✓
- Phase 1（核心闭环）：Task 3-11 ✓
- e2e 验收（spec 6.1）：Task 12-13 ✓

**已知简化/占位（spec 已允许，后续 Phase 补全）**：
- dashboard echarts 图表占位（Phase 4）
- PanelGroup count-to 占位（Phase 4）
- router modules（components/charts/table/nested）暂注释（Phase 2-4）
- permission/role 等页面在 Phase 3 迁移，Phase 1 仅保证路由可达

**类型一致性**：`AppRouteRecord`（Task 6 定义，Task 4/6 使用）、`TagView`（Task 4 定义使用）、Pinia store 名（useXxxStore）跨 Task 一致。

---

## 执行完毕后

本里程碑完成后，应产出：
- 可登录的 Vue3 + TS + Element Plus 骨架
- admin/editor 登录、路由守卫、动态路由、布局、dashboard 渲染
- core-loop e2e 全绿
- vue-tsc / lint / build 通过

**下一步**：编写 Phase 2（表格表单）实施计划。
