import Reader from '../src/reader.js'
import update from './update.js'

function openOptionsPage (details) {
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

function portConnected (port) {
  const reader = new Reader(port)
  reader.start()
}

browser.runtime.onConnect.addListener(portConnected)
