import {
  createAstecProvider,
  type AstecProviderInput,
} from './astec_provider.js'

export const voebbProviderData = {
  id: 'voebb.de',
  name: 'VÖBB - Verbund der öffenlichen Bibliotheken Berlins',
  web: 'https://voebb.de/',
  params: {
    'www.munzinger.de': {
      portalId: '50158',
    },
  },
  domain: 'bib-voebb.genios.de',
  permissions: ['https://www.voebb.de/*'],
} satisfies AstecProviderInput

const voebbProvider = createAstecProvider(voebbProviderData)

export default voebbProvider
