import { increaseStats } from './stats.js'
import { INIT_MESSAGE, SUCCES_MESSAGE, FAILED_MESSAGE, STATUS_MESSAGE, DEFAULT_PROVIDER } from './const.js'
import SourceBot from './sourcebot.js'

const storageItems = {}

function retrieveStorage () {
  const defaults = {
    username: '',
    password: '',
    keepStats: true,
    provider: DEFAULT_PROVIDER
  }
  browser.storage.sync.get(defaults).then(function (items) {
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
    retrieveStorage()
    this.port.onMessage.addListener(this.onMessage)
    this.port.onDisconnect.addListener(this.onDisconnect)
  }

  onMessage (message) {
    if (message.type === INIT_MESSAGE) {
      this.setupArticle(message)
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

  setupArticle (message) {
    this.sourceId = message.source
    this.domain = message.domain
    this.sourceBot = new SourceBot(
      message.source,
      storageItems.provider,
      message.sourceParams,
      message.articleInfo,
      storageItems,
      this.botCallback
    )
    this.sourceBot.run()
  }

  botCallback ({ type, message }) {
    if (type === STATUS_MESSAGE) {
      this.sendStatusMessage(message)
    } else if (type === FAILED_MESSAGE) {
      this.fail(message)
    } else if (type === SUCCES_MESSAGE) {
      this.success(message)
    } else {
      this.cleanUp()
      throw new Error('Unknown type')
    }
  }

  sendStatusMessage (text) {
    this.postMessage({
      type: STATUS_MESSAGE,
      text: text
    })
  }

  success (text) {
    if (storageItems.keepStats) {
      increaseStats(this.domain)
    }
    this.postMessage({
      type: SUCCES_MESSAGE,
      content: text
    })
  }

  fail (message) {
    this.postMessage({
      type: FAILED_MESSAGE,
      content: message
    })
    this.cleanUp()
  }

  cleanUp () {
    this.port.onMessage.removeListener(this.onMessage)
    this.port.onDisconnect.removeListener(this.onDisconnect)
  }
}

export default Reader
