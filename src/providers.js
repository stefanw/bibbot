
export default {
  'bibliothek.potsdam.de': {
    name: 'Stadt- und Landesbibliothek im Bildungsforum Potsdam',
    web: 'https://bibliothek.potsdam.de/',
    loginHint: '',
    params: {
      'www.munzinger.de': {
        portalId: '50307'
      },
      'genios.de': {
        domain: 'bib-potsdam.genios.de'
      }
    },
    login: null,
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'bibliothek.erfurt.de': {
    name: 'Stadt- und Regionalbibliothek Erfurt',
    web: 'https://erfurt.de/bibliothek',
    loginHint: '',
    params: {
      'www.munzinger.de': {
        portalId: '57251'
      },
      'genios.de': {
        domain: 'bib-erfurt.genios.de'
      }
    },
    login: null,
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'buecherhallen.de': {
    name: 'Bücherhalle Hamburg',
    web: 'https://www.buecherhallen.de/',
    loginHint: '',
    params: {
      'www.munzinger.de': {
        portalId: '51440'
      },
      'genios.de': {
        domain: 'buecherhallen.genios.de'
      }
    },
    login: null,
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'mediathek-neckarsulm.de': {
    name: 'Mediathek Neckarsulm',
    web: 'https://www.mediathek-neckarsulm.de/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 79 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'mediathek-neckarsulm.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'mediathek-neckarsulm.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'balingen.bibliothek.komm.one': {
    name: 'Mediothek Balingen',
    web: 'https://bibliothek.komm.one/balingen/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 50 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'balingen.bibliothek.komm.one.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'balingen.bibliothek.komm.one.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbibliothek-aalen.de': {
    name: 'Stadtbibliothek Aalen',
    web: 'https://www.stadtbibliothek-aalen.de/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 41 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbibliothek-aalen.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbibliothek-aalen.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbibliothek.freiburg.de': {
    name: 'Stadtbibliothek Freiburg',
    web: 'https://www.stadtbibliothek.freiburg.de/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 80 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbibliothek.freiburg.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbibliothek.freiburg.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbibliothek.heilbronn.de': {
    name: 'Stadtbibliothek Heilbronn',
    web: 'https://stadtbibliothek.heilbronn.de/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 85 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbibliothek.heilbronn.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbibliothek.heilbronn.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stabi.ludwigsburg.de': {
    name: 'Stadtbibliothek Ludwigsburg',
    web: 'https://stabi.ludwigsburg.de/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 36 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stabi.ludwigsburg.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stabi.ludwigsburg.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbibliothek.offenburg.de': {
    name: 'Stadtbibliothek Offenburg',
    web: 'https://www.stadtbibliothek.offenburg.de/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 84 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbibliothek.offenburg.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbibliothek.offenburg.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbibliothek-reutlingen.de': {
    name: 'Stadtbibliothek Reutlingen',
    web: 'https://stadtbibliothek-reutlingen.de',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 44 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbibliothek-reutlingen.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbibliothek-reutlingen.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbibliothek.schwaebischhall.de': {
    name: 'Stadtbibliothek Schwäbisch Hall',
    web: 'https://www.schwaebischhall.de/de/bildung-betreuung/stadtbibliothek/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 86 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbibliothek.schwaebischhall.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbibliothek.schwaebischhall.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbuecherei.albstadt.de': {
    name: 'Stadtbücherei Albstadt',
    web: 'https://www.albstadt.de/stadtbuecherei',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 42 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbuecherei.albstadt.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbuecherei.albstadt.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'backnang.bibliothek.komm.one': {
    name: 'Stadtbücherei Backnang',
    web: 'https://bibliothek.komm.one/backnang/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 68 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'backnang.bibliothek.komm.one.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'backnang.bibliothek.komm.one.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'medienzentrum-biberach.de': {
    name: 'Stadtbücherei Biberach',
    web: 'https://www.medienzentrum-biberach.de/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 82 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'medienzentrum-biberach.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'medienzentrum-biberach.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbuecherei.fellbach.de': {
    name: 'Stadtbücherei Fellbach',
    web: 'https://www.fellbach.de/start/kultur/stadtbuecherei.html',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 66 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbuecherei.fellbach.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbuecherei.fellbach.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbuecherei-nuertingen.de': {
    name: 'Stadtbücherei Nürtingen',
    web: 'https://www.stadtbuecherei-nuertingen.de/startseite',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 78 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbuecherei-nuertingen.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbuecherei-nuertingen.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbuecherei.tuebingen.de': {
    name: 'Stadtbücherei Tübingen',
    web: 'https://www.tuebingen.de/stadtbuecherei/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 45 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbuecherei.tuebingen.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbuecherei.tuebingen.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
  'stadtbuecherei.waiblingen.de': {
    name: 'Stadtbücherei Waiblingen',
    web: 'https://stadtbuecherei.waiblingen.de/',
    loginHint: '',
    params: {
      'genios.de': {
        domain: 'bib-bawue.genios.de'
      }
    },
    login: [
      [
        { click: '#cookie-bar p a.cb-enable', optional: true },
        { fill: { selector: '#bibLoginLayer_externalAuthId', value: 46 } },
        { fill: { selector: '#bibLoginLayer_number',providerKey: 'stadtbuecherei.waiblingen.de.options.username' } },
        { fill: { selector: '#bibLoginLayer_password', providerKey: 'stadtbuecherei.waiblingen.de.options.password' } },
        { click: '#bibLoginLayer_terms' },
        { click: '#bibLoginLayer_gdpr' },
        { click: '#bibLoginLayer_c0' }
      ]
    ],
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' }
    ]
  },
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
