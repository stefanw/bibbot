const consentCdnSetup = async (page) => {
  const frame = page.frames().find(frame => frame.url().indexOf('consent-cdn') !== -1)
  await frame.waitForSelector('#notice button')
  await Promise.all([
    page.waitForNavigation(),
    frame.click('#notice button')
  ])
}

export {
  consentCdnSetup
}
