const getConsentCdnSetup = ({ pageChanges = false, framePart = 'consent-cdn', button = '#notice button' }) => {
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

export {
  getConsentCdnSetup,
  getCmpBoxConsent
}
