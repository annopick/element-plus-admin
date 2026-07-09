# Phase 3: 权限、个人资料、错误日志、主题、剪贴板、Tab 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 迁移权限、profile、error-log、theme、clipboard、tab、icons 页面到 Vue3 + Element Plus，恢复对应路由，通过 e2e + frontend-acceptance 验收。

**Architecture:** 自底向上。先迁移依赖（utils/permission、user store changeRoles、ThemePicker 重写、errorHandler），再迁移页面。

**Tech Stack:** Vue 3.4 `<script setup lang="ts">`、Element Plus、Pinia

**Spec:** `docs/superpowers/specs/2026-07-08-vue3-elementplus-migration-design.md`（Phase 3）

**Scope:** permission（4 文件）+ profile（5 文件）+ error-log（3 文件）+ theme（1）+ clipboard（1）+ tab（2）+ icons（1）+ ThemePicker 重写 + utils/permission + user.changeRoles + errorHandler + 路由恢复。

---

## Task 1: 基础设施 — utils/permission 迁移 + user.changeRoles 实现 + errorHandler

**Files:**
- Modify: `src/utils/permission.js` → `.ts`
- Modify: `src/store/modules/user.ts`（实现 changeRoles）
- Modify: `src/main.ts`（添加 errorHandler）+ `src/utils/error-log.js` → `.ts`

- [ ] **Step 1: src/utils/permission.js → .ts**

当前使用 Vuex `store.getters.roles`。改为 Pinia：
```ts
import { useUserStore } from '@/store/modules/user'

export default function checkPermission(value: string[]): boolean {
  if (value && value instanceof Array && value.length > 0) {
    const roles = useUserStore().roles
    const permissionRoles = value
    const hasPermission = roles.some(role => permissionRoles.includes(role))
    return hasPermission
  } else {
    console.error(`need roles! Like v-permission="['admin','editor']`)
    return false
  }
}
```

- [ ] **Step 2: 实现 user.ts 的 changeRoles**

在 `src/store/modules/user.ts` 添加 changeRoles 函数（原 TODO）。READ 当前 user.ts。参考原 Vuex changeRoles 逻辑：
```ts
import { usePermissionStore } from './permission'
import router, { asyncRoutes } from '@/router'

async function changeRoles(role: string) {
  const token = role + '-token'
  token.value = token
  setToken(token)
  // 重新获取角色信息
  await getInfo()
  // 重置路由
  resetRouter()
  // 生成新路由
  const accessRoutes = await usePermissionStore().generateRoutes(roles.value)
  accessRoutes.forEach((route) => router.addRoute(route as any))
  // 重置 tagsView
  useTagsViewStore().delAllViews()
}
```
注意：roles 在 getInfo() 后更新，changeRoles 需要在 getInfo 后读取最新 roles。删掉原 TODO 注释，把 changeRoles 加入 return。

- [ ] **Step 3: errorHandler 设置**

`src/utils/error-log.js` → `.ts`。原文件用 `Vue.config.errorHandler`。改为 Vue3 的 `app.config.errorHandler`。READ 原文件。

创建一个 `setupErrorHandler(app)` 函数：
```ts
import type { App } from 'vue'
import { useErrorLogStore } from '@/store/modules/errorLog'

export function setupErrorLog(app: App) {
  app.config.errorHandler = (err, vm, info) => {
    const errorLogStore = useErrorLogStore()
    errorLogStore.addErrorLog({
      err: err as Error,
      vm: vm as any,
      info,
      url: window.location.href
    })
    console.error(err, info)
  }
}
```
在 `src/main.ts` 调用 `setupErrorLog(app)`（在 app.use(store) 之后、mount 之前）。

- [ ] **Step 4: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/utils/permission.ts src/utils/error-log.ts src/store/modules/user.ts src/main.ts
git rm src/utils/permission.js src/utils/error-log.js
git commit -m "feat: migrate utils/permission + error-log to TS, implement changeRoles + errorHandler"
```

---

## Task 2: ThemePicker 重写（Element Plus CSS 变量方案）

**Files:**
- Modify: `src/components/ThemePicker/index.vue`（完全重写，Options API → script setup）

- [ ] **Step 1: 重写 ThemePicker**

按 spec 4.4：Element Plus 用 CSS 变量，主题切换从"重编译 chalk CSS"变成"改一个变量"。删除全部 `getThemeCluster`/`updateStyle`/`getCSSString`/XHR/require(element-ui) 逻辑。

重写为：
```vue
<template>
  <el-color-picker
    v-model="theme"
    :predefine="['#409EFF', '#1890ff', '#304156', '#212121', '#11a983', '#13c2c2', '#6959CD', '#f5222d']"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'

const settingsStore = useSettingsStore()
const theme = ref(settingsStore.theme)

watch(theme, (val) => {
  if (!val) return
  settingsStore.changeSetting({ key: 'theme', value: val })
  // Element Plus 用 CSS 变量控制主题色，只需覆盖 --el-color-primary
  const el = document.documentElement
  el.style.setProperty('--el-color-primary', val)
  // 生成衍生色（light-3/5/7/8/9 用于 hover/disabled 等状态）
  generateDerivedColors(val).forEach(([name, color]) => {
    el.style.setProperty(name, color)
  })
})

// Element Plus 默认主色 #409EFF，衍生色按此比例生成
function generateDerivedColors(primary: string): [string, string][] {
  const mix = (color: string, weight: number) => { /* 混白 */ }
  const darken = (color: string, weight: number) => { /* 混黑 */ }
  return [
    ['--el-color-primary-light-3', mix(primary, 0.3)],
    ['--el-color-primary-light-5', mix(primary, 0.5)],
    ['--el-color-primary-light-7', mix(primary, 0.7)],
    ['--el-color-primary-light-8', mix(primary, 0.8)],
    ['--el-color-primary-light-9', mix(primary, 0.9)],
    ['--el-color-primary-dark-2', darken(primary, 0.2)]
  ]
}
```

mix/darken 实现：用 hex→rgb→混合→hex 的简单算法。从 142 行降到 ~60 行。

- [ ] **Step 2: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/components/ThemePicker/index.vue
git commit -m "feat(ThemePicker): rewrite for Element Plus CSS variables"
```

---

## Task 3: 迁移 permission 页面（page、directive、role、SwitchRoles）

**Files:**
- Modify: `src/views/permission/{page,directive,role}.vue`、`src/views/permission/components/SwitchRoles.vue`

- [ ] **Step 1: SwitchRoles.vue**

- `this.$store.getters.roles` → `useUserStore().roles`
- `this.$store.dispatch('user/changeRoles', val)` → `userStore.changeRoles(val)`（Task 1 已实现）
- `el-radio-button label="editor"` → `value="editor"`（EP 弃用 label 作为值）
- Options API → script setup + emit

- [ ] **Step 2: page.vue**

简单：import SwitchRoles，`this.$router.push` → useRouter。script setup。

- [ ] **Step 3: directive.vue**

- `import permission from '@/directive/permission/index'` → 已迁移为 .ts，resolve 正常
- `import checkPermission from '@/utils/permission'` → 已迁移为 .ts（Task 1）
- script setup 中用 `const vPermission = permission`（v-permission 指令）
- `checkPermission` 作为普通函数调用（methods → 顶层函数）
- `slot="content"` → `#content`（el-tooltip）
- `::v-deep` → `:deep()`

- [ ] **Step 4: role.vue**（最复杂的权限页，270 行）

- `slot-scope="scope"` → `#default="scope"`
- `:visible.sync` → `v-model`
- `this.$refs.tree.setCheckedNodes/getCheckedKeys` → `treeRef.value?.setCheckedNodes(...)`
- `this.$confirm` → `ElMessageBox.confirm`
- `this.$message` → `ElMessage`；`this.$notify` → `ElNotification`
- `this.$nextTick` → `nextTick`
- `import path from '@/utils/path'`（已迁移）
- `serviceRoutes` 在原代码里是 `this.serviceRoutes`（非响应式）→ `let serviceRoutes: any[] = []`
- 复杂树操作逻辑保持不变

- [ ] **Step 5: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/views/permission/
git commit -m "feat(permission): migrate page/directive/role/SwitchRoles to script setup"
```

---

## Task 4: 迁移 profile 页面（index + 4 个子组件）

**Files:**
- Modify: `src/views/profile/index.vue`、`src/views/profile/components/{Account,Activity,Timeline,UserCard}.vue`

- [ ] **Step 1: 逐个迁移**

READ 每个文件后迁移。profile/index 用 Vuex `mapGetters` 获取 user 信息 → Pinia `useUserStore()`。UserCard 用了 PanThumb 组件（检查是否已迁移；如未迁移，本 Task 一并处理或简化）。

- [ ] **Step 2: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/views/profile/
git commit -m "feat(profile): migrate index + Account/Activity/Timeline/UserCard"
```

---

## Task 5: 迁移 error-log + theme + clipboard + tab + icons 页面

**Files:**
- Modify: `src/views/error-log/{index,components/ErrorTestA,components/ErrorTestB}.vue`、`src/views/theme/index.vue`、`src/views/clipboard/index.vue`、`src/views/tab/{index,components/TabPane}.vue`、`src/views/icons/index.vue`

- [ ] **Step 1: error-log（3 文件）**

ErrorTestA/B 故意制造错误测试 errorHandler。迁移为 script setup，保留错误制造逻辑。注意 Vue3 的 errorHandler 签名。

- [ ] **Step 2: theme/index.vue**

- `import '@/assets/custom-theme/index.css'` — 这是 element-ui 自定义主题 CSS，在 Element Plus 下不需要。**删除此 import**，改用 Element Plus 默认主题。如果 CSS 文件不存在则无害；如果存在则不导入（避免 element-ui 样式污染）。
- `icon="el-icon-edit/share/delete/search"` → `:icon="Edit/Share/Delete/Search"`
- `<i class="el-icon-upload el-icon-right" />` → `<el-icon><Upload /></el-icon>`
- `slot="header"` → `#header`
- `toggleClass` 保留（custom-theme class 切换，body class）
- `el-radio :label="3"` → `:value="3"`（EP 弃用 label 作为值）

- [ ] **Step 3: clipboard/index.vue**

- `import clipboard from '@/directive/clipboard/index.js'` → `'@/directive/clipboard'`（resolve 到 index.ts）
- `icon="el-icon-document"` → `:icon="Document"`
- `this.$message` → `ElMessage`
- `directives: { clipboard }` → `const vClipboard = clipboard`

- [ ] **Step 4: tab/index + TabPane.vue**

- `this.$route.query.tab` → `route.query.tab`
- `this.$router.push` → `router.push`
- `this.$store` 如有 → Pinia
- TabPane 可能用 `this.$store.state.tagsView` → Pinia

- [ ] **Step 5: icons/index.vue**

- `slot="content"` → `#content`
- `elementIcons` — 原代码从 element-ui 导出图标列表。Element Plus 图标是 `@element-plus/icons-vue`。改为 `import * as ElementPlusIconsVue from '@element-plus/icons-vue'; const elementIcons = Object.keys(ElementPlusIconsVue)`
- `import clipboard from '@/utils/clipboard'` — 检查此工具是否存在
- `svgIcons` — 从 svg 文件名列表获取，用 `import.meta.glob` 或保持原逻辑

- [ ] **Step 6: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/views/error-log src/views/theme src/views/clipboard src/views/tab src/views/icons
git commit -m "feat: migrate error-log/theme/clipboard/tab/icons to script setup"
```

---

## Task 6: 恢复路由 + e2e + frontend-acceptance 验收

**Files:**
- Modify: `src/router/index.ts`
- Create: `e2e/smoke-phase3.spec.ts`

- [ ] **Step 1: 恢复 Phase 3 路由**

在 `src/router/index.ts` 的 asyncRoutes 中恢复：profile、theme、clipboard、tab、icons、error-log 路由（原 constantRoutes 里的 documentation/guide/profile，部分移到 asyncRoutes）。permission 路由已在 asyncRoutes。

- [ ] **Step 2: e2e smoke 脚本**

创建 `e2e/smoke-phase3.spec.ts`，覆盖：permission/page、permission/directive、permission/role、profile/index、theme/index、clipboard/index、tab/index、icons/index、error-log/log。

- [ ] **Step 3: 运行 e2e**

Run: `CI=1 npx playwright test`（全量 + 新 smoke）
Expected: 全绿。失败则修复。

- [ ] **Step 4: frontend-acceptance 交互式验收**

派遣 frontend-acceptance 子智能体（见 spec 6.1.1），验收范围：
- permission/page：切换角色（editor/admin）→ 验证角色变化
- permission/directive：v-permission 指令元素显隐 + checkPermission tab 切换
- permission/role：角色列表、New Role 对话框、Edit、Delete
- profile：用户卡片、tab 切换
- theme：ThemePicker 颜色选择 → 验证主色变化 + theme/index 开关
- clipboard：复制功能（直接 + 指令）
- tab：keep-alive tab 切换 + mounted times 计数
- icons：svg 图标 + EP 图标展示

- [ ] **Step 5: 修复验收发现的问题 → 回归验证**

- [ ] **Step 6: Commit**

```bash
git add src/router/index.ts e2e/
git commit -m "feat(router): restore Phase 3 routes, add e2e smoke + acceptance"
```
