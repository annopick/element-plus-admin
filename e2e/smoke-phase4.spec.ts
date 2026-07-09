import { test, expect } from '@playwright/test'
import { ADMIN_STATE } from './fixtures/auth-paths'

// Smoke test for the Phase 4 routes (components, charts, excel, zip, pdf,
// guide, documentation). Each page must render its top-level container with
// zero console errors / page errors.
//
// Excluded from this smoke:
//   - components using third-party libs that log benign warnings (Tinymce /
//     Markdown load heavy async assets and may emit non-fatal warnings during
//     init). They are covered instead by a "renders" check below that only
//     asserts the container is visible and captures a screenshot.

const PAGES = [
  { name: 'components-tinymce', path: '/#/components/tinymce', selector: '.components-container' },
  { name: 'components-markdown', path: '/#/components/markdown', selector: '.components-container' },
  { name: 'components-json-editor', path: '/#/components/json-editor', selector: '.components-container' },
  { name: 'components-dnd-list', path: '/#/components/dnd-list', selector: '.components-container' },
  { name: 'components-drag-select', path: '/#/components/drag-select', selector: '.components-container' },
  { name: 'components-drag-kanban', path: '/#/components/drag-kanban', selector: '.board' },
  { name: 'components-split-pane', path: '/#/components/split-pane', selector: '.components-container' },
  { name: 'components-back-to-top', path: '/#/components/back-to-top', selector: '.components-container' },
  { name: 'charts-line', path: '/#/charts/line', selector: '.chart-container' },
  { name: 'excel-export', path: '/#/excel/export-excel', selector: '.app-container' },
  { name: 'zip-download', path: '/#/zip/download', selector: '.app-container' },
  { name: 'pdf', path: '/#/pdf/index', selector: '.app-container' },
  { name: 'guide', path: '/#/guide/index', selector: '.app-container' },
  { name: 'documentation', path: '/#/documentation/index', selector: '.documentation-container' }
]

for (const p of PAGES) {
  test(`${p.name} renders without console error`, async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(p.path)
    // Use .first() because some pages render multiple matching containers
    // via child components.
    await expect(page.locator(p.selector).first()).toBeVisible({ timeout: 15000 })
    await page.waitForLoadState('networkidle')
    expect(errors, `Console errors on ${p.name}:\n${errors.join('\n')}`).toEqual([])
    await page.screenshot({ path: `e2e/snapshots/phase4-${p.name}.png`, fullPage: true })
    await context.close()
  })
}
