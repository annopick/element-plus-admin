# Phase 4: 第三方库重度页面（components-demo + 图表 + Excel/Zip/PDF + guide）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** 迁移所有第三方库重度页面，安装 Vue3 兼容库，恢复 components-demo/charts/excel/zip/pdf/guide/documentation 路由。

**Spec:** `docs/superpowers/specs/2026-07-08-vue3-elementplus-migration-design.md`（Phase 4）

---

## Task 1: 安装第三方库 + 迁移 Charts 组件（echarts 5）

**安装**: echarts, md-editor-v3, vue-codemirror, vuedraggable@4, xlsx, file-saver, jszip, splitpanes, driver.js, @vueup/vue-count-to
**迁移**: src/components/Charts/*（3）, src/views/charts/*（3）, src/views/dashboard/admin/components/*（图表 + PanelGroup + TransactionTable + BoxCard + TodoList）
**删除**: src/components/Charts/mixins/resize.js, src/views/dashboard/admin/components/mixins/resize.js（用 useChartResize composable 替代）

echarts 4→5 关键变化：`import echarts from 'echarts'` → `import * as echarts from 'echarts'`；按需引入可选。

vue-count-to → 用静态数字或 @vueup/vue-count-to（检查是否 Vue3 兼容）。

dashboard admin/index.vue 恢复真实图表（替换 Phase 1 占位）。

---

## Task 2: 迁移编辑器组件（MarkdownEditor + JsonEditor）

**MarkdownEditor**: tui-editor → md-editor-v3（完全重写组件）
**JsonEditor**: codemirror 5 → codemirror 6 + vue-codemirror
**迁移**: src/components/MarkdownEditor/*, src/components/JsonEditor/*

---

## Task 3: 迁移拖拽/上传/其他组件（Dropzone→废弃, DndList, Kanban, DragSelect, UploadExcel, Upload, BackToTop, ImageCropper, TextHoverEffect）

- Dropzone: 废弃，dropzone.vue demo 改为 el-upload drag 演示
- DndList + Kanban: vuedraggable@2→@4
- DragSelect: vuedraggable@2→@4
- UploadExcel: XLSX 解析（xlsx 升级）
- Upload/SingleImage + SingleImage2: el-upload 迁移
- BackToTop: 简单迁移
- ImageCropper: 检查依赖（vue-cropper 或类似），迁移或占位

---

## Task 4: 迁移 components-demo 页面（14 个）+ guide + documentation

14 个 demo 页全部 script setup。guide: driver.js 0.9→1。documentation: 检查内容（可能纯静态）。

---

## Task 5: 迁移 Excel/Zip/PDF 页面 + vendor

- excel/*（7）: xlsx 升级，Export2Excel 迁移
- vendor/Export2Excel.js→.ts + Export2Zip.js→.ts
- zip/index: jszip
- pdf/*: html2pdf 或原方案

---

## Task 6: 恢复路由 + e2e + frontend-acceptance 验收

恢复 components/charts/nested/excel/zip/pdf/theme/guide/documentation 路由模块。e2e smoke + frontend-acceptance。
