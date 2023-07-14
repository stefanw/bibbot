import * as browser from 'webextension-polyfill'

import { DEFAULT_PROVIDER } from './const.js'
import providers from './providers.js'

import { StorageItems } from './types.js'

type InputOptions = {
  provider?: HTMLInputElement
  keepStats?: HTMLInputElement
  saveArticle?: HTMLInputElement
}

const defaults: StorageItems = {
  installDate: null,
  provider: DEFAULT_PROVIDER,
  keepStats: true,
  stats: {},
  providerOptions: {},
  saveArticle: null
}

let currentPermissions = null

function showOptions () {
  const provider = (<HTMLInputElement>document.getElementById('provider')).value;
  (<HTMLElement[]>[...document.getElementsByClassName('provider-options-container')]).forEach(el => {
    el.hidden = true
  })
  document.getElementById(provider + '.options').hidden = null
}

function getInputs () {
  const inputs: InputOptions = {};
  ['provider', 'keepStats', 'saveArticle'].forEach(id => {
    inputs[id] = <HTMLInputElement>document.getElementById(id)
  })
  return inputs
}

function restore () {
  browser.storage.sync.get(defaults).then(function (items) {
    const inputs = getInputs()
    inputs.provider.value = items.provider
    inputs.keepStats.checked = items.keepStats
    inputs.saveArticle.value = items.saveArticle || ''

    if (items.providerOptions) {
      for (const providerKey in providers) {
        const provider = providers[providerKey]
        for (const optionKey in provider.options) {
          const option = provider.options[optionKey]
          const input = <HTMLInputElement>document.getElementById(providerKey + '.options.' + option.id)
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
      document.querySelector('#setup').setAttribute('open', 'true')
    }
  })

  const sortedProviders = []
  for (const providerKey in providers) {
    sortedProviders.push({ key: providerKey, name: providers[providerKey].name })
  }
  sortedProviders.sort((a, b) => a.name.localeCompare(b.name))

  const providerSelect = document.getElementById('provider')
  const providerList = document.getElementById('providers')
  const providerOptions = document.getElementById('provider-options')
  for (const sortedProvider of sortedProviders) {
    const providerKey = sortedProvider.key
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

    const optionsContainer = document.createElement('div') as HTMLElement
    optionsContainer.classList.add('provider-options-container')
    optionsContainer.id = providerKey + '.options'
    optionsContainer.hidden = true
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

  Array.from(document.querySelector('form').querySelectorAll('input, select')).forEach(el => {
    el.addEventListener('change', () => save())
    el.addEventListener('keyup', () => save())
  })

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

  checkPermissions()

}

function save () {
  const providerOptions = {}
  for (const providerKey in providers) {
    const provider = providers[providerKey]
    for (const optionKey in provider.options) {
      const option = provider.options[optionKey]
      const input = <HTMLInputElement>document.getElementById(providerKey + '.options.' + option.id)
      providerOptions[providerKey + '.options.' + option.id] = input.value
    }
  }
  const inputs = getInputs()
  const provider = inputs.provider.value
  const values: StorageItems = {
    keepStats: inputs.keepStats.checked,
    provider,
    providerOptions,
    saveArticle: inputs.saveArticle.value
  }
  if (!values.keepStats) {
    values.stats = {}
  }

  browser.storage.sync.set(values)
  requestPermissions(providers[provider].permissions)
  console.log('saved!')
}

function getPermissions () {
  browser.permissions.getAll().then((permissions) => {
    currentPermissions = permissions
    return permissions
  })
}

function checkPermissions () {
  const provider = inputs.provider.value
  const neededPermissions = getNeededPermissions(providers[provider].permissions)
}

function getNeededPermissions (providerPermissions: string[]): string[] {
  const neededPermissions = []
  console.log(providerPermissions, currentPermissions.origins)
  providerPermissions.forEach(p => {
    if (!currentPermissions.origins.includes(p)) {
      neededPermissions.push(p)
    }
  })
  return neededPermissions
}

function requestPermissions (providerPermissions) {
  if (!providerPermissions) {
    return
  }
  const neededPermissions = getNeededPermissions(providerPermissions)
  if (neededPermissions.length > 0) {
    browser.permissions.request({ origins: neededPermissions }).then(() => {
      getPermissions()
    })
  }
}

document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault()
  save()
})

document.getElementById('provider').addEventListener('change', showOptions)
document.addEventListener('DOMContentLoaded', restore)
document.getElementById('version').innerText = 'v' + browser.runtime.getManifest().version
