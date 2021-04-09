const geniosDefaultData = [
  {
    id: 'www.stadtbibliothek-aschaffenburg.de',
    name: 'Stadtbibliothek Aschaffenburg',
    web: 'https://bib-aschaffenbg.genios.de',
    domain: 'bib-aschaffenbg.genios.de'
  },
  {
    id: 'www.lib.bonn.de',
    name: 'Stadtbibliothek Bonn',
    web: 'https://www.lib.bonn.de/',
    domain: 'bib-bonn.genios.de'
  },
  {
    id: 'www.braunschweig.de',
    name: 'Stadtbibliothek Braunschweig',
    web: 'https://www.braunschweig.de/kultur/bibliotheken_archive/stadtbibliothek/index.php',
    domain: 'bib-braunschweig.genios.de'
  },
  {
    id: 'www.stadtbibliothek-chemnitz.de',
    name: 'Stadtbibliothek Chemnitz',
    web: 'https://www.stadtbibliothek-chemnitz.de/',
    domain: 'bib-chemnitz.genios.de'
  },
  {
    id: 'bib-open-stadtbibliothek.darmstadt.de',
    name: 'Stadtbibliothek Darmstadt',
    web: 'https://www.darmstadt.de/leben-in-darmstadt/bildung/stadtbibliothek/',
    domain: 'bib-darmstadt.genios.de'
  },
  {
    id: 'www.erfurt.de',
    name: 'Stadt- und Regionalbibliothek Erfurt',
    web: 'https://www.erfurt.de/ef/de/leben/bildung/sturb/index.html',
    domain: 'bib-erfurt.genios.de'
  },
  {
    id: 'www.stadtbibliothek-essen.de',
    name: 'Stadtbibliothek Essen',
    web: 'https://www.stadtbibliothek-essen.de/sbbtke_startseite/startseite.de.html',
    domain: 'bib-essen.genios.de'
  },
  {
    id: 'stadtbibliothek.goeppingen.de',
    name: 'Stadtbibliothek Göppingen',
    web: 'https://stadtbibliothek.goeppingen.de/',
    domain: 'bib-goeppingen.genios.de'
  },
  {
    id: 'www.stadtbibliothek-halle.de',
    name: 'Stadtbibliothek Halle',
    web: 'https://www.stadtbibliothek-halle.de',
    domain: 'bib-halle.genios.de'
  },
  {
    id: 'bibliothek.hannover-stadt.de',
    name: 'Stadtbibliothek Hannover',
    web: 'https://bibliothek.hannover-stadt.de',
    domain: 'bib-hannover.genios.de'
  },
  {
    id: 'stadtbibliothek.heilbronn.de',
    name: 'Stadtbibliothek Heilbronn',
    web: 'https://stadtbibliothek.heilbronn.de/stadtbibliothek-heilbronn.html',
    domain: 'bib-heilbronn.genios.de'
  },
  {
    id: 'www.stadtbibliothek-jena.de',
    name: 'Ernst-Abbe-Bücherei Jena',
    web: 'https://www.stadtbibliothek-jena.de/',
    domain: 'bib-jena.genios.de'
  },
  {
    id: 'stabi.ludwigsburg.de',
    name: 'Stadtbibliothek Ludwigsburg',
    web: 'https://stabi.ludwigsburg.de/',
    domain: 'bib-ludwigsburg.genios.de'
  },
  {
    id: 'bibliothek.potsdam.de',
    name: 'Stadt- und Landesbibliothek Potsdam',
    web: 'https://bib-potsdam.genios.de',
    domain: 'bib-potsdam.genios.de'
  },
  {
    id: 'www.salzgitter.de',
    name: 'Stadtbibliothek Salzgitter',
    web: 'https://www.salzgitter.de/bildung/stabi/stadtbibliothek.php',
    domain: 'bib-salzgitter.genios.de'
  },
  {
    id: 'stuttgart.de',
    name: 'Stadtbibliothek Stuttgart',
    web: 'http://www1.stuttgart.de/stadtbibliothek/',
    domain: 'bib-stuttgart.genios.de'
  },
  {
    id: 'www.buecherhallen.de',
    name: 'Bücherhallen Hamburg',
    web: 'https://www.buecherhallen.de/',
    domain: 'buecherhallen.genios.de'
  }
]

function geniosFactory (provider) {
  return {
    name: provider.name,
    web: provider.web,
    loginHint: '',
    params: {
      'genios.de': {
        domain: provider.domain
      }
    },
    login: null,
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  }
}

const geniosDefaultProviders = {}
geniosDefaultData.forEach(d => {
  geniosDefaultProviders[d.id] = geniosFactory(d)
})

export default {
  ...geniosDefaultProviders,
  'voebb.de': {
    name: 'VÖBB - Verbund der öffenlichen Bibliotheken Berlins',
    web: 'https://voebb.de/',
    loginHint: 'Geben Sie den Nutzernamen (11 Ziffern) und Passwort von voebb.de ein.',
    params: {
      'www.munzinger.de': {
        portalId: '50158'
      },
      'genios.de': {
        domain: 'bib-voebb.genios.de'
      }
    },
    login: [
      [
        { message: 'VÖBB-Konto wird eingeloggt...' },
        { fill: { selector: 'input[name="L#AUSW"]', providerKey: 'voebb.de.options.username' } },
        { fill: { selector: 'input[name="LPASSW"]', providerKey: 'voebb.de.options.password' } },
        { click: 'input[name="LLOGIN"]' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'wiso-net.de': {
    name: 'WISO – Die Datenbank für Hochschulen',
    web: 'https://www.wiso-net.de/',
    params: {
      'genios.de': {
        domain: 'www.wiso-net.de'
      }
    },
    login: [
      [
        { message: 'WISO-Konto wird eingeloggt...' },
        { click: '#customLoginLink' },
        { fill: { selector: 'input[name="loginBlock.username"]', providerKey: 'wiso-net.de.options.username' } },
        { fill: { selector: 'input[name="loginBlock.password"]', providerKey: 'wiso-net.de.options.password' } },
        { click: '#loginBlock_c1' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'sso.wiso-net.de': {
    name: 'WISO – Die Datenbank für Hochschulen (SSO)',
    web: 'https://www.wiso-net.de/',
    params: {
      'genios.de': {
        domain: 'www.wiso-net.de'
      }
    },
    login: [
      [
        { message: 'WISO-Konto wird eingeloggt (SSO)...' },
        { fill: { selector: '#shibbolethForm_selectedCity', providerKey: 'sso.wiso-net.de.options.city' } },
        { event: { selector: '#shibbolethForm_selectedCity', event: 'change' } },
        { wait: 2000 },
        { fill: { selector: '#shibbolethForm_selectedName', providerKey: 'sso.wiso-net.de.options.name' } },
        { click: '#shibbolethForm_shLoginLink' }
      ]
    ],
    options: [
      { id: 'city', display: 'Stadt der Hochschule/Uni:', type: 'text' },
      { id: 'name', display: 'Name der Hochschule/Uni:', type: 'text' }
    ]
  }
}
