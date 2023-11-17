import { Sources } from './types.js'

const sources: Sources = {
  'www.munzinger.de': {
    loggedIn: ".metanav-a[href='/search/logout']",
    start: 'https://{source.domain.raw}/search/go/spiegel/aktuell.jsp?portalid={source.portalId}',
    defaultParams: {
      domain: 'www.munzinger.de',
      // reverse-proxied portals such as www-munzinger-de.stbhannover.idm.oclc.org may not use portalId,
      // adding an empty ?portalid= parameter works in these cases
      portalId: ''
    },
    login: [
      [
        { click: '.gdprcookie-buttons button', optional: true },
        { fill: { selector: '#user-input', key: 'options.username' } },
        { fill: { selector: '#pwd-bezeichnung', key: 'options.password' } },
        { click: 'input[src="/grafiken/button-login.gif"]' }
      ]
    ],
    search: [
      [
        { message: 'Artikel wird gesucht...' },
        { url: 'https://{source.domain.raw}/search/query?template=%2Fpublikationen%2Fspiegel%2Fresult.jsp&query.id=query-spiegel&query.key=gQynwrIS&query.commit=yes&query.scope=spiegel&query.index-order=personen&query.facets=yes&facet.path=%2Fspiegel&facet.activate=yes&hitlist.highlight=yes&hitlist.sort=-field%3Aisort&query.Titel={query}&query.Ausgabe={edition}&query.Ressort=&query.Signatur=&query.Person=&query.K%C3%B6rperschaft=&query.Ort=&query.Text={overline}' }
      ],
      [
        { click: '.gdprcookie-buttons button', optional: true },
        { extract: '.mitte-text' }
      ]
    ]
  },
  'new.genios.de': {
    loggedIn: '#header__login__buttons > button:nth-child(4)',
    start: 'https://{source.domain.raw}/',
    defaultParams: {
      domain: 'www.genios.de',
      scheme: 'https://'
    },
    login: [
      [
        { fill: { selector: '#ad_fo_el_1', key: 'options.username' } },
        { event: { selector: '#ad_fo_el_1', event: 'input' } },
        { fill: { selector: '#ad_fo_el_2', key: 'options.password' } },
        { event: { selector: '#ad_fo_el_2', event: 'input' } },
        { click: '#ad_fo_el_termsAndConditions' },
        { click: '#ad_fo_el_privacyPolicy' },
        { click: '#ad_fo_el_rememberMe' },
        { click: '#submit' }
      ]
    ],
    search: [
      [
        { message: 'Artikel wird gesucht...' },
        { url: '{source.scheme.raw}{source.domain.raw}/dosearch?explicitSearch=true&q={query}&dbShortcut={source.dbShortcut}&TI%2CUT%2CDZ%2CBT%2COT%2CSL=&AU=&KO=&MM%2COW%2CUF%2CMF%2CAO%2CTP%2CVM%2CNN%2CNJ%2CKV%2CZ2=&CT%2CDE%2CZ4%2CKW=&Z3%2CCN%2CCE%2CKC%2CTC%2CVC=&DT_from={dateStart}&DT_to={dateEnd}&timeFilterType=selected&timeFilter=NONE&x=59&y=11' }
      ],
      [
        { message: 'Artikel wird aufgerufen...' },
        { failOnMissing: '.boxHeader', failure: 'Artikel nicht gefunden' },
        { href: '.hitContent a' }
      ],
      [
        { captcha: '#layer_captcha' },
        { extract: '#content pre.text, .divDocument pre.textCompact', convert: 'preToParagraph' }
      ]
    ]
  },
  'genios.de': {
    loggedIn: '.boxMyGeniosLink',
    start: 'https://{source.domain.raw}/',
    defaultParams: {
      domain: 'www.genios.de'
    },
    login: [
      [
        { fill: { selector: '#bibLoginLayer_number', key: 'options.username' } },
        { fill: { selector: '#bibLoginLayer_password', key: 'options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    search: [
      [
        { message: 'Artikel wird gesucht...' },
        { url: 'https://{source.domain.raw}/dosearch?explicitSearch=true&q={query}&dbShortcut={source.dbShortcut}&TI%2CUT%2CDZ%2CBT%2COT%2CSL=&AU=&KO=&MM%2COW%2CUF%2CMF%2CAO%2CTP%2CVM%2CNN%2CNJ%2CKV%2CZ2=&CT%2CDE%2CZ4%2CKW=&Z3%2CCN%2CCE%2CKC%2CTC%2CVC=&DT_from={dateStart}&DT_to={dateEnd}&timeFilterType=selected&timeFilter=NONE&x=59&y=11' }
      ],
      [
        { message: 'Artikel wird aufgerufen...' },
        { failOnMissing: '.boxHeader', failure: 'Artikel nicht gefunden' },
        { href: '.hitContent a' }
      ],
      [
        { captcha: '#layer_captcha' },
        { extract: '.divDocument pre.text, .divDocument pre.textCompact', convert: 'preToParagraph' }
      ]
    ]
  },
  'www.nexisuni.com': {
    loggedIn: 'button[aria-label=\'Search\']',
    start: '{source.startUrl.raw}',
    defaultParams: {
    },
    login: [],
    search: [
      [
        { message: 'Artikel wird gesucht...' },
        { url: 'https://{source.domain.raw}/search/?pdqttype=and&earg=pdpsf&pdtimeline={dateStart}+to+{dateEnd}%7Cdatebetween&pdsearchterms={query}&pdquerytemplateid=urn%3Aquerytemplate%3A78338d18781c574d11af5fa2f7097c99~%5ENachrichten' }
      ],
      [
        { message: 'Artikel wird aufgerufen...' },
        { failOnMissing: '.doc-title', failure: 'Artikel nicht gefunden' },
        { click: '.doc-title a' }
      ],
      [
        { extract: '.doc-content > span p' }
      ]
    ]
  }
}

export default sources
