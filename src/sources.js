export default {
  'www.munzinger.de': {
    loggedIn: ".metanav-a[href='/search/logout']",
    start: 'https://www.munzinger.de/search/go/spiegel/aktuell.jsp?portalid={provider.portalId}',
    login: [
      [
        { click: '#redirect' }
      ],
      { provider: 'login' },
      [
        { click: 'input[name="CLOGIN"]' }
      ]
    ],
    search: [
      [
        { message: 'Suche wird durchgeführt...' },
        { url: 'https://www.munzinger.de/search/query?template=%2Fpublikationen%2Fspiegel%2Fresult.jsp&query.id=query-spiegel&query.key=gQynwrIS&query.commit=yes&query.scope=spiegel&query.index-order=personen&query.facets=yes&facet.path=%2Fspiegel&facet.activate=yes&hitlist.highlight=yes&hitlist.sort=-field%3Aisort&query.Titel={query}&query.Ausgabe={edition}&query.Ressort=&query.Signatur=&query.Person=&query.K%C3%B6rperschaft=&query.Ort=&query.Text={overline}' }
      ],
      [
        { click: '.gdprcookie-buttons button', optional: true },
        { extract: '.mitte-text' }
      ]
    ]
  },
  'genios.de': {
    loggedIn: ".boxLogin a[href='/openIdConnectClient/logout']",
    start: 'https://{provider.domain}/',
    defaultParams: {
      domain: 'www.genios.de'
    },
    login: [
      { provider: 'login' }
    ],
    search: [
      [
        { message: 'Suche wird durchgeführt...' },
        { url: 'https://{provider.domain}/dosearch?explicitSearch=true&q={query}&dbShortcut={site.dbShortcut}&TI%2CUT%2CDZ%2CBT%2COT%2CSL=&AU=&KO=&MM%2COW%2CUF%2CMF%2CAO%2CTP%2CVM%2CNN%2CNJ%2CKV%2CZ2=&CT%2CDE%2CZ4%2CKW=&Z3%2CCN%2CCE%2CKC%2CTC%2CVC=&DT_from=&DT_to=&timeFilterType=selected&timeFilter=NONE&x=59&y=11' }
      ],
      [
        { message: 'Artikel wird aufgerufen...' },
        { failOnMissing: '.boxHeader', failure: 'Artikel nicht gefunden' },
        { click: '.boxHeader' }
      ],
      [
        { extract: '.divDocument pre.text', convert: 'preToParagraph' }
      ]
    ]
  }
}
