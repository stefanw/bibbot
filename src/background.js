import Reader from '../src/reader.js'

function openOptionsPage (details) {
  if (details.reason === 'install') {
    browser.runtime.openOptionsPage()
  }
}

browser.runtime.onInstalled.addListener(openOptionsPage)

function portConnected (port) {
  const reader = new Reader(port)
  reader.start()
}

browser.runtime.onConnect.addListener(portConnected)
