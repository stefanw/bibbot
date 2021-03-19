
export default {
  'voebb.de': {
    name: 'VÖBB - Verbund der öffenlichen Bibliotheken Berlins',
    web: 'https://voebb.de/',
    loginHint: 'Geben Sie den Nutzernamen (11 Ziffern) und Passwort von voebb.de ein.',
    login: [
      { message: 'VÖBB-Konto wird eingeloggt...' },
      { fill: { selector: 'input[name="L#AUSW"]', key: 'username' } },
      { fill: { selector: 'input[name="LPASSW"]', key: 'password' } },
      { click: 'input[name="LLOGIN"]' }
    ]
  }
}
