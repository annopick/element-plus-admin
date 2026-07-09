import { test, expect } from '@playwright/test'
import { ADMIN_STATE } from './fixtures/auth-paths'

const PAGES = [
  { name: 'complex-table', path: '/#/table/complex-table', selector: '.app-container' },
  { name: 'inline-edit-table', path: '/#/table/inline-edit-table', selector: '.app-container' },
  { name: 'drag-table', path: '/#/table/drag-table', selector: '.app-container' },
  { name: 'dynamic-table', path: '/#/table/dynamic-table', selector: '.app-container' },
  { name: 'example-list', path: '/#/example/list', selector: '.app-container' },
  { name: 'example-create', path: '/#/example/create', selector: '.createPost-container' }
]

for (const p of PAGES) {
  test(`${p.name} renders without console error`, async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(p.path)
    // Use .first() because some pages (e.g. dynamic-table) render multiple
    // .app-container elements via child components.
    await expect(page.locator(p.selector).first()).toBeVisible({ timeout: 15000 })
    await page.waitForLoadState('networkidle')
    expect(errors, `Console errors on ${p.name}:\n${errors.join('\n')}`).toEqual([])
    await page.screenshot({ path: `e2e/snapshots/${p.name}.png`, fullPage: true })
    await context.close()
  })
}
