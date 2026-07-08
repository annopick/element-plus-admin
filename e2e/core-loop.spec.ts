import { test, expect } from '@playwright/test'
import { ADMIN_STATE } from './fixtures/auth-paths'
import path from 'path'

const SNAPSHOTS_DIR = path.join(__dirname, 'snapshots')

test.describe('Core Loop — Phase 1 acceptance', () => {

  test('1. Unauthenticated visit to / redirects to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/#\/login/)
  })

  test('2. Login page elements visible', async ({ page }) => {
    await page.goto('/#/login')
    await expect(page.getByText('Login Form')).toBeVisible()
    await expect(page.getByPlaceholder('Username')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  test('3. Invalid username shows validation error on blur', async ({ page }) => {
    await page.goto('/#/login')
    const username = page.getByPlaceholder('Username')
    await username.fill('wronguser')
    // Trigger validation by blurring the field
    await username.press('Tab')
    await expect(page.getByText('Please enter the correct user name')).toBeVisible({ timeout: 5000 })
  })

  test('4. Invalid username login fails (stays on login)', async ({ page }) => {
    await page.goto('/#/login')
    await page.getByPlaceholder('Username').fill('wronguser')
    await page.getByPlaceholder('Password').fill('111111')
    await page.getByRole('button', { name: 'Login' }).click()
    // Client-side validUsername() rejects 'wronguser', so we stay on /login.
    // Confirm the validation error appears and URL is unchanged.
    await expect(page.getByText('Please enter the correct user name')).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL(/#\/login/)
  })

  test('5. admin login succeeds and redirects to dashboard', async ({ page }) => {
    await page.goto('/#/login')
    await page.getByPlaceholder('Username').fill('admin')
    await page.getByPlaceholder('Password').fill('111111')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/#\/dashboard/, { timeout: 15000 })
  })

  test('6. Dashboard renders with key elements (logged in)', async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE })
    const page = await context.newPage()
    await page.goto('/#/dashboard')
    await expect(page.locator('.dashboard-editor-container')).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: path.join(SNAPSHOTS_DIR, 'dashboard.png'), fullPage: true })
    await context.close()
  })

  test('7. Sidebar renders navigation menu (logged in)', async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE })
    const page = await context.newPage()
    await page.goto('/#/dashboard')
    // Wait for the route guard (getInfo + generateRoutes) to finish before
    // asserting on layout elements.
    await expect(page.locator('.dashboard-editor-container')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.sidebar-container')).toBeVisible()
    // Dashboard is a constant route and is always in the menu.
    await expect(page.locator('.sidebar-container').getByText('Dashboard')).toBeVisible({ timeout: 10000 })
    await context.close()
  })

  test('8. No console errors on login page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.goto('/#/login')
    await page.waitForLoadState('networkidle')
    expect(errors, `Console errors:\n${errors.join('\n')}`).toEqual([])
  })

  test('9. No console errors on dashboard (logged in)', async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.goto('/#/dashboard')
    await page.waitForLoadState('networkidle')
    expect(errors, `Console errors:\n${errors.join('\n')}`).toEqual([])
    await context.close()
  })

  test('10. 404 page renders (authenticated)', async ({ browser }) => {
    // /404 is not in the login whiteList, so an unauthenticated visit redirects
    // to /login. Use a logged-in context to actually reach the 404 page.
    const context = await browser.newContext({ storageState: ADMIN_STATE })
    const page = await context.newPage()
    await page.goto('/#/404')
    await expect(page.getByText('OOPS!')).toBeVisible({ timeout: 5000 })
    await context.close()
  })

  test('11. Logout returns to login page', async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE })
    const page = await context.newPage()
    await page.goto('/#/dashboard')
    await page.waitForLoadState('networkidle')
    // Open the avatar dropdown.
    await page.locator('.avatar-container .avatar-wrapper').click()
    // Click "Log Out" inside the dropdown menu.
    await page.getByText('Log Out').click()
    await expect(page).toHaveURL(/#\/login/, { timeout: 10000 })
    await context.close()
  })
})
