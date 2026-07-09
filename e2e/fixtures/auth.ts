import { chromium, type FullConfig } from '@playwright/test'
import { mkdirSync } from 'fs'
import path from 'path'
import { ADMIN_STATE, AUTH_DIR } from './auth-paths'

// Re-export the path constants so consumers can import them from this module
// if desired. Test files, however, should import from './fixtures/auth-paths'
// to avoid pulling this globalSetup entry into the test module graph.
export { ADMIN_STATE, AUTH_DIR }

/**
 * globalSetup — runs once before the test suite (declared via the
 * `globalSetup` option in playwright.config.ts).
 *
 * Logs in as admin through the real UI and persists the browser storage state
 * (cookies + localStorage) to e2e/.auth/admin.json, so individual tests can
 * create a context with `storageState: ADMIN_STATE` and skip the login flow.
 *
 * NOTE: A globalSetup file must export a default function — it must NOT call
 * test()/setup() at the top level (that throws "did not expect test() to be
 * called here"). We therefore drive a standalone browser here instead of using
 * the fixture-based `setup('...')` API.
 */
export default async function globalSetup(_config: FullConfig) {
  mkdirSync(AUTH_DIR, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto('http://localhost:9527/#/login')
    await page.getByPlaceholder('Username').fill('admin')
    await page.getByPlaceholder('Password').fill('111111')
    await page.getByRole('button', { name: 'Login' }).click()
    // Hash router — dashboard URL is /#/dashboard
    await page.waitForURL(/#\/dashboard/, { timeout: 15000 })
    await context.storageState({ path: ADMIN_STATE })
  } finally {
    await browser.close()
  }
}
