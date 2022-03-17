import * as fs from 'fs'
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
    await page.goto(example.url, { waitUntil: 'networkidle2' })

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
    if (!example.noPaywall) {
      const result = await page.evaluate(async () => {
        return window.extractor.hasPaywall()
      })
      expect(result).toBe(true)
    }
  })
  test(`Detect main area for ${siteDomain}`, async () => {
    // await jestPuppeteer.debug()
    console.log('main area', siteDomain)
    const result = await page.evaluate(async () => {
      return window.extractor.getMainContentArea() !== null
    })
    expect(result).toBe(true)
  })
  test(`Check info extraction for ${siteDomain}`, async () => {
    // await jestPuppeteer.debug()
    console.log('info extraction', siteDomain)
    const result = await page.evaluate(async () => {
      if (!window.extractor.shouldExtract()) {
        return null
      }
      return window.extractor.extractArticleInfo()
    })
    if (example.selectors) {
      for (const key in example.selectors) {
        expect(result[key]).toBe(example.selectors[key])
      }
    }
  })
})
