import { test as base, expect } from '@playwright/test'

type ConsoleFixture = { errors: string[] }

/**
 * Test fixture that records console errors and page errors into an `errors` array.
 *
 * NOTE: assertions should be made explicitly inside each test body against the
 * `errors` array (e.g. `expect(errors).toEqual([])`). The fixture intentionally
 * does NOT assert after the test body, because unconditionally asserting on a
 * fixture that a test may not have meaningfully exercised produces noisy failures.
 */
export const test = base.extend<ConsoleFixture>({
  errors: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
    })
    await use(errors)
  }
})

export { expect }
