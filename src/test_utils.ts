const getContentPassConsent = ({ pageChanges = false }) => {
  return async (page) => {
    try {
      const locator = page.getByText('Akzeptieren und weiter')
      await locator.textContent({ timeout: 1000 })
      await locator.click()
    } catch (e) {
      return
    }
    if (pageChanges) {
      await page.waitForNavigation()
    }
  }
}

const getConsentCdnSetup = ({ pageChanges = false, framePart = 'consent-cdn', button = '#notice button.sp_choice_type_11' }) => {
  return async (page) => {
    console.log('consent setup: find frame')
    const frame = page.frames().find(frame => frame.url().indexOf(framePart) !== -1)
    if (!frame) {
      return
    }
    console.log('consent setup: find element')
    const element = await frame.waitForSelector(button, { timeout: 5000 })
    if (!element) {
      return
    }
    console.log('consent setup: click button')
    const finalStep = [
      frame.click(button)
    ]
    if (pageChanges) {
      finalStep.push(page.waitForNavigation())
    }
    await Promise.all(finalStep)
  }
}

const getCmpBoxConsent = () => {
  return async (page) => {
    const consent = '.cmpboxbtn.cmpboxbtnyes'
    await page.waitForSelector(consent)
    await page.click(consent)
  }
}

const consentShadowRoot = ({ docSelector = '.needsclick', shadowSelector = '.cmp-button-accept-all' }) => {
  return async (page) => {
    await page.locator(docSelector).evaluate((node, shadowSelector) => node.shadowRoot.querySelector(shadowSelector).click(), shadowSelector)
  }
}

export { consentShadowRoot, getCmpBoxConsent, getConsentCdnSetup, getContentPassConsent }
