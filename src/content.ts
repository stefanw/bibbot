import sites from './sites.js'
import SiteBot from './sitebot.js'

const domain = document.location.host
const site = sites[domain]

if (site !== undefined) {
  const siteBot = new SiteBot(site, document, domain)
  if (siteBot.site.waitOnLoad) {
    if (document.readyState === 'complete') {
      siteBot.start(siteBot.site.waitOnLoad)
    } else {
      window.addEventListener('load', () => {
        siteBot.start(siteBot.site.waitOnLoad)
      })
    }
  } else {
    siteBot.start()
  }
}
