import { expect, test } from './fixtures'

const EXAMPLE_URL =
  'https://www.zeit.de/2021/11/soziale-ungleichheit-identitaetspolitik-diskriminierung-armut-bildung'

test('content script', async ({ page, context }) => {
  const serviceWorkerPromise = context.waitForEvent('serviceworker')

  await page.goto(EXAMPLE_URL)
  const shadowNode = await page
    .locator('.article-body > div:last-child')
    .first()
  const shadowHTML = await shadowNode.evaluate(
    (node) => node.shadowRoot.innerHTML,
  )
  await expect(shadowHTML).toContain('BibBot')
  await expect(shadowHTML).toContain('Pressedatenbank wird aufgerufen...')
  // library login page is opened in a new tab
  // but not as a popup from current page, instead via the background script

  await serviceWorkerPromise

  const pages = context.pages()
  console.log(pages.map((p) => p.url()))
  const newPage = pages.find(
    (p) => p.url().indexOf('https://www.voebb.de/oidcp/authorize') !== -1,
  )
  expect(newPage).toBeTruthy()
})

test('popup page', async ({ page, extensionId, context }) => {
  await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)
  await expect(page.locator('body')).toContainText('BibBot')
  const settingsLink = await page.locator('#settings')
  await expect(settingsLink).toHaveText('Einstellungen')
  await settingsLink.click()

  const pages = context.pages()
  console.log(pages.map((p) => p.url()))
  const newPage = pages.find(
    (p) =>
      p
        .url()
        .indexOf(`chrome-extension://${extensionId}/options/options.html`) !==
      -1,
  )
  expect(newPage).toBeTruthy()
})

test('option page', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/options/options.html`)
  await expect(page.locator('body')).toContainText('BibBot')
})
