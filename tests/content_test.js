import sites from '../src/sites.js'
import SiteBot from '../src/sitebot.js'

const domain = document.location.host
const site = sites[domain]

if (site !== undefined) {
  window.siteBot = new SiteBot(site, document, domain)
}
