import { DEFAULT_PROVIDER } from './const.js'
import providers from './providers.js'

const defaults = {
  installDate: null,
  provider: DEFAULT_PROVIDER,
  username: '',
  password: '',
  keepStats: true,
  stats: {}
}

function restore () {
  browser.storage.sync.get(defaults).then(function (items) {
    document.getElementById('provider').value = items.provider
    document.getElementById('username').value = items.username
    document.getElementById('password').value = items.password
    document.getElementById('keepStats').checked = items.keepStats

    if (items.installDate === null) {
      // first run
      browser.storage.sync.set({
        installDate: new Date().getTime()
      })
      document.querySelector('#setup').setAttribute('open', true)
    }
  })

  const providerSelect = document.getElementById('provider')
  const providerList = document.getElementById('providers')
  for (const providerKey in providers) {
    const provider = providers[providerKey]
    const option = document.createElement('option')
    option.value = providerKey
    option.innerText = provider.name
    providerSelect.appendChild(option)

    const listItem = document.createElement('li')
    const listItemA = document.createElement('a')
    listItemA.href = provider.web
    listItemA.innerText = provider.name
    listItem.appendChild(listItemA)
    providerList.appendChild(listItem)
  }

  window.fetch('/manifest.json').then(response => response.json())
    .then(data => {
      const domains = data.content_scripts[0].matches.map(url => url.replace('https://', '').replace('/*', ''))
      const ul = document.getElementById('newssites')
      domains.forEach(domain => {
        const li = document.createElement('li')
        li.innerText = domain
        ul.appendChild(li)
      })
    })
}

function save () {
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  const keepStats = document.getElementById('keepStats').checked

  const values = {
    username: username,
    password: password,
    keepStats: keepStats
  }
  if (!keepStats) {
    values.stats = {}
  }

  browser.storage.sync.set(values)
}

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault()

  save()

  const savedNote = document.querySelector('#saved-note')
  savedNote.style.display = 'inline'
  savedNote.classList.remove('fade')
  // eslint-disable-next-line no-void
  void savedNote.offsetWidth // triggers reflow, restarts animation
  savedNote.classList.add('fade')
})

document.addEventListener('DOMContentLoaded', restore)
