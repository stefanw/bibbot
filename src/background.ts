import * as browser from 'webextension-polyfill'

import Reader from './reader.js'
import update from './update.js'

function openOptionsPage (details: browser.Runtime.OnInstalledDetailsType) {
  if (details.reason === 'install') {
    browser.runtime.openOptionsPage()
  } else if (details.reason === 'update' && details.previousVersion) {
    console.log('Extension was updated, running update scripts...')
    update.run_update(
      browser.runtime.getManifest().version,
      details.previousVersion
    )
  }
}

browser.runtime.onInstalled.addListener(openOptionsPage)

function portConnected (port: browser.Runtime.Port) {
  const reader = new Reader(port)
  reader.start()
}

browser.runtime.onConnect.addListener(portConnected)
