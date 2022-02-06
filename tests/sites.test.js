// eslint-disable-next-line no-unused-vars
/* global describe, test, expect, beforeAll, page, jest, jestPuppeteer */
import fs from 'fs'
import sites from '../src/sites.js'

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
    console.log('beforeall', siteDomain)
    // await jestPuppeteer.debug()
    await page.goto(example.url)
    console.log('wait for idle', siteDomain)
    try {
      // optionally wait for idle network max 2s
      await page.waitForNetworkIdle({ timeout: 2000 })
    } catch {}
    // Run some site-specific test setup, like GDPR clicks
    if (site.testSetup) {
      console.log('test setup', siteDomain)
      await site.testSetup(page)
    }
    console.log('inject script', siteDomain)
    await page.evaluate(fs.readFileSync('./test_build/content_test.js', 'utf8'))
  })
  test(`Detect paywall for ${siteDomain}`, async () => {
    // await jestPuppeteer.debug()
    console.log('paywall', siteDomain)
    const result = await page.evaluate(async () => {
      return window.siteBot.hasPaywall()
    })
    expect(result).toBe(true)
  })
  test(`Check info extraction for ${siteDomain}`, async () => {
    // await jestPuppeteer.debug()
    console.log('info extraction', siteDomain)
    const result = await page.evaluate(async () => {
      return window.siteBot.startInfoExtraction()
    })
    if (example.selectors) {
      for (const key in example.selectors) {
        expect(result[key]).toBe(example.selectors[key])
      }
    }
  })
})
