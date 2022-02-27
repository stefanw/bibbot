import { increaseStats } from './stats.js'
import { INIT_MESSAGE, GOTOTAB_MESSAGE, SUCCES_MESSAGE, FAILED_MESSAGE, STATUS_MESSAGE, DEFAULT_PROVIDER } from './const.js'
import SourceBot from './sourcebot.js'

const storageItems = {}

function retrieveStorage () {
  const defaults = {
    keepStats: true,
    provider: DEFAULT_PROVIDER,
    providerOptions: {},
    saveArticle: null
  }
  return browser.storage.sync.get(defaults).then(function (items) {
    for (const key in items) {
      storageItems[key] = items[key]
    }
  })
}

class Reader {
  constructor (port) {
    this.port = port

    this.senderTabId = null
    if (port.sender && port.sender.tab) {
      this.senderTabId = port.sender.tab.id
    }
    this.onMessage = this.onMessage.bind(this)
    this.onDisconnect = this.onDisconnect.bind(this)
    this.botCallback = this.botCallback.bind(this)
  }

  start () {
    this.storageUpdated = retrieveStorage()
    this.port.onMessage.addListener(this.onMessage)
    this.port.onDisconnect.addListener(this.onDisconnect)
  }

  onMessage (message) {
    if (message.type === INIT_MESSAGE) {
      this.storageUpdated.then(() => {
        this.retrieveArticle(message)
      })
    } else if (message.type === GOTOTAB_MESSAGE) {
      if (this.sourceBot) {
        this.sourceBot.activateTab()
      }
    }
  }

  onDisconnect () {
    this.cleanUp()
  }

  postMessage (message) {
    try {
      this.port.postMessage(message)
    } catch (e) {
      console.error(e)
      this.cleanUp()
    }
  }

  retrieveArticle (message) {
    this.sourceId = message.source
    this.domain = message.domain
    this.sourceBot = new SourceBot(
      message.source,
      storageItems.provider,
      storageItems.providerOptions,
      message.sourceParams,
      message.articleInfo,
      this.botCallback
    )
    this.sourceBot.run()
  }

  botCallback (event) {
    if (event.type === STATUS_MESSAGE) {
      this.sendStatusMessage(event)
    } else if (event.type === FAILED_MESSAGE) {
      this.fail(event)
    } else if (event.type === SUCCES_MESSAGE) {
      this.success(event)
    } else {
      this.cleanUp()
      throw new Error('Unknown type')
    }
  }

  sendStatusMessage (event) {
    this.postMessage(event)
  }

  success (event) {
    if (storageItems.keepStats) {
      increaseStats(this.domain)
    }
    this.postMessage({
      type: SUCCES_MESSAGE,
      content: event.message,
      saveArticle: storageItems.saveArticle
    })
  }

  fail (event) {
    this.postMessage({
      type: FAILED_MESSAGE,
      content: event.message
    })
    this.cleanUp()
  }

  cleanUp () {
    this.port.onMessage.removeListener(this.onMessage)
    this.port.onDisconnect.removeListener(this.onDisconnect)
  }
}

export default Reader
