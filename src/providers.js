
export default {
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
      { message: 'VÖBB-Konto wird eingeloggt...' },
      { fill: { selector: 'input[name="L#AUSW"]', providerKey: 'voebb.de.options.username' } },
      { fill: { selector: 'input[name="LPASSW"]', providerKey: 'voebb.de.options.password' } },
      { click: 'input[name="LLOGIN"]' }
    ],
    options: [
      { id: 'username', display: "Nutzername:", type: 'text'},
      { id: 'password', display: "Passwort:", type: 'password'},
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
      { message: 'WISO-Konto wird eingeloggt...' },
      { click: '#customLoginLink' },
      { fill: { selector: 'input[name="loginBlock.username"]', providerKey: 'wiso-net.de.options.username' } },
      { fill: { selector: 'input[name="loginBlock.password"]', providerKey: 'wiso-net.de.options.password' } },
      { click: '#loginBlock_c1' }
    ],
    options: [
      { id: 'username', display: "Nutzername:", type: 'text'},
      { id: 'password', display: "Passwort:", type: 'password'},
    ]
  }
}
