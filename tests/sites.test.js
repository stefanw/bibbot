// eslint-disable-next-line no-unused-vars
/* global describe, test, expect, beforeAll, page, jest, jestPuppeteer */
import fs from 'fs'
import sites from '../src/sites.js'
// import SiteBot from '../src/sitebot.js'

const siteTests = []

for (const siteDomain in sites) {
  const site = sites[siteDomain]
  if (site.examples) {
    site.examples.forEach(example => {
      siteTests.push({ site, siteDomain, example })
    })
  }
}

describe.each(siteTests)('test $siteDomain', ({ site, siteDomain, example }) => {
  jest.setTimeout(30000)
  console.log(siteDomain, example)

  beforeAll(async () => {
    await page.goto(example.url)
    await page.waitForNetworkIdle()
    // Run some site-specific test setup, like GDPR clicks
    if (site.testSetup) {
      await site.testSetup(page)
    }
    await page.evaluate(fs.readFileSync('./test_build/content_test.js', 'utf8'))
  })
  test(`Detect paywall for ${siteDomain}`, async () => {
    // await jestPuppeteer.debug()
    const result = await page.evaluate(async () => {
      return window.siteBot.hasPaywall()
    })
    expect(result).toBe(true)
  })
  test(`Check info extraction for ${siteDomain}`, async () => {
    // await jestPuppeteer.debug()
    const result = await page.evaluate(async () => {
      try {
        return window.siteBot.collectArticleInfo()
      } catch (err) {
        return null
      }
    })
    if (example.selectors) {
      for (const key in example.selectors) {
        expect(result[key]).toBe(example.selectors[key])
      }
    }
  })
})
