# vue-element-admin → Vue 3 + TypeScript + Element Plus 迁移设计

- **日期**：2026-07-08
- **项目**：element-plus-admin（基于 `vue-element-admin` v4.4.0，PanJiaChen）
- **现状**：Vue 2.6 + Element UI 2.13 + Vuex 3 + vue-router 3 + vue-cli 4（webpack 4），JS，195 个源文件（131 `.vue` + 64 `.js`），43 个 view 页面、35 个组件、6 个 Vuex 模块
- **迁移工作量基线**（grep 实测）：`.sync` 14 处、`.native` 9 处、`slot-scope` 69 处、`:visible.sync` 8 处、`el-icon-` 字符串图标引用 78 处、`functional` 组件 1 个、`mixins:` 9 处、`this.$set`/`Vue.set` 1 处
- **目标**：Vue 3 + TypeScript + Element Plus + Pinia + vue-router 4 + Vite，全面 Composition API（`<script setup lang="ts">`），保持全部业务页面与功能等价

---

## 关键决策（已与用户确认）

| 维度 | 决策 |
|------|------|
| 重构策略 | **就地原地重构**（不换仓库，保留 git 历史，原地升级） |
| 构建工具 | **Vite 5**（替换 vue-cli + webpack） |
| 状态管理 | **Pinia**（setup 风格 store，替换 Vuex 3） |
| 代码风格 | **全面 Composition API + TypeScript**（`<script setup lang="ts">`，mixins→composables，filters→纯函数） |
| 第三方库 | **全部升级到 Vue 3 兼容版** |
| 验收标准 | **核心闭环可跑 + vue-tsc/lint/build 通过 + 浏览器 e2e 验收** |
| 执行顺序 | **方案 A · 自底向上**（基础设施 → 核心骨架 → 页面，每阶段可独立验证） |
| Mock 方案 | **保留 express `mock-server.js`，通过 Vite `configureServer` 中间件挂载**（逻辑零迁移） |
| Element Plus 引入 | **按需自动导入**（`unplugin-auto-import` + `unplugin-vue-components` + `ElementPlusResolver`） |
| 剪贴板指令 | **WeakMap 存实例**（TS 友好） |
| Pinia store 风格 | **setup 风格**（`defineStore('user', () => {...})`） |
| 图标方案 | **全局注册 `@element-plus/icons-vue` 全部图标 + `<component :is="iconName" />` 渲染**（改动最小） |
| Markdown 编辑器 | **`md-editor-v3`**（替换 tui-editor，功能完整、可配 Element Plus 主题） |
| 页面验收执行 | **`@playwright/test` 脚本**（不依赖会话内 MCP 注入） |
| 页面验收范围 | **核心闭环深测 + 全页面巡检** |

> 备注：he-fan.cn 的 Element Plus 迁移指南全文等同 Element Plus 官方迁移页（VitePress SPA，正文仅约 500 字），无逐组件对照表，仅推荐 gogo code 迁移工具（已在本项目测试过）。本设计第 3、4 节规则手册比该指南更详尽。

---

## 第 1 节 · 整体架构与目标技术栈

**目标**：在不换仓库的前提下，把 vue-element-admin 从 Vue 2 全家桶迁移到 Vue 3 现代栈，保持全部业务页面和功能等价，核心闭环可跑、`vue-tsc` 与 ESLint 通过、e2e 验收通过。

### 目标技术栈

| 维度 | 现状 | 目标 |
|------|------|------|
| 框架 | Vue 2.6 | **Vue 3.4+**（`createApp`，无 compat） |
| 语言 | JS | **TypeScript 5**（`strict: true`） |
| 构建 | vue-cli 4 + webpack 4 | **Vite 5** + `@vitejs/plugin-vue` + `vue-tsc` |
| 状态 | Vuex 3（6 模块） | **Pinia**（6 个同名 store，setup 风格） |
| 路由 | vue-router 3 | **vue-router 4**（`createRouter`/`addRoute`） |
| UI 库 | element-ui 2.13 | **Element Plus**（按需自动导入 + `unplugin-vue-components`） |
| HTTP | axios 0.18 | **axios 1.x** |
| 组件写法 | Options API + mixins + filters | **`<script setup lang="ts">` + composables** |
| 路径别名 | `@/` (webpack) | `@/` (Vite resolve.alias + tsconfig paths) |
| Lint | eslint 6 + eslint-plugin-vue 6 | **ESLint 8** + `@vue/eslint-config-typescript` + `plugin:vue/vue3-recommended` |

### 架构不变项

目录结构（`src/{api,components,views,store,router,layout,utils,styles,directive,icons,filters}`）、业务功能、Mock 机制、权限模型（`roles` + 动态路由 + `v-permission` 指令）、主题切换、多标签页、语言包（main.js 给 Element UI 传 `enLang`，无 vue-i18n，迁为 Element Plus `locale: zhCn`）。

### 架构变更项

- `mixins/` → `composables/`（`ResizeHandler` → `useResizeHandler`，`Charts/mixins/resize` → `useChartResize`）
- `filters/` → `utils/filters.ts`（导出纯函数，模板里直接调用，Vue 3 移除了 filter 语法）
- `Vue.prototype.$xxx` → app-level provide/composable（`$message`/`$notify` 改用从 `element-plus` 直接 `import { ElMessage }`）
- `directive/` 下 5 个自定义指令重写为 Vue 3 指令 API（`bind`→`beforeMount`、`inserted`→`mounted`、`update`/`componentUpdated`→`updated`、`unbind`→`unmounted`）
- `vue.config.js` → `vite.config.ts`；`svg-sprite-loader` → `vite-plugin-svg-icons`

---

## 第 2 节 · 目录结构与构建/工具链配置

### 目录结构变更（在现有 `src/` 基础上调整，不整体搬迁）

```
element-plus-admin/
├── index.html                 # 从 public/ 移到根目录（Vite 约定）
├── vite.config.ts             # 新，替代 vue.config.js
├── tsconfig.json              # 新
├── tsconfig.node.json         # 新（给 vite.config.ts 用）
├── .eslintrc.cjs              # 重写（ESLint 8 + vue3 + ts 规则）
├── env.d.ts                   # 新（*.vue、import.meta.env、svg 模块类型声明）
├── playwright.config.ts       # 新（e2e 验收）
├── package.json               # 重写依赖与 scripts
├── mock/                      # 保留，通过 Vite 中间件挂载原 express server
├── e2e/                       # 新（Playwright 验收脚本）
│   ├── core-loop.spec.ts
│   ├── smoke-all-pages.spec.ts
│   ├── fixtures/
│   └── snapshots/
├── public/                    # 保留静态资源（favicon 等），index.html 移出
└── src/
    ├── main.ts                # ← main.js（createApp + 插件挂载）
    ├── App.vue                # 保留
    ├── settings.ts            # ← settings.js
    ├── permission.ts          # ← permission.js（ElMessage 替代）
    ├── shims/                 # 新
    ├── api/                   # .js → .ts，加接口类型
    ├── assets/                # 保留
    ├── components/            # .vue 全改 <script setup lang="ts">
    ├── composables/           # 新，替代 layout/mixin 与 Charts/mixins
    │   ├── useResize.ts       # ← layout/mixin/ResizeHandler.js
    │   └── useChartResize.ts  # ← components/Charts/mixins/resize.js
    ├── directive/             # 重写为 Vue3 指令 API，加 index.ts 统一注册
    ├── filters/               # → 合并到 utils/filters.ts（纯函数）后删除该目录
    ├── icons/
    │   ├── index.ts           # 改用 vite-plugin-svg-icons 注册
    │   └── svg/               # 保留 46 个图标
    ├── layout/
    │   ├── index.vue          # <script setup>
    │   ├── components/        # 全部 <script setup>
    │   └── (mixin/ 删除，逻辑移入 composables/)
    ├── router/
    │   ├── index.ts           # createRouter + addRoute
    │   └── modules/*.ts       # .js → .ts
    ├── store/                 # Pinia
    │   ├── index.ts           # createPinia
    │   ├── getters.ts         # 删除（Pinia 直接从 store 读）
    │   └── modules/
    │       ├── app.ts         ← app.js
    │       ├── user.ts        ← user.js
    │       ├── permission.ts  ← permission.js
    │       ├── tagsView.ts    ← tagsView.js
    │       ├── settings.ts    ← settings.js
    │       └── errorLog.ts    ← errorLog.js
    ├── styles/                # 保留 scss；element-variables 改为覆盖 Element Plus CSS 变量
    ├── utils/                 # .js → .ts（含 filters.ts）
    └── views/                 # 全部 <script setup lang="ts"> + Element Plus
```

### 构建工具链（Vite）关键配置

1. **`vite.config.ts`**：
   - `resolve.alias`：`@` → `src`（替代 webpack alias）
   - `server.port` 默认 9527（沿用原值），`server.open: true`
   - `server.middlewareMode` 或 `configureServer` 挂载原 `mock/mock-server.js` 的 express 路由（保留 mock 数据文件，切换宿主）
   - `css.preprocessorOptions.scss`：`additionalData` 注入 `variables.scss`，使 `:export` 互通仍可用；Element Plus 主题改用 **CSS 变量覆盖**（`--el-color-primary` 等）而非 SCSS 变量
   - `build.rollupOptions`：保留分包思路（`element-plus` 单独 chunk、`node_modules` → `vendor`）
   - `unplugin-auto-import/vite` + `unplugin-vue-components/vite`（`ElementPlusResolver`）实现按需自动导入

2. **SVG 图标**：`svg-sprite-loader` → **`vite-plugin-svg-icons`**，`symbolId` 仍为 `icon-[name]`，`icons/index.ts` 改用插件 `loadAll`，`<svg-icon>` 全局组件注册方式不变。

3. **Element Plus 引入**（按需自动导入）：
   - `unplugin-auto-import/vite`（自动 import `ElMessage`/`ElNotification` 等）+ `unplugin-vue-components/vite`（自动注册 `ElXxx` 组件，`ElementPlusResolver`）
   - 主题：在 `main.ts` 引入 Element Plus 基样式，覆盖 `--el-color-primary: #1890ff` 等以匹配原主题
   - 国际化：`app.use(ElementPlus, { locale: zhCn })`（Element Plus 自带语言包，取代 `element-ui/lib/locale/lang/en`）

4. **TS 配置**：`tsconfig.json` 用 `@vue/tsconfig` 基础配置，`strict: true`，`paths: { "@/*": ["src/*"] }`。`env.d.ts` 声明 `*.vue`、`import.meta.env`、svg 模块。新增 `types/router.d.ts` 扩展 `RouteMeta`。

5. **lint/format**：`@vue/eslint-config-typescript` + `eslint-plugin-vue`（`plugin:vue/vue3-recommended`），build 脚本改为 `vue-tsc --noEmit && vite build`。

### 被移除/替换的 webpack 专用件

`svg-sprite-loader`、`script-ext-html-webpack-plugin`、`ScriptExtHtmlWebpackPlugin`（runtime 内联，Vite 不需要）、`configureWebpack`/`chainWebpack` 的 splitChunks（改 rollup manualChunks）、`vue-template-compiler`（Vue 3 用 `@vue/compiler-sfc`，随 `@vitejs/plugin-vue` 自带）。

---

## 第 3 节 · Vue 2 → 3 核心模式迁移规则

这是整个重构的"翻译规则手册"——所有文件按这套规则统一转换，保证一致性。

### 3.1 指令 API 重写（5 个指令，全部用 Vue 3 钩子名）

| Vue 2 | Vue 3 | 涉及文件 |
|-------|-------|---------|
| `bind` | `beforeMount` | clipboard、waves、sticky、el-drag-dialog |
| `inserted` | `mounted` | permission、el-table/adaptive |
| `componentUpdated` | `updated` | — |
| `unbind` | `unmounted` | 全部 |

- **私有属性访问**：`el._v_clipboard` 这类直接挂 DOM 的写法统一改为 **WeakMap** 存实例（TS 友好）。`el[context]`（waves 用的 `@@wavesContext` 字符串 key）同理迁到 WeakMap。
- `permission` 指令的 `checkPermission` 里 `store.getters.roles` → `useUserStore().roles`（Pinia 直接读）。
- 新增 `directive/index.ts` 统一 `app.directive('permission', …)` 注册全部 5 个。

### 3.2 mixins → composables

| 原 mixin | 用途 | 新 composable |
|---------|------|--------------|
| `layout/mixin/ResizeHandler.js` | 监听窗口宽度切换 mobile/desktop、关 sidebar | `composables/useResizeHandler.ts`（`onMounted`/`onBeforeUnmount` 生命周期替代 `beforeMount`/`beforeDestroy`） |
| `components/Charts/mixins/resize.js` | echarts 监听 `__resize` 事件 | `composables/useChartResize.ts` |

调用方式：`mixins: [ResizeMixin]` → 在 `<script setup>` 里 `useResizeHandler()`。

### 3.3 filters → 纯函数

- Vue 3 移除 `Vue.filter` 和 `|` 管道语法。
- `filters/index.js` 内容（`timeAgo`/`numberFormatter`/`toThousandFilter`/`uppercaseFirst` + 转发的 `parseTime`/`formatTime`）合并进 **`utils/filters.ts`**，全部加类型签名。
- 模板里的 `{{ row.timestamp | parseTime }}` → `{{ parseTime(row.timestamp) }}`（`<script setup>` 里 `import { parseTime } from '@/utils'`）。
- `main.js` 里 `Object.keys(filters).forEach(Vue.filter)` 整段**删除**。

### 3.4 `this.$` API 迁移

| 现状 | Vue 3 写法 |
|------|-----------|
| `this.$store.dispatch/get/state` | Pinia：`const store = useXxxStore()` 后直接 `store.action()` / `store.state` |
| `this.$route` / `this.$router` | `import { useRoute, useRouter } from 'vue-router'` |
| `this.$refs.xxx` | `const xxxRef = ref<InstanceType<typeof ElForm>>()`（template ref） |
| `this.$emit('event')` | `defineEmits<{(e:'event'):void}>()` |
| `this.$nextTick` | `import { nextTick } from 'vue'` |
| `this.$message` / `this.$notify` / `this.$confirm` | `import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'`（按需自动导入后免 import） |
| `this.$el` | `getCurrentInstance()?.proxy?.$el` 或用 template ref |
| `this.$set` / `Vue.set` | **删除**——Vue 3 响应式自动追踪（1 处） |
| `this.$parent` | 改 props/emit 或 `getCurrentInstance()?.parent`（5 处，尽量重构为 props） |

### 3.5 Vuex → Pinia（6 个 store 模块）

- `store/index.js`（`new Vuex.Store`）→ `createPinia()`；`store/getters.js` **删除**（Pinia 各 store 直接暴露 state，跨 store 用 `useXxxStore()`）。
- 每个模块改为 **setup 风格 store**：

```ts
// store/modules/user.ts  示例
export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() ?? '')
  const name = ref('')
  const roles = ref<string[]>([])

  async function login(userInfo: { username: string; password: string }) {
    const { data } = await loginApi({ username: userInfo.username.trim(), password: userInfo.password })
    token.value = data.token
    setToken(data.token)
  }
  async function getInfo() { /* commit 改为直接赋值 */ }
  function resetToken() { token.value = ''; roles.value = [] }

  return { token, name, roles, login, getInfo, resetToken }
})
```

- 原 getters 里的派生值（如 `permission_routes`）→ store 内 `computed` 或在使用处 `computed(() => usePermissionStore().routes)`。
- 跨 store 调用（user.logout 里 `dispatch('tagsView/delAllViews')`）→ 在 action 内 `useTagsViewStore().delAllViews()`。
- 原 `changeRoles` 里 `router.addRoutes` → vue-router 4 没有 `addRoutes`，改为遍历 `router.addRoute(route)`。

### 3.6 路由 vue-router 3 → 4

- `new Router({...})` → `createRouter({ history: createWebHistory(), routes })`。
- `resetRouter()` 里 `router.matcher = newRouter.matcher` → vue-router 4 用 `router.removeRoute(name)` 遍历移除动态路由。
- `router.addRoutes(routes)` → 循环 `router.addRoute(route)`。
- `scrollBehavior: () => ({ y: 0 })` → `{ top: 0 }`（`y` 改 `top`）。
- 路由 `meta` 类型：新增 `types/router.d.ts` 扩展 `RouteMeta`（`title?`/`icon?`/`roles?`/`noCache?`/`affix?`/`breadcrumb?`/`activeMenu?`）。
- `{ path: '*', redirect: '/404' }` → vue-router 4 用 `:pathMatch(.*)*`。

### 3.7 组件写法统一

- 全部 `.vue` → `<script setup lang="ts">`。
- Options API 的 `data()` → 顶层 `ref`/`reactive`；`computed: {}` → `computed(() => …)`；`methods: {}` → 普通函数；`watch: {}` → `watch()` / `watchEffect()`；生命周期 `created/mounted/destroyed` → `onMounted` 等（无 `created`，setup 本身即替代）。
- `props: { ... }` → `defineProps<{…}>()`（`withDefaults` 设默认值）；`this.xxx` 引用 props → 直接用变量名。

---

## 第 4 节 · Element UI → Element Plus 迁移规则

### 4.1 全局 API 与引入方式

| 现状 | Element Plus |
|------|-------------|
| `import Element from 'element-ui'; Vue.use(Element, {size, locale})` | `app.use(ElementPlus, { locale: zhCn, size })` |
| `import { Message } from 'element-ui'` | `import { ElMessage } from 'element-plus'`（按需自动导入后免 import） |
| `this.$message / $notify / $confirm / $alert / $prompt / $loading` | `ElMessage / ElNotification / ElMessageBox / ElLoadingService`（推荐直接 import，非全局挂载） |
| `this.$ELEMENT.size`（`SizeSelect` 组件 1 处） | 改用 store/CSS 变量驱动 size |

### 4.2 模板语法差异（高频，必改）

| Element UI / Vue 2 写法 | Element Plus / Vue 3 写法 |
|------------------------|--------------------------|
| `:visible.sync="x"`（8 处 el-dialog 等，`.sync` 总共 14 处含 pagination） | `v-model="x"`（Element Plus 统一为 `modelValue`） |
| `@click.native.prevent`（login 等） | `.native` **移除**——Vue 3 组件根元素自动继承事件，直接 `@click.prevent` |
| `@keyup.enter.native`、`@keyup.native` | 去掉 `.native` |
| `<span slot="title">` | `<template #title>`（v-slot 语法） |
| `<el-button icon="el-icon-edit">`（字符串图标名） | 图标改为**组件**：`<el-button :icon="Edit">`；**采用全局注册方案**（见下） |
| `<i class="el-icon-edit" />` | `<el-icon><Edit /></el-icon>` |

**图标方案（已定）**：一次性 `for (const [key, comp] of Object.entries(ElementPlusIconsVue)) app.component(key, comp)` 全局注册所有图标，模板里用 `<component :is="iconName" />` 或 `<el-icon :size="16"><component :is="icon"/></el-icon>`，改动量最小，保留原"传图标名字符串"的用法。

### 4.3 常用组件行为差异

| 组件 | 差异点与改法 |
|------|------------|
| `el-form` 校验 | 保留 callback 写法（迁移成本最低），仅 `this.$refs.loginForm.validate(cb)` → `loginFormRef.value?.validate(cb)`；推荐处可用 `await formRef.value?.validate()` |
| `el-table` | API 基本兼容；`slot-scope="scope"` → `#default="scope"`；自定义列模板全改 `<template #default>` |
| `el-dialog` | `:visible.sync` → `v-model`；`:before-close`/`@close` 一致 |
| `el-pagination` | `:current-page.sync` → `v-model:current-page`；`:page-size.sync` → `v-model:page-size` |
| `el-tag` | `:type` 基本兼容（注意 `info`）；`closable`/`@close` 一致 |
| `el-select` / `el-option` | 兼容。`v-model` 一致 |
| `el-upload` | `action`/`on-success`/`before-upload` 兼容；`slot="trigger"` → `#trigger` |
| `el-tooltip` | `v-model` 控制 `value` 一致 |
| `el-dropdown` | `command` + `@command` 一致；`slot="dropdown"` → `#dropdown` |
| `el-message-box` | `this.$confirm(...)` → `ElMessageBox.confirm(...)`，API 一致 |
| `el-date-picker` / `el-color-picker` | 兼容 |

### 4.4 主题切换组件（ThemePicker）重写

原实现运行时 fetch `element-ui` 的 chalk CSS、正则替换 `#409EFF` 及衍生色、注入 `<style>` ——因为 Element UI 主题是编译期 SCSS 变量。Element Plus **改用 CSS 变量**，主题切换从"重编译 CSS"变成"改一个变量"。ThemePicker 重写为：

```ts
watch(theme, (val) => {
  const el = document.documentElement
  el.style.setProperty('--el-color-primary', val)
  // 遍历生成 --el-color-primary-light-3/5/7/8/9 与 --el-color-primary-dark-2
})
```

整段 `getThemeCluster`/`updateStyle`/`getCSSString`/XHR fetch 逻辑**全部删除**，`require('element-ui/package.json').version` 也删除。ThemePicker 从 ~150 行降到 ~30 行。

### 4.5 第三方库升级清单（全部升级到 Vue 3 兼容版）

| 现库 | 替换为 | 影响范围 |
|------|--------|---------|
| `element-ui` 2.13 | **移除** | 全局 |
| `vue` 2.6 | `vue` 3.4 | 全局 |
| `vuex` 3 | `pinia`（移除 vuex） | store |
| `vue-router` 3 | `vue-router` 4 | router |
| `axios` 0.18 | `axios` 1.x | utils/request |
| `echarts` 4 | `echarts` 5 | views/charts、dashboard |
| `tui-editor` 1.3 | **`md-editor-v3`** | components/MarkdownEditor、views/components-demo/markdown |
| `codemirror` 5 | **`codemirror` 6 + `vue-codemirror` 6** | components/JsonEditor、views/components-demo/json-editor |
| `dropzone` 5 + 自封装组件 | **直接用 Element Plus `el-upload` + drag**（Dropzone 组件废弃，功能合并进 Upload） | components/Dropzone、views/components-demo/dropzone |
| `vue-count-to` | **`vue3-count-to`** | dashboard/admin/PanelGroup、views/components-demo/count-to |
| `vuedraggable` 2 | `vuedraggable@4`（`sortablejs` 保留） | components/DndList、views/example/components、views/components-demo/drag |
| `vue-splitpane` 1 | `splitpanes` | views/components-demo/splitpane |
| `driver.js` 0.9 | `driver.js@1`（官方已支持无框架） | views/guide |
| `fuse.js` 3 | `fuse.js` 6（无破坏性升级） | components/HeaderSearch |
| `js-cookie` 2 | `js-cookie` 3 | utils/auth |
| `clipboard` 2 | 保留（纯 JS） | directive/clipboard |
| `xlsx` 0.14 | `xlsx`（SheetJS 最新） | views/excel |
| `file-saver` 2 / `jszip` 3 | 保留 | views/excel、zip |
| `screenfull` 4 | `screenfull` 6 | components/Screenfull |
| `nprogress` 0.2 / `sortablejs` 1.8 | 保留 | permission / directive、DndList |
| `path-to-regexp` 2 | `path-to-regexp` 6（**破坏性 API**，需改 import） | components/Breadcrumb、utils |
| `script-loader` 0.7 | **移除**（Vite 下用动态 import / `import.meta.glob`） | views/excel/export-excel |
| `@vue/cli-*` 全家桶 | **全部移除**，换 `vite` + `@vitejs/plugin-vue` + `vue-tsc` + `@vue/eslint-config-typescript` | 构建/测试 |
| `vue-template-compiler` | **移除**（Vue3 用 `@vue/compiler-sfc`） | — |
| `eslint-plugin-vue` 6 | `eslint-plugin-vue` 9 | lint |
| `@vue/test-utils` beta + jest | `@vue/test-utils` 2 + **vitest** | tests |

### 4.6 `functional` 组件迁移

`Sidebar/Item.vue` 用了 `functional: true` + `render(h, context)`。Vue 3 移除了 functional 组件概念，改为普通 `<script setup>` 组件 + 多根节点（fragment），`context.props` → 直接用 props。原 JSX `<i class={...}>` 改回模板。

### 4.7 其他全局改造点

- **`slot-scope` → `#default`**：全项目搜索（实测 69 处，是迁移量大头），统一改为 `#default="scope"` 或对应具名插槽。
- **`.sync` 修饰符**：全项目搜索 `.sync`，改 `v-model:xxx`。
- **`@xxx.native`**：移除 `.native`。

---

## 第 5 节 · 分阶段执行计划（方案 A · 自底向上）

每个阶段结束**项目都能 `npm run dev` 启动并通过验证**，可独立提交、可回溯。共 7 个阶段。

### 阶段 0 · 搭建骨架（基础设施先行）
🎯 产出：空内容页面能跑

- 重写 `package.json`（依赖大换血，见 4.5 清单）
- 新建 `vite.config.ts`、`tsconfig.json`、`tsconfig.node.json`、`env.d.ts`、重写 `.eslintrc.cjs`
- `index.html` 从 `public/` 移到根目录，调整模板变量为 Vite 写法
- `main.js` → `main.ts`：`createApp(App).use(pinia).use(router).use(ElementPlus,{locale,size})`；全局注册所有 `@element-plus/icons-vue` 图标；注册 `<svg-icon>`
- `icons/index.ts`：`vite-plugin-svg-icons` 替代 `require.context`
- `store/index.ts`：`createPinia()`
- `router/index.ts`：`createRouter`，只保留 `constantRoutes`，`asyncRoutes` 暂时占位
- Mock：`mock/mock-server.js` 通过 Vite `configureServer` 中间件挂载
- 删除：`vue.config.js`、`babel.config.js`、`postcss.config.js`、`jest.config.js`

**验证**：`npm run dev` 启动，访问 `/` 渲染最小布局；`vue-tsc --noEmit` 通过。

### 阶段 1 · 核心闭环（登录 + 布局 + 权限 + 仪表盘）
🎯 产出：可登录的完整骨架（验收标准的核心闭环）

按依赖顺序：

1. **utils 基础设施**（`request.ts`/`auth.ts`/`get-page-title.ts`/`validate.ts`/`filters.ts`/`index.ts`）——JS→TS，加类型
2. **api 层**（`user.ts`/`role.ts`/`article.ts`/`remote-search.ts`/`qiniu.ts`）——加请求/响应类型
3. **store 全部 6 模块**（setup 风格，按 3.5 节）
4. **router**：`asyncRoutes` 恢复，`addRoutes`→循环 `addRoute`，`resetRouter` 重写，`path: '*'`→`:pathMatch(.*)*`；4 个 modules `.js→.ts`
5. **composables**：`useResizeHandler.ts`
6. **directive**：5 个指令 + 新建 `directive/index.ts` 统一注册
7. **permission.ts**：路由守卫，`Message`→`ElMessage`
8. **layout 全部 11 组件**：`index.vue`、`Navbar`、`AppMain`、`Sidebar/*`(5)、`Settings`、`TagsView/*`(2)、`RightPanel`；全部 `<script setup lang="ts">`；`Item.vue` functional 去掉（按 4.6）；`.sync`→`v-model`、`.native` 去掉
9. **关键公共组件**（布局依赖）：`Breadcrumb`、`Hamburger`、`SvgIcon`、`Screenfull`、`SizeSelect`、`HeaderSearch`、`ErrorLog`、`GithubCorner`
10. **views**：`login/index.vue`(+ SocialSign)、`redirect/index.vue`、`error-page/{401,404}.vue`、`dashboard/{index,admin,editor}`（admin 含 4 个 echarts 图表，echarts5 迁移）

**验证**：admin/editor 账号能登录、路由守卫生效、动态路由加载、侧边栏/面包屑/标签页/全屏/主题面板正常、dashboard 渲染（echarts5）、登出正常。**执行 `e2e/core-loop.spec.ts` 核心闭环深测。**

### 阶段 2 · 表格与表单类页面
🎯 产出：el-table/form 重灾区完成

- `views/table/*`（6：complex、inline、custom、dynamic/{default,sort,drag}）
- `directive/el-table/adaptive` 验证
- `views/example/*`（8：list、create、edit、components/{ArticleDetail,Dropdown}）——含 el-form 校验、el-table、Tinymce

**验证**：表格分页、排序、拖拽、内联编辑、表单校验、文章列表 CRUD 正常；执行当阶段 smoke 子集。

### 阶段 3 · 权限、个人资料、错误日志、主题、剪贴板、Tab

- `views/permission/*`（4：page、directive、role）
- `views/profile/*`（5）
- `views/error-log/*`（3）
- `views/theme/index.vue`：ThemePicker **重写**（按 4.4，CSS 变量方案）
- `views/clipboard/index.vue`、`views/tab/index.vue`、`views/icons/index.vue`

**验证**：权限指令、角色切换、个人资料卡、错误日志面板、主题色实时切换、剪贴板、Tab 缓存、图标总览页正常；smoke 子集。

### 阶段 4 · 第三方库重度页面（components-demo + 编辑器 + 图表 + Excel/Zip/PDF）
🎯 产出：所有第三方库升级落地

按库分组：
- `components/MarkdownEditor` + demo：tui-editor → **md-editor-v3**
- `components/JsonEditor` + demo：codemirror5 → **codemirror6 + vue-codemirror**
- `components/Tinymce`（2）：保留 Tinymce 原生（不依赖 Vue），仅改组件封装
- `components/Dropzone` + demo：**废弃，合并进 el-upload drag**
- `views/components-demo/count-to` + PanelGroup：vue-count-to → **vue3-count-to**
- `components/Charts/*`(3) + `views/charts/*`(3)：echarts4 → echarts5
- `components/DndList` + `components/Kanban`：vuedraggable@2 → @4
- `views/components-demo/*` 其余 14 个：逐个 `<script setup>` + Element Plus
- `views/excel/*`(7) + `vendor/Export2Excel`：xlsx 升级；`script-loader` 移除，改动态 import
- `views/zip/index.vue` + `vendor/Export2Zip`：jszip 保留
- `views/pdf/*`(2)：验证 pdf 生成
- `views/guide/index.vue`：driver.js 0.9 → 1
- `views/components-demo/splitpane.vue`：vue-splitpane → splitpanes

**验证**：14 个 components-demo 页可访问、编辑器可用、图表渲染、Excel 导入导出、Zip 下载、PDF 预览、拖拽看板、新手引导正常；smoke 子集。

### 阶段 5 · 剩余页面与全局收尾

- `views/documentation`、`views/nested/*`(7)、`views/qiniu`
- 剩余 `components/*` 未覆盖的全部扫一遍（33 个）
- `filters/` 目录删除（已合并进 utils）
- `layout/mixin/` 目录删除（已进 composables）
- `settings.js→.ts`、`store/getters.js` 删除
- 全局搜索扫尾：残留的 `.native`、`.sync`、`slot-scope`、`el-icon-` 字符串图标、`this.$`、`Vue.` 调用清零

**验证**：嵌套路由、文档页、外链、所有 40+ 页面可访问无控制台报错；smoke 子集。

### 阶段 6 · 质量保障与文档

- 测试：`jest` → **vitest**，`@vue/test-utils` beta → v2，迁移现有 unit 测试
- `npm run lint` 全量通过；`npm run build` 生产构建通过；`vue-tsc --noEmit` 零错误
- 更新 `README`、`jsconfig.json`→tsconfig、`.env.*` 兼容 Vite（`VUE_APP_`→`VITE_`）
- 删除废弃配置

**验证**：最终全量验收。

---

## 第 6 节 · 页面验收方案 + 风险 + 验收清单

### 6.1 浏览器页面验收方案（`@playwright/test` 脚本）

**工具**：项目内引入 `@playwright/test` 作为 devDependency，e2e 脚本作为正式验收手段。**不依赖会话内 MCP 注入**，由脚本编排、执行 `npx playwright test` 看结果。

**目录结构**

```
e2e/
├── playwright.config.ts          # baseURL=http://localhost:9527, webServer 自动起 dev
├── fixtures/
│   ├── auth.ts                   # 登录态 fixture：复用 storageState 免每次登录
│   └── console.ts                # 捕获 console.error / pageerror 的 fixture
├── core-loop.spec.ts             # 核心闭环深测（阶段1后执行）
├── smoke-all-pages.spec.ts       # 全页面巡检（每阶段+最终执行）
└── snapshots/                    # 截图归档（每页一张，供人工 diff）
```

**playwright.config.ts 关键配置**
- `webServer`: `command: 'npm run dev'`, `port: 9527`, `reuseExistingServer: true` —— 跑测试自动起 dev 服务
- `baseURL`: `http://localhost:9527`
- `projects`: 一个 chromium（兼顾速度）
- `use.screenshot: 'only-on-failure'`，并增加每页成功截图存档

**核心闭环深测 `core-loop.spec.ts`（阶段 1 后执行，交互级断言）**

覆盖：
1. 未登录访问 `/` → 重定向到 `/login`
2. 登录页渲染：标题、用户名/密码输入框、登录按钮可见
3. 表单校验：空提交 → Element Plus 校验错误提示出现
4. 错误账号 → 登录失败提示
5. admin 账号登录成功 → 跳转 `/dashboard`
6. dashboard 关键元素可见（PanelGroup、4 个 echarts 图表容器 `canvas` 存在）
7. 动态路由：侧边栏出现 admin 才有的菜单（如 Permission）
8. 权限指令：切到 editor 账号，验证无权限元素被移除
9. 标签页：点击菜单新增 tag、关闭 tag
10. 登出 → 回 `/login`
11. 全程 **`pageerror` 与 `console.error` 计数为 0**（硬断言）

**全页面巡检 `smoke-all-pages.spec.ts`（每阶段完成后 + 最终执行）**

数据驱动，遍历一张路由→期望表。每页统一断言三件套：

```ts
for (const p of PAGES) {
  test(`${p.path} renders without error`, async ({ page, noConsoleError }) => {
    await page.goto(p.path)            // 复用 auth storageState
    await expect(page).toHaveURL(p.path)
    await expect(page.locator(p.mainSelector)).toBeVisible()
    await page.screenshot({ path: `snapshots/${p.name}.png`, fullPage: true })
    // noConsoleError fixture 自动断言 console.error/pageerror=0
  })
}
```

`PAGES` 覆盖表按阶段增量填充：阶段1 先覆盖 constantRoutes；阶段2-5 逐步补全；最终覆盖全部 40+ 路由。

**关键设计点**
- **登录态复用**：`globalSetup` 用 admin 账号登录一次，存 `storageState`，各 spec 复用。
- **控制台错误捕获**：自定义 fixture 监听 `page.on('pageerror')` 和 `page.on('console')` 的 error，用例结束断言为空——这是"迁移没漏掉 Vue 警告/Element Plus 报错"的硬指标。
- **Mock 依赖**：dev server 走 Vite 中间件挂载的 mock，e2e 无需额外 stub 网络。
- **echarts 断言**：只断言 `canvas` 元素存在且尺寸非 0，不验证图表数据精确（避免异步渲染 flaky）。

**脚本执行**
- 阶段验收：执行 `npx playwright test e2e/core-loop.spec.ts` 或当阶段 smoke 子集
- 最终验收：`npx playwright test`（全量）+ 截图归档
- 产物：`playwright-report/`（HTML 报告）、`e2e/snapshots/*.png`、失败录像

**纳入 package.json scripts**：
- `"test:e2e": "playwright test"`
- `"test:e2e:ui": "playwright test --ui"`
- `"report:e2e": "playwright show-report"`

### 6.1.1 frontend-acceptance 子智能体交互式验收（强制）

**`@playwright/test` 脚本是自动化基线，但不充分**——脚本只能验证预写断言（元素可见、控制台无错），无法覆盖开放式的页面交互（点击按钮、填表提交、切换状态、观察视觉渲染、发现脚本未覆盖路径的回归）。因此**每个阶段验收必须在脚本全绿之后，额外派遣 `frontend-acceptance` 子智能体做交互式验收**。

**工具**：`frontend-acceptance` 子智能体（自带 Playwright MCP 浏览器工具：`browser_navigate`、`browser_click`、`browser_snapshot`、`browser_fill_form`、`browser_take_screenshot` 等）。

**执行方式**：由控制器（主会话）派遣 `frontend-acceptance` 子智能体，提供：
- dev server 地址（`http://localhost:9527`）
- 当阶段已迁移的页面清单 + 预期交互行为（登录账号、表格分页、表单校验、拖拽等）
- 要求：实际访问每个页面、执行关键交互、截图取证、输出结构化验收报告

**frontend-acceptance 验收 vs 脚本验收的分工**

| 维度 | `@playwright/test` 脚本 | `frontend-acceptance` 子智能体 |
|------|------------------------|-------------------------------|
| 触发时机 | 每个 Task / 阶段结束自动跑 | 每个阶段脚本全绿后，由控制器派遣 |
| 验证范围 | 预写断言（元素可见、URL、控制台无错） | 开放式交互（点击、填表、切换、拖拽、视觉观察） |
| 产出 | pass/fail + 截图归档 | **结构化验收报告**（含截图、发现的问题、通过/不通过判定） |
| 能发现的 bug | 仅脚本覆盖的路径 | 脚本未覆盖的交互回归、视觉回退、组件行为差异 |

**验收报告要求**：`frontend-acceptance` 子智能体输出结构化报告，包含：
1. 验收范围（页面清单 + 交互项）
2. 每页验收结果（✅ 通过 / ❌ 失败 + 问题描述 + 截图）
3. 控制台错误记录
4. 整体验收结论（通过 / 需修复）

**控制器职责**：收到 `frontend-acceptance` 报告后，若有 ❌ 项，派遣 implementer 修复，修复后重新验收，直到全绿。

### 6.2 风险登记与缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| Element Plus 组件行为细节差异（el-table selection、el-cascader、表单校验触发时机） | 单点页面功能失效 | 每阶段 smoke e2e + 控制台错误硬断言，及早暴露 |
| echarts 4→5 配置项不兼容 | dashboard/charts 图表渲染异常或空白 | 阶段1 优先验证 dashboard 4 图表；e2e 断言 canvas 非空兜底 |
| 图标迁移遗漏 | 侧边栏/按钮图标消失 | 全局注册后建"原 el-icon- 名 → EP 图标名"映射；e2e 截图人工抽查侧边栏 |
| ThemePicker 重写后主题色衍生不够 | 主题切换后部分组件配色突兀 | 阶段3 单独验证；必要时手动补 `--el-color-primary-light-N` 全套 |
| Mock 在 Vite 中间件下行为漂移 | 登录/列表接口 404 或数据格式变 | 阶段0 验证 mock 登录链路；保留 mock 文件不改逻辑 |
| `path-to-regexp` 6 破坏性 API（Breadcrumb 依赖） | 面包屑路径匹配报错 | 阶段1 含 Breadcrumb，e2e 覆盖；改 import 方式 |
| Tinymce 动态脚本加载在 Vite 下失效 | 富文本不出现 | 评估保留原生可行性；不行则阶段4 换方案 |
| 依赖升级版本冲突 | 安装失败 | 阶段0 锁定一套验证过的版本组合 |
| e2e flaky（echarts 异步、路由守卫异步） | 误报 | 用 `toHaveURL`/`toBeVisible` 自动等待，禁用固定 sleep；失败重试 1 次 |
| 工作量超大（195 文件） | 周期长、中途难以验证 | 阶段化、每阶段可独立验证+提交，控制单次改动面 |

### 6.3 最终验收清单（Definition of Done）

全部满足才算重构完成：

**编译/质量门禁**
- [ ] `npm run dev` 启动无错误，端口 9527
- [ ] `vue-tsc --noEmit` 零错误（strict 模式）
- [ ] `npm run lint` 零 error（vue3-recommended + ts 规则）
- [ ] `npm run build` 生产构建成功
- [ ] `npm run test:unit`（vitest）通过
- [ ] 无残留 Vue2 写法：`.native`、`.sync`、`slot-scope`、`Vue.filter`、`this.$set`、`new Vue`、`functional:` 全为 0（grep 验证）

**浏览器验收（e2e 脚本）**
- [ ] `npx playwright test e2e/core-loop.spec.ts` 全绿（核心闭环 11 项交互断言）
- [ ] `npx playwright test e2e/smoke-all-pages.spec.ts` 全绿（40+ 页面：访问成功 + 关键元素可见 + **控制台错误/pageerror = 0**）
- [ ] `e2e/snapshots/` 每页一张截图，人工抽查侧边栏/表格/表单无视觉明显回退

**浏览器验收（frontend-acceptance 子智能体交互式验收）**
- [ ] 每个阶段脚本全绿后，派遣 `frontend-acceptance` 子智能体做交互式验收（实际点击、填表、切换、拖拽、截图取证）
- [ ] `frontend-acceptance` 输出结构化验收报告，所有页面 ✅ 通过（无 ❌ 未修复项）
- [ ] 阶段间不累积验收债——本阶段 `frontend-acceptance` 发现的问题在本阶段修复完毕

**功能验收（人工抽查，e2e 之外的补充）**
- [ ] admin/editor 双角色登录、权限切换、动态路由
- [ ] 主题色实时切换（ThemePicker）
- [ ] Markdown/JSON/Tinymce 编辑器可用
- [ ] Excel 导入导出、Zip 下载、PDF 预览
- [ ] 图表渲染（echarts5）
- [ ] 拖拽看板、新手引导（driver.js）

**产出**
- [ ] README 更新（技术栈、启动/测试命令）
- [ ] 废弃配置文件已删除（vue.config.js、babel.config.js、vue-template-compiler 等）
- [ ] spec 文档归档 `docs/superpowers/specs/`
