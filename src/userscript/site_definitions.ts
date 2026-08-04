import type { Sites } from '../types.js'
import completeSites from '../sites.js'

// Site selectors, query functions, source parameters and article rendering are
// shared with the browser extension. Only test-only metadata is removed from
// the userscript bundle.
export const userscriptSites = Object.fromEntries(
  Object.entries(completeSites)
    .filter(([, site]) => site.source === 'genios.de')
    .map(([host, site]) => {
      const runtimeSite = { ...site }
      delete runtimeSite.examples
      delete runtimeSite.testSetup
      return [host, runtimeSite]
    }),
) as Sites

export default userscriptSites
