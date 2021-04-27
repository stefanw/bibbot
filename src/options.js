import { DEFAULT_PROVIDER } from './const.js'
import providers from './providers.js'

const defaults = {
  installDate: null,
  provider: DEFAULT_PROVIDER,
  keepStats: true,
  stats: {},
  providerOptions: {}
}

function showOptions () {
  const provider = document.getElementById('provider').value
  Array.from(document.getElementsByClassName('provider-options-container')).forEach(el => {
    el.hidden = 'hidden'
  })
  document.getElementById(provider + '.options').hidden = null
}

function restore () {
  browser.storage.sync.get(defaults).then(function (items) {
    document.getElementById('provider').value = items.provider
    document.getElementById('keepStats').checked = items.keepStats

    if (items.providerOptions) {
      for (const providerKey in providers) {
        const provider = providers[providerKey]
        for (const optionKey in provider.options) {
          const option = provider.options[optionKey]
          const input = document.getElementById(providerKey + '.options.' + option.id)
          input.value = items.providerOptions[providerKey + '.options.' + option.id] || ''
        }
      }
    }
    showOptions()

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
  const providerOptions = document.getElementById('provider-options')
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

    const optionsContainer = document.createElement('div')
    optionsContainer.classList = 'provider-options-container'
    optionsContainer.id = providerKey + '.options'
    optionsContainer.hidden = 'hidden'
    for (const optionKey in provider.options) {
      const option = provider.options[optionKey]

      const label = document.createElement('label')
      label.innerText = option.display
      const input = document.createElement('input')
      input.type = option.type
      input.name = providerKey + '.options.' + option.id
      input.id = providerKey + '.options.' + option.id

      optionsContainer.appendChild(label)
      optionsContainer.appendChild(input)
    }
    providerOptions.appendChild(optionsContainer)
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
  const provider = document.getElementById('provider').value
  const keepStats = document.getElementById('keepStats').checked

  const providerOptions = {}
  for (const providerKey in providers) {
    const provider = providers[providerKey]
    for (const optionKey in provider.options) {
      const option = provider.options[optionKey]
      const input = document.getElementById(providerKey + '.options.' + option.id)
      providerOptions[providerKey + '.options.' + option.id] = input.value
    }
  }

  const values = {
    keepStats: keepStats,
    provider: provider,
    providerOptions: providerOptions
  }
  if (!keepStats) {
    values.stats = {}
  }

  browser.storage.sync.set(values)
  checkPermissions(provider)
}

function checkPermissions (key) {
  const provider = providers[key]
  if (provider.permissions) {
    browser.permissions.getAll().then((permissions) => {
      const neededPermissions = []
      console.log(provider.permissions, permissions.origins)
      provider.permissions.forEach(p => {
        if (!permissions.origins.includes(p)) {
          neededPermissions.push(p)
        }
      })
      if (neededPermissions.length > 0) {
        browser.permissions.request({ origins: neededPermissions })
      }
    })
  }
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

document.getElementById('provider').addEventListener('change', showOptions)
document.addEventListener('DOMContentLoaded', restore)
