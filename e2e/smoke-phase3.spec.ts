import { test, expect } from '@playwright/test'
import { ADMIN_STATE } from './fixtures/auth-paths'

// Smoke test for the Phase 3 routes (profile, theme, clipboard, tab, icons).
// Each page must render its top-level container with zero console errors /
// page errors.
//
// The error-log page (/error-log/log) is deliberately excluded: its
// ErrorTestA/B components throw at render time to exercise the app
// errorHandler, so "no console error" would be a false failure.

const PAGES = [
  { name: 'permission-page', path: '/#/permission/page', selector: '.app-container' },
  { name: 'permission-directive', path: '/#/permission/directive', selector: '.app-container' },
  { name: 'permission-role', path: '/#/permission/role', selector: '.app-container' },
  { name: 'profile', path: '/#/profile/index', selector: '.app-container' },
  { name: 'theme', path: '/#/theme/index', selector: '.app-container' },
  { name: 'clipboard', path: '/#/clipboard/index', selector: '.app-container' },
  { name: 'tab', path: '/#/tab/index', selector: '.tab-container' },
  { name: 'icons', path: '/#/icons/index', selector: '.icons-container' }
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
    await page.screenshot({ path: `e2e/snapshots/phase3-${p.name}.png`, fullPage: true })
    await context.close()
  })
}
