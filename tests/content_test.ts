import Extractor from '../src/extractor.js'
import sites from '../src/sites.js'

const domain = document.location.host
const site = sites[domain]

if (site !== undefined) {
  window.extractor = new Extractor(site, document, null)
}
