# Phase 2: 表格与表单类页面 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 迁移表格（table）与文章示例（example）类页面到 Vue3 + Element Plus，恢复 `/table/*` 和 `/example/*` 路由，通过 e2e smoke 验收。

**Architecture:** 自底向上。先迁移被依赖的公共组件（Pagination、ArticleDetail 依赖的 Tinymce/Upload/MDinput/Sticky/Dropdown），再迁移 table 页面，最后迁移 example 页面。每 Task 可编译、可提交。

**Tech Stack:** Vue 3.4 `<script setup lang="ts">`、Element Plus、Pinia、xlsx（Excel 导出）

**Spec:** `docs/superpowers/specs/2026-07-08-vue3-elementplus-migration-design.md`（Phase 2）

**Scope:** `views/table/*`（6 文件）+ `views/example/*`（9 文件）+ 被依赖的公共组件（Pagination + ArticleDetail 的 7 个依赖组件）+ `utils/scroll-to.js→.ts` + `vendor/Export2Excel.js→.ts` + 恢复路由。

---

## 通用迁移规则（每个 .vue 文件都适用）

1. `<script> export default {...}` → `<script setup lang="ts">`
2. `filters: {}` 块 + 模板 `{{ x | filterName }}` → 删 filters 块，模板改 `{{ filterName(x) }}`，import 纯函数
3. `slot-scope="{row}"` / `slot-scope="scope"` → `#default="{ row }"` / `#default="scope"`
4. `:visible.sync="x"` → `v-model="x"`（dialog）
5. `:page.sync` / `:limit.sync` → `v-model:page` / `v-model:limit`（pagination）
6. `@keyup.enter.native` → `@keyup.enter`（去 .native）
7. `this.$message` → `ElMessage`；`this.$notify` → `ElNotification`（import from element-plus）
8. `this.$set(obj, key, val)` → 直接 `obj[key] = val`（Vue3 响应式自动追踪，无需 $set）
9. `this.$refs.xxx` → `const xxxRef = ref()`
10. `this.$nextTick` → `nextTick`
11. `icon="el-icon-search"` → `:icon="Search"`（图标名从 element-plus/icons-vue 引入，或全局注册后直接用名字）
12. `size="mini"` → `size="small"`（Element Plus 无 mini）
13. `<style>` 里 `~@/` → `@/`；`::v-deep` → `:deep()`
14. `data()` → `ref`/`reactive`；`computed: {}` → `computed()`；`methods: {}` → 普通函数；`watch: {}` → `watch()`；`created()` → setup body

---

## Task 1: 迁移 Pagination 组件 + scroll-to 工具

**Files:**
- Modify: `src/components/Pagination/index.vue`
- Modify(rename): `src/utils/scroll-to.js` → `.ts`

**Files:**
- Modify: `src/components/Pagination/index.vue`
- Modify: `src/utils/scroll-to.js` → `src/utils/scroll-to.ts`

- [ ] **Step 1: git mv src/utils/scroll-to.js src/utils/scroll-to.ts，加类型**

原 scroll-to.js 内容是 `window.scrollTo` 的平滑滚动封装。迁移为 .ts，给参数加类型（`to: number, duration: number`）。

- [ ] **Step 2: 迁移 src/components/Pagination/index.vue**

关键改动：
- `:current-page.sync="currentPage"` → `v-model:current-page="currentPageValue"`（注意：Element Plus 的 el-pagination 用 `v-model:current-page`）
- `:page-size.sync="pageSize"` → `v-model:page-size="pageSizeValue"`
- Options API → script setup
- `this.$emit('update:page', val)` 保留（父组件用 `:page.sync` → 但父组件改用 `v-model:page`，所以这里的 emit 改为配合 `defineEmits`）
- 实际上 Pagination 是一个 wrapper：它接收 `page`/`limit` props，通过 `update:page`/`update:limit` 事件通知父组件。父组件用 `:page.sync="listQuery.page"` → 改为 `v-model:page="listQuery.page"`。Pagination 内部的 computed get/set 模式保留。

script setup 版本：
```ts
<script setup lang="ts">
import { computed } from 'vue'
import { scrollTo } from '@/utils/scroll-to'

const props = withDefaults(defineProps<{
  total: number
  page?: number
  limit?: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
  autoScroll?: boolean
  hidden?: boolean
}>(), {
  page: 1,
  limit: 20,
  pageSizes: () => [10, 20, 30, 50],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  autoScroll: true,
  hidden: false
})

const emit = defineEmits<{
  (e: 'update:page', val: number): void
  (e: 'update:limit', val: number): void
  (e: 'pagination', val: { page: number; limit: number }): void
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val: number) => emit('update:page', val)
})
const pageSize = computed({
  get: () => props.limit,
  set: (val: number) => emit('update:limit', val)
})

function handleSizeChange(val: number) {
  emit('pagination', { page: props.page, limit: val })
  if (props.autoScroll) scrollTo(0, 800)
}
function handleCurrentChange(val: number) {
  emit('pagination', { page: val, limit: props.limit })
  if (props.autoScroll) scrollTo(0, 800)
}
</script>
```
模板中 `:current-page.sync` → `v-model:current-page`，`:page-size.sync` → `v-model:page-size`。

- [ ] **Step 3: 验证 vue-tsc**

Run: `npx vue-tsc --noEmit`
Expected: 0 错误（Pagination 自身无错误）。

- [ ] **Step 4: Commit**

```bash
git add src/components/Pagination/index.vue src/utils/scroll-to.ts
git rm src/utils/scroll-to.js
git commit -m "feat(Pagination): migrate to script setup, scroll-to to TS"
```

---

## Task 2: 迁移 table 页面（dynamic-table + inline-edit-table）

**Files:**
- Modify: `src/views/table/dynamic-table/index.vue`、`src/views/table/dynamic-table/components/{FixedThead,UnfixedThead}.vue`、`src/views/table/inline-edit-table.vue`

- [ ] **Step 1: dynamic-table/index.vue**

简单包装组件，import FixedThead + UnfixedThead。改 script setup，import 加 `.vue`。

- [ ] **Step 2: FixedThead.vue**

- Options API → script setup
- `watch: { checkboxVal(valArr) }` → `watch(checkboxVal, (valArr) => {...})`
- `slot-scope="scope"` → `#default="scope"`

- [ ] **Step 3: UnfixedThead.vue**

READ 后迁移（类似 FixedThead）。

- [ ] **Step 4: inline-edit-table.vue**

关键改动：
- `filters: { statusFilter }` → 删，模板 `{{ row.status | statusFilter }}` → `{{ statusFilter(row.status) }}`，定义 `statusFilter` 为普通函数或 import
- `slot-scope="{row}"` → `#default="{ row }"`
- `this.$set(v, 'edit', false)` → `v.edit = false`（Vue3 无需 $set；但需要在类型里声明 `edit` 属性，用 `as any` 或定义接口）
- `icon="el-icon-refresh"` → `:icon="Refresh"`；`icon="el-icon-circle-check-outline"` → `:icon="CircleCheck"`（或用全局注册的组件名）；`icon="el-icon-edit"` → `:icon="Edit"`
- `this.$message` → `ElMessage`
- `async getList()` → setup 内 `async function getList()`，在 setup 顶层调用

- [ ] **Step 5: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/views/table/
git commit -m "feat(table): migrate dynamic-table + inline-edit-table to script setup"
```

---

## Task 3: 迁移 table 页面（drag-table + complex-table）

**Files:**
- Modify: `src/views/table/drag-table.vue`、`src/views/table/complex-table.vue`

- [ ] **Step 1: drag-table.vue**

关键改动：
- `filters: { statusFilter }` → 函数
- `slot-scope="{row}"` → `#default="{ row }"`
- `this.$refs.dragTable.$el.querySelectorAll(...)` → `dragTableRef.value?.$el.querySelectorAll(...)`
- `this.$nextTick(() => this.setSort())` → `nextTick(() => setSort())`
- Sortable（sortablejs）API 不变

- [ ] **Step 2: complex-table.vue（最复杂的表格页）**

关键改动（很多）：
- `filters: { statusFilter, typeFilter }` → 定义为普通函数，模板 `| statusFilter` → `statusFilter(...)`、`| typeFilter` → `typeFilter(...)`、`| parseTime(...)` → `parseTime(...)`（parseTime 已在 utils）
- `slot-scope="{row}"` / `slot-scope="{row,$index}"` → `#default="{ row }"` / `#default="{ row, $index }"`
- `:visible.sync="dialogFormVisible"` / `:visible.sync="dialogPvVisible"` → `v-model`
- `:page.sync` / `:limit.sync` → `v-model:page` / `v-model:limit`
- `@keyup.enter.native` → `@keyup.enter`
- `icon="el-icon-search/edit/download"` → `:icon="Search/Edit/Download"`
- `this.$message` → `ElMessage`；`this.$notify` → `ElNotification`
- `this.$refs['dataForm'].validate/clearValidate` → `dataFormRef.value?.validate/clearValidate`
- `this.$nextTick` → `nextTick`
- `size="mini"` → `size="small"`
- `import('@/vendor/Export2Excel')` 动态导入 — Vite 支持动态 import，但 vendor/Export2Excel.js 依赖 xlsx/file-saver（未安装）。**本 Task 先把 Export2Excel 的 import 注释掉 + TODO，handleDownload 改为提示「Export 功能 Phase 4 实现」**，因为 xlsx 安装 + vendor 迁移是 Phase 4 scope（Excel 页面）。complex-table 的导出按钮改为 ElMessage.info 提示。
- `import Pagination from '@/components/Pagination'` → `'@/components/Pagination/index.vue'`
- `import waves from '@/directive/waves'` → `'@/directive/waves'`（resolve 到 index.ts）

- [ ] **Step 3: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/views/table/
git commit -m "feat(table): migrate drag-table + complex-table to script setup"
```

---

## Task 4: 迁移 ArticleDetail 依赖的公共组件（MDinput、Sticky、Upload/SingleImage3、Dropdown x3、Warning）

**Files:**
- Modify: `src/components/MDinput/index.vue`、`src/components/Sticky/index.vue`、`src/components/Upload/SingleImage3.vue`、`src/views/example/components/{Warning,Dropdown/Comment,Dropdown/Platform,Dropdown/SourceUrl}.vue`、`src/views/example/components/Dropdown/index.js`→`.ts`

> Tinymce 单独在 Task 5（它较复杂，动态加载脚本）。

- [ ] **Step 1: 逐个迁移（READ 每个文件后迁移）**

每个组件按通用规则迁移。特别注意：
- **MDinput**：有 `$emit('input', ...)` → `defineEmits + update:modelValue`（Vue3 的 v-model 用 modelValue）
- **Sticky**：`this.$parent`（获取父元素滚动）→ 用 `getCurrentInstance()?.parent` 或 DOM 查询
- **Upload/SingleImage3**：el-upload 的 `slot="trigger"` → `#trigger`；`:visible.sync` 相关；`:on-success` 等 prop 名 Element Plus 兼容
- **Dropdown x3**：简单的 v-model wrapper，Options API → script setup
- **Warning**：纯静态模板
- **Dropdown/index.js** → `.ts`：barrel export，加 `.vue` 后缀

- [ ] **Step 2: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/components/MDinput src/components/Sticky src/components/Upload/SingleImage3.vue src/views/example/components/
git commit -m "feat(example): migrate ArticleDetail deps (MDinput, Sticky, Upload, Dropdowns, Warning)"
```

---

## Task 5: 迁移 Tinymce 组件

**Files:**
- Modify: `src/components/Tinymce/index.vue`、`src/components/Tinymce/components/EditorImage.vue`、`src/components/Tinymce/dynamicLoadScript.js`→`.ts`

> Tinymce 通过动态加载 tinymce JS 脚本实现（不依赖 Vue 框架），核心是 `dynamicLoadScript.js` 动态注入 `<script>` 标签。

- [ ] **Step 1: READ Tinymce/index.vue + dynamicLoadScript.js + EditorImage.vue**

- [ ] **Step 2: 迁移 dynamicLoadScript.js → .ts**

加类型（callback 参数）。逻辑不变（动态创建 script 标签）。

- [ ] **Step 3: 迁移 Tinymce/index.vue**

关键改动：
- Options API → script setup
- `this.$emit('input', ...)` → `emit('update:modelValue', ...)`（Vue3 v-model）
- `watch: { value(val) {...} }` → `watch(() => props.modelValue, ...)`
- tinymce 实例管理（mounted 初始化、beforeDestroy 销毁 → onMounted/onBeforeUnmount）
- `this.$message` → `ElMessage`

- [ ] **Step 4: 迁移 EditorImage.vue**

- [ ] **Step 5: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/components/Tinymce/
git commit -m "feat(Tinymce): migrate to script setup, dynamicLoadScript to TS"
```

---

## Task 6: 迁移 example 页面（list、create、edit、ArticleDetail）

**Files:**
- Modify: `src/views/example/list.vue`、`src/views/example/create.vue`、`src/views/example/edit.vue`、`src/views/example/components/ArticleDetail.vue`

- [ ] **Step 1: list.vue**

关键改动：
- `filters: { statusFilter }` → 函数
- `slot-scope` → `#default`
- `:page.sync` / `:limit.sync` → `v-model:page` / `v-model:limit`
- `icon="el-icon-edit"` → `:icon="Edit"`
- `created()` → setup body 调 getList()
- import Pagination 加 `.vue`

- [ ] **Step 2: create.vue + edit.vue**

都很短（13 行），只是 render ArticleDetail。改 script setup。

- [ ] **Step 3: ArticleDetail.vue**

关键改动：
- Options API → script setup
- `this.$refs.postForm.validate` → `postFormRef.value?.validate`
- `this.$message` → `ElMessage`；`this.$notify` → `ElNotification`
- `this.$store.dispatch('tagsView/updateVisitedView', route)` → `tagsViewStore.updateVisitedView(route)`
- `this.$route.params.id` → `route.params.id`
- `import Tinymce/Upload/MDinput/Sticky` → 加 `.vue`/`/index.vue`
- `format="yyyy-MM-dd HH:mm:ss"` → Element Plus 用 `format="YYYY-MM-DD HH:mm:ss"`（Day.js 大写）
- `@import "~@/styles/mixin.scss"` → `@import "@/styles/mixin.scss"`
- `::v-deep` → `:deep()`
- `props: { isEdit }` → `defineProps<{ isEdit?: boolean }>()`

- [ ] **Step 4: 验证 + Commit**

Run: `npx vue-tsc --noEmit`（0 错误）
```bash
git add src/views/example/
git commit -m "feat(example): migrate list/create/edit/ArticleDetail to script setup"
```

---

## Task 7: 恢复 table + example 路由 + e2e smoke

**Files:**
- Modify: `src/router/index.ts`、`src/router/modules/table.ts`、`src/router/modules/nested.ts`（如有 example 在这里）、`e2e/smoke-table-example.spec.ts`（新）

- [ ] **Step 1: 恢复 table 路由**

在 `src/router/index.ts` 的 `asyncRoutes` 中，恢复 tableRouter（Phase 1 已注释/移除）。READ `src/router/modules/table.ts`，确认它已迁移为 .ts（Phase 1 Task 6 已 git mv）。把 `import tableRouter from './modules/table'` 取消注释，加入 asyncRoutes。

- [ ] **Step 2: 恢复 example 路由**

example 路由在原 `src/router/index.js` 的 asyncRoutes 里是内联定义的（不在 modules/）。在 `src/router/index.ts` 的 asyncRoutes 中加入 example 路由块：
```ts
{
  path: '/example',
  component: Layout,
  redirect: '/example/list',
  name: 'Example',
  meta: { title: 'Example', icon: 'el-icon-s-help' },
  children: [
    { path: 'create', name: 'CreateArticle', component: () => import('@/views/example/create.vue'), meta: { title: 'Create Article', icon: 'edit' } },
    { path: 'edit/:id(\\d+)', name: 'EditArticle', component: () => import('@/views/example/edit.vue'), meta: { title: 'Edit Article', noCache: true, activeMenu: '/example/list' }, hidden: true },
    { path: 'list', name: 'ArticleList', component: () => import('@/views/example/list.vue'), meta: { title: 'Article List', icon: 'list' } }
  ]
} as AppRouteRecord,
```
注意：`icon: 'el-icon-s-help'` 需确认对应 Element Plus 图标名。

- [ ] **Step 3: 验证 build + dev**

Run: `npx vue-tsc --noEmit`（0 错误）
Run: `npm run build`（成功）

- [ ] **Step 4: e2e smoke 测试**

创建 `e2e/smoke-table-example.spec.ts`：
```ts
import { test, expect } from '@playwright/test'
import { ADMIN_STATE } from './fixtures/auth-paths'

const PAGES = [
  { name: 'complex-table', path: '/table/complex-table', selector: '.app-container' },
  { name: 'inline-edit-table', path: '/table/inline-edit-table', selector: '.app-container' },
  { name: 'drag-table', path: '/table/drag-table', selector: '.app-container' },
  { name: 'dynamic-table', path: '/table/dynamic-table', selector: '.app-container' },
  { name: 'example-list', path: '/example/list', selector: '.app-container' },
  { name: 'example-create', path: '/example/create', selector: '.createPost-container' }
]

for (const p of PAGES) {
  test(`${p.name} renders without console error`, async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(p.path)
    await expect(page.locator(p.selector)).toBeVisible({ timeout: 10000 })
    await page.waitForLoadState('networkidle')
    expect(errors, `Console errors:\n${errors.join('\n')}`).toEqual([])
    await page.screenshot({ path: `e2e/snapshots/${p.name}.png`, fullPage: true })
    await context.close()
  })
}
```

Run: `CI=1 npx playwright test e2e/smoke-table-example.spec.ts`
Expected: 全绿。如失败，诊断修复（可能是组件迁移遗漏）。

- [ ] **Step 5: Commit**

```bash
git add src/router/ e2e/smoke-table-example.spec.ts
git commit -m "feat(router): restore table + example routes, add e2e smoke tests"
```

---

## 自检（Self-Review）

**Spec 覆盖**：
- views/table/*（6 文件）：Task 2-3 ✓
- views/example/*（9 文件）：Task 4-6 ✓
- Pagination 组件：Task 1 ✓
- ArticleDetail 依赖（MDinput/Sticky/Upload/Dropdown/Warning）：Task 4 ✓
- Tinymce：Task 5 ✓
- scroll-to → TS：Task 1 ✓
- 路由恢复 + e2e：Task 7 ✓

**有意占位**：
- complex-table 的 Excel 导出（依赖 xlsx，Phase 4）
- vendor/Export2Excel.js 迁移（Phase 4，随 Excel 页面）
