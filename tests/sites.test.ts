import { expect, test } from '@playwright/test'
import * as fs from 'fs'
import sites from '../src/sites.js'

const siteTests = []

for (const siteDomain in sites) {
  const site = sites[siteDomain]
  if (site.examples) {
    site.examples.forEach((example, i) => {
      siteTests.push({ testSetup: site.testSetup, siteDomain, example, exampleIndex: i })
    })
  }
}

for (const site of siteTests) {
  const siteDomain = site.siteDomain
  const example = site.example
  const exampleIndex = site.exampleIndex

  test.describe(`testing with ${siteDomain}${exampleIndex > 0 ? `[${exampleIndex}]` : ''}`, () => {
    let needsSetup = true
    test.beforeEach(async ({ page }) => {
      if (!needsSetup) {
        return
      }
      console.log('beforeall', siteDomain)
      await page.goto(example.url, { waitUntil: 'load' })

      // Run some site-specific test setup, like GDPR clicks
      if (site.testSetup) {
        console.log('test setup', siteDomain)
        await site.testSetup(page)
      }
      console.log('inject script', siteDomain)
      await page.evaluate(fs.readFileSync('./test_build/content_test.js', 'utf8'))
      needsSetup = false
    })
    test(`Detect extractors for ${siteDomain}`, async ({ page }) => {
      console.log('paywall', siteDomain)
      const result = await page.evaluate(async () => {
        return window.extractor.hasPaywall()
      })
      expect(result).toBe(true)

      console.log('main area', siteDomain)
      const foundMain = await page.evaluate(async () => {
        return window.extractor.getMainContentArea() !== null
      })
      expect(foundMain).toBe(true)

      console.log('info extraction', siteDomain)
      const articleInfo = await page.evaluate(async () => {
        if (!window.extractor.shouldExtract()) {
          return null
        }
        return window.extractor.extractArticleInfo()
      })
      if (example.selectors) {
        for (const key in example.selectors) {
          expect(articleInfo[key]).toBe(example.selectors[key])
        }
      }
    })
  })
}
