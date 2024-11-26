import * as browser from 'webextension-polyfill'

import { storageDefaults } from './const.js'
import providers from './providers.js'
import sites from './sites.js'
import { StorageItems } from './types.js'

type InputOptions = {
  provider?: HTMLInputElement
  keepStats?: HTMLInputElement
  saveArticle?: HTMLInputElement
  disableSites?: HTMLSelectElement
}

let currentPermissions: browser.Permissions.AnyPermissions | null = null

function showOptions() {
  const provider = (<HTMLInputElement>document.getElementById('provider')).value
  ;(<HTMLElement[]>[
    ...document.getElementsByClassName('provider-options-container'),
  ]).forEach((el) => {
    el.hidden = true
  })
  document.getElementById(provider + '.options').hidden = null
  checkPermissions()
}

function getInputs() {
  const inputs: InputOptions = {}
  ;['provider', 'keepStats', 'saveArticle', 'disableSites'].forEach((id) => {
    inputs[id] = <HTMLInputElement | HTMLSelectElement>(
      document.getElementById(id)
    )
  })
  return inputs
}

function restore() {
  browser.storage.sync.get(storageDefaults).then(function (items) {
    const inputs = getInputs()
    inputs.provider.value = items.provider
    inputs.keepStats.checked = items.keepStats
    inputs.saveArticle.value = items.saveArticle || ''

    if (items.providerOptions) {
      for (const providerKey in providers) {
        const provider = providers[providerKey]
        for (const optionKey in provider.options) {
          const option = provider.options[optionKey]
          const input = <HTMLInputElement>(
            document.getElementById(providerKey + '.options.' + option.id)
          )
          input.value =
            items.providerOptions[providerKey + '.options.' + option.id] || ''
        }
      }
    }
    showOptions()

    // disableSites
    Object.keys(sites)
      .sort()
      .forEach((domain) => {
        inputs.disableSites.appendChild(
          new Option(
            domain,
            domain,
            false,
            items.disabledSites.includes(domain),
          ),
        )
      })

    if (items.installDate === null) {
      // first run
      browser.storage.sync.set({
        installDate: new Date().getTime(),
      })
      document.querySelector('#setup').setAttribute('open', 'true')
    }
  })

  const sortedProviders = []
  for (const providerKey in providers) {
    sortedProviders.push({
      key: providerKey,
      name: providers[providerKey].name,
    })
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

  Array.from(
    document.querySelector('form').querySelectorAll('input, select'),
  ).forEach((el) => {
    el.addEventListener('change', () => save())
    el.addEventListener('keyup', () => save())
  })

  window
    .fetch('/manifest.json')
    .then((response) => response.json())
    .then((data) => {
      const domains = data.content_scripts[0].matches.map((url) =>
        url.replace('https://', '').replace('/*', ''),
      )
      const ul = document.getElementById('newssites')
      domains.forEach((domain) => {
        const li = document.createElement('li')
        li.innerText = domain
        ul.appendChild(li)
      })
    })

  checkPermissions()
}

function save() {
  const providerOptions = {}
  for (const providerKey in providers) {
    const provider = providers[providerKey]
    for (const optionKey in provider.options) {
      const option = provider.options[optionKey]
      const input = <HTMLInputElement>(
        document.getElementById(providerKey + '.options.' + option.id)
      )
      providerOptions[providerKey + '.options.' + option.id] = input.value
    }
  }
  const inputs = getInputs()
  const provider = inputs.provider.value

  const disabledSites = Array.from(inputs.disableSites.selectedOptions).map(
    ({ value }) => value,
  )
  const values: StorageItems = {
    keepStats: inputs.keepStats.checked,
    provider,
    providerOptions,
    saveArticle: inputs.saveArticle.value,
    disabledSites,
  }
  if (!values.keepStats) {
    values.stats = {}
  }

  browser.storage.sync.set(values)
  requestPermissions(providers[provider].permissions)
  console.log('saved!')
}

async function getPermissions(
  refresh = false,
): Promise<browser.Permissions.AnyPermissions> {
  if (currentPermissions !== null && !refresh) {
    return Promise.resolve(currentPermissions)
  }
  return browser.permissions.getAll().then((permissions) => {
    currentPermissions = permissions
    return permissions
  })
}

async function checkPermissions(): Promise<boolean> {
  const inputs = getInputs()
  const provider = inputs.provider.value
  const neededPermissions = await getNeededPermissions(
    providers[provider].permissions,
  )
  console.log('Missing permissions', neededPermissions)
  const needed = neededPermissions.length > 0
  if (needed) {
    document.getElementById('refresh-permissions').hidden = null
  } else {
    document.getElementById('refresh-permissions').hidden = true
  }
  return needed
}

async function getNeededPermissions(
  providerPermissions: string[] | undefined,
): Promise<string[]> {
  if (!providerPermissions) {
    return []
  }
  const neededPermissions = []
  const permissions = await getPermissions()
  console.log(providerPermissions, permissions.origins)
  providerPermissions.forEach((p) => {
    if (!permissions.origins.includes(p)) {
      neededPermissions.push(p)
    }
  })
  return neededPermissions
}

async function requestNeededPermissions() {
  const inputs = getInputs()
  const provider = inputs.provider.value
  await requestPermissions(providers[provider].permissions)
}

async function requestPermissions(providerPermissions) {
  if (!providerPermissions) {
    return
  }
  const neededPermissions = await getNeededPermissions(providerPermissions)
  if (neededPermissions.length > 0) {
    const granted = await browser.permissions.request({
      origins: neededPermissions,
    })
    console.log('Permissions granted?', granted)
    await getPermissions(true)
    await checkPermissions()
    return true
  }
  return Promise.resolve(false)
}

document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault()
  save()
})

document.getElementById('provider').addEventListener('change', showOptions)
document.addEventListener('DOMContentLoaded', restore)
document.getElementById('version').innerText =
  'v' + browser.runtime.getManifest().version
document
  .getElementById('refresh-permissions-button')
  .addEventListener('click', requestNeededPermissions)
