import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test'
import path from 'path'

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  backgroundPage: Page;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../dist/bibbot')
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    })
    await use(context)
    await context.close()
  },
  backgroundPage: async ({ context }, use) => {
    // for manifest v2:
    let [background] = context.backgroundPages()
    if (!background) {
      background = await context.waitForEvent('backgroundpage')
    }
    await use(background)
  },
  extensionId: async ({ context }, use) => {
    // for manifest v2:
    let [background] = context.backgroundPages()
    if (!background) {
      background = await context.waitForEvent('backgroundpage')
    }

    // for manifest v3:
    // let [background] = context.serviceWorkers()
    // if (!background) { background = await context.waitForEvent('serviceworker') }

    const extensionId = background.url().split('/')[2]
    await use(extensionId)
  }
})
export const expect = test.expect
