const getConsentCdnSetup = ({ pageChanges }) => {
  return async (page) => {
    console.log('consent setup: find frame')
    const frame = page.frames().find(frame => frame.url().indexOf('consent-cdn') !== -1)
    console.log('consent setup: find element')
    const element = await frame.waitForSelector('#notice button', { timeout: 5000 })
    if (!element) {
      return
    }
    console.log('consent setup: click button')
    const finalStep = [
      frame.click('#notice button')
    ]
    if (pageChanges) {
      finalStep.push(page.waitForNavigation())
    }
    await Promise.all(finalStep)
  }
}

export {
  getConsentCdnSetup
}
