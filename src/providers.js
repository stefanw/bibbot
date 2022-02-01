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
  },
  {
    id: 'ebibo-dresden.de',
    name: 'Städtischen Bibliotheken Dresden eBibo',
    web: 'https://www.ebibo-dresden.de/',
    domain: 'sbdresden.genios.de'
  }
]

const geniosAssociationData = [
  {
    id: 'stadtbuecherei.waiblingen.de',
    name: 'Stadtbücherei Waiblingen',
    web: 'https://stadtbuecherei.waiblingen.de/',
    domain: 'bib-bawue.genios.de',
    bibId: '46'
  },
  {
    id: 'stadtbuecherei.tuebingen.de',
    name: 'Stadtbücherei Tübingen',
    web: 'https://www.tuebingen.de/stadtbuecherei/',
    domain: 'bib-bawue.genios.de',
    bibId: '45'
  },
  {
    id: 'stadtbuecherei-nuertingen.de',
    name: 'Stadtbücherei Nürtingen',
    web: 'https://www.stadtbuecherei-nuertingen.de/startseite',
    domain: 'bib-bawue.genios.de',
    bibId: '78'
  },
  {
    id: 'stadtbuecherei.fellbach.de',
    name: 'Stadtbücherei Fellbach',
    web: 'https://www.fellbach.de/start/kultur/stadtbuecherei.html',
    domain: 'nan',
    bibId: 'bib-bawue.genios.de'
  },
  {
    id: 'medienzentrum-biberach.de',
    name: 'Stadtbücherei Biberach',
    web: 'https://www.medienzentrum-biberach.de/',
    domain: 'bib-bawue.genios.de',
    bibId: '82'
  },
  {
    id: 'backnang.bibliothek.komm.one',
    name: 'Stadtbücherei Backnang',
    web: 'https://bibliothek.komm.one/backnang/',
    domain: 'bib-bawue.genios.de',
    bibId: '68'
  },
  {
    id: 'stadtbuecherei.albstadt.de',
    name: 'Stadtbücherei Albstadt',
    web: 'https://www.albstadt.de/stadtbuecherei',
    domain: 'bib-bawue.genios.de',
    bibId: '42'
  },
  {
    id: 'stadtbibliothek.schwaebischhall.de',
    name: 'Stadtbibliothek Schwäbisch Hall',
    web: 'https://www.schwaebischhall.de/de/bildung-betreuung/stadtbibliothek/',
    domain: 'bib-bawue.genios.de',
    bibId: '86'
  },
  {
    id: 'stadtbibliothek-reutlingen.de',
    name: 'Stadtbibliothek Reutlingen',
    web: 'https://stadtbibliothek-reutlingen.de',
    domain: 'bib-bawue.genios.de',
    bibId: '44'
  },
  {
    id: 'stadtbibliothek.offenburg.de',
    name: 'Stadtbibliothek Offenburg',
    web: 'https://www.stadtbibliothek.offenburg.de/',
    domain: 'bib-bawue.genios.de',
    bibId: '84'
  },
  {
    id: 'stabi.ludwigsburg.de',
    name: 'Stadtbibliothek Ludwigsburg',
    web: 'https://stabi.ludwigsburg.de/',
    domain: 'bib-bawue.genios.de',
    bibId: '36'
  },
  {
    id: 'stadtbibliothek.heilbronn.de',
    name: 'Stadtbibliothek Heilbronn',
    web: 'https://stadtbibliothek.heilbronn.de/',
    domain: 'bib-bawue.genios.de',
    bibId: '85'
  },
  {
    id: 'stadtbibliothek.freiburg.de',
    name: 'Stadtbibliothek Freiburg',
    web: 'https://www.stadtbibliothek.freiburg.de/',
    domain: 'bib-bawue.genios.de',
    bibId: '80'
  },
  {
    id: 'stadtbibliothek-aalen.de',
    name: 'Stadtbibliothek Aalen',
    web: 'https://www.stadtbibliothek-aalen.de/',
    domain: 'bib-bawue.genios.de',
    bibId: '41'
  },
  {
    id: 'balingen.bibliothek.komm.one',
    name: 'Mediothek Balingen',
    web: 'https://bibliothek.komm.one/balingen/',
    domain: 'bib-bawue.genios.de',
    bibId: '50'
  },
  {
    id: 'mediathek-neckarsulm.de',
    name: 'Mediathek Neckarsulm',
    web: 'https://www.mediathek-neckarsulm.de/',
    domain: 'bib-bawue.genios.de',
    bibId: '79'
  },
  {
    id: 'stadtbibliothek-bautzen.de',
    name: 'Stadtbibliothek Bautzen',
    web: 'https://www.stadtbibliothek-bautzen.de/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '20'
  },
  {
    id: 'bibliothek.bischofswerda.de',
    name: 'Stadtbibliothek Bischofswerda',
    web: 'http://www.bischofswerda.de/kultur-freizeit-und-tourismus/bibliothek.html',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '9'
  },
  {
    id: 'bibliothek.ebersbach-neugersdorf.de',
    name: 'Stadtbibliothek Ebersbach-Neugersdorf',
    web: 'https://bibliothek.ebersbach-neugersdorf.de/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '19'
  },
  {
    id: 'stadtbibliothek.goerlitz.de',
    name: 'Stadtbibliothek Görlitz',
    web: 'https://www.stadtbibliothek.goerlitz.de/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '18'
  },
  {
    id: 'bibliothek-hy.de',
    name: 'Brigitte-Reimann-Stadtbibliothek Hoyerswerda',
    web: 'https://bibliothek-hy.de/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '17'
  },
  {
    id: 'kamenz.bibliotheca-open.de',
    name: 'Stadtbibliothek Kamenz',
    web: 'https://kamenz.bibliotheca-open.de/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '16'
  },
  {
    id: 'bibliothek-loebau.de',
    name: 'Stadtbibliothek Löbau',
    web: 'https://bibliothek-loebau.de/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '15'
  },
  {
    id: 'bibliothek-niesky.de',
    name: 'Stadtbibliothek Niesky',
    web: 'https://www.bibliothek-niesky.de/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '14'
  },
  {
    id: 'sb-radeberg.lmscloud.net',
    name: 'Stadtbibliothek Radeberg',
    web: 'https://sb-radeberg.lmscloud.net/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '13'
  },
  {
    id: 'stadtbibliothek-weisswasser.de',
    name: 'Stadtbibliothek Weißwasser',
    web: 'http://www.stadtbibliothek-weisswasser.de/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '12'
  },
  {
    id: 'christian-weise-bibliothek-zittau.de',
    name: 'Christian-Weise-Bibliothek Zittau',
    web: 'https://christian-weise-bibliothek-zittau.de/',
    domain: 'bib-oberlausitz.genios.de',
    bibId: '11'
  }
]

const oclcData = [
  {
    id: 'bibliothek.hannover-stadt.de',
    name: 'Stadtbibliothek Hannover',
    web: 'https://bibliothek.hannover-stadt.de',
    oclcId: 'stbhannover',
    'genios.de': {
      subdomain: 'bib-hannover-genios-de'
    },
    'www.munzinger.de': {
      subdomain: 'www-munzinger-de',
      portalId: 51488 // not used in original requests, obtained from logo: https://www.munzinger.de/logos/51488.gif
    }
  }
]

const hanData = [
  {
    id: 'landesbibliothek.at',
    name: 'OÖ Landesbibliothek',
    web: 'https://www.landesbibliothek.at',
    hanserver: 'han.landesbibliothek.at',
    'genios.de': {
      hanid: 'wisonet',
      domain: 'www.wiso-net.de'
    }
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

function geniosAssociationFactory (provider) {
  return {
    name: provider.name,
    web: provider.web,
    loginHint: '',
    params: {
      'genios.de': {
        domain: provider.domain
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: provider.bibId } },
        { fill: { selector: '#bibLoginLayer_number', providerKey: provider.id + '.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: provider.id + '.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  }
}

function oclcFactory (provider) {
  return {
    name: provider.name,
    web: provider.web,
    loginHint: '',
    params: {
      ...(provider['genios.de']) && {
        'genios.de': {
          domain: `${provider['genios.de'].subdomain}.${provider.oclcId}.idm.oclc.org`
        }
      },
      ...(provider['www.munzinger.de']) && {
        'www.munzinger.de': {
          ...(provider['www.munzinger.de'].portalId) && {
            portalId: provider['www.munzinger.de'].portalId
          },
          ...(provider['www.munzinger.de'].subdomain) && {
            domain: `${provider['www.munzinger.de'].subdomain}.${provider.oclcId}.idm.oclc.org`
          }
        }
      }
    },
    login: [
      [
        { fill: { selector: 'input[name="user"]', providerKey: provider.id + '.options.username' } },
        { fill: { selector: 'input[name="pass"]', providerKey: provider.id + '.options.password' } },
        { click: 'input[type="submit"]' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ],
    permissions: [`https://*.${provider.oclcId}.idm.oclc.org/*`]
  }
}

function hanFactory (provider) {
  return {
    name: provider.name,
    web: provider.web,
    loginHint: '',
    params: {
      ...(provider['genios.de']) && {
        'genios.de': {
          domain: `${provider.hanserver}/han/${provider['genios.de'].hanid}/${provider['genios.de'].domain}`
        }
      }
    },
    login: [
      [
        { fill: { selector: 'input[name="plainuser"]', providerKey: provider.id + '.options.username' } },
        { fill: { selector: 'input[name="password"]', providerKey: provider.id + '.options.password' } },
        { click: 'button[type="submit"]' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ],
    permissions: [`https://*.${provider.hanserver}/*`]
  }
}

const geniosDefaultProviders = {}
geniosDefaultData.forEach(d => {
  geniosDefaultProviders[d.id] = geniosFactory(d)
})

const geniosAssociationProviders = {}
geniosAssociationData.forEach(d => {
  geniosDefaultProviders[d.id] = geniosAssociationFactory(d)
})

const oclcProviders = {}
oclcData.forEach(d => {
  oclcProviders[d.id] = oclcFactory(d)
})

const hanProviders = {}
hanData.forEach(d => {
  hanProviders[d.id] = hanFactory(d)
})

export default {
  ...geniosDefaultProviders,
  ...geniosAssociationProviders,
  ...oclcProviders,
  ...hanProviders,
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
    ],
    permissions: ['https://www.voebb.de/*']
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
    ],
    permissions: ['https://www.wiso-net.de/*']
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
    ],
    permissions: ['https://www.wiso-net.de/*']
  }
}
