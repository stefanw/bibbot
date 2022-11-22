import * as browser from 'webextension-polyfill'

import { LOADER_HTML, BOT_ID, LOADER_ID, MESSAGE_ID, FAILED_HTML } from './ui.js'
import { FAILED_MESSAGE, INIT_MESSAGE, GOTOTAB_MESSAGE, STATUS_MESSAGE, SUCCES_MESSAGE, PORT_NAME } from './const.js'

import { addSharingButton } from './services.js'
import Extractor from './extractor.js'
import { Site, SiteBotInterface, Message, InitMessage, GoToTabMessage } from './types.js'

class SiteBot implements SiteBotInterface {
  site: Site
  root: HTMLElement
  domain: string | null
  extractor: Extractor
  port?: browser.Runtime.Port | null

  constructor (site: Site, root: HTMLElement, domain = null) {
    this.site = site
    this.root = root
    this.domain = domain
    this.extractor = new Extractor(site, root)

    this.onDisconnect = this.onDisconnect.bind(this)
    this.onMessage = this.onMessage.bind(this)
  }

  start (delay?: boolean | number) {
    if (typeof delay === 'number') {
      window.setTimeout(() => this.start(), delay)
      return
    }
    if (!this.extractor.hasPaywall()) {
      return
    }
    const articleInfo = this.startInfoExtraction()
    if (articleInfo) {
      this.startBackgroundConnection(articleInfo)
    }
  }

  startInfoExtraction () {
    if (!this.extractor.shouldExtract()) {
      return
    }

    this.showLoading()
    try {
      return this.extractor.extractArticleInfo()
    } catch (e) {
      console.error(e)
      this.showUpdate('Beim Extrahieren der Artikeldaten trat ein Fehler auf.')
      return null
    }
  }

  startBackgroundConnection (articleInfo) {
    this.connectPort()
    const message: InitMessage = {
      type: INIT_MESSAGE,
      source: this.site.source,
      sourceParams: this.site.sourceParams,
      domain: this.domain,
      articleInfo
    }
    this.postMessage(message)
  }

  runSelectorQuery (selector) {
    return this.extractor.runSelectorQuery(selector)
  }

  hidePaywall () {
    if (this.extractor.hasPaywall()) {
      this.extractor.getPaywall().style.display = 'none'
    }
  }

  showPaywall () {
    this.extractor.getPaywall().style.display = 'block'
  }

  showLoading () {
    const loadingArea = this.extractor.getLoadingArea()
    if (loadingArea !== null) {
      const div = document.createElement('div')
      div.innerHTML = LOADER_HTML
      loadingArea.parentNode.insertBefore(div, loadingArea.nextSibling)
    } else {
      const main = this.extractor.getMainContentArea()
      main.innerHTML = main.innerHTML + LOADER_HTML
    }
  }

  hideLoading () {
    const loader: HTMLElement = this.root.querySelector(`#${LOADER_ID}`)
    loader.style.display = 'none'
  }

  hideBot () {
    const bot: HTMLElement = this.root.querySelector(`#${BOT_ID}`)
    bot.style.display = 'none'
  }

  showUpdate (text) {
    const message: HTMLElement = this.root.querySelector(`#${MESSAGE_ID}`)
    message.innerText = text
  }

  showInteractionRequired () {
    this.hideLoading()
    const btnId = 'bibbot-goto'
    const html = `<button id="${btnId}">Bitte gehen Sie zum geöffneten Tab.</button>`
    this.root.querySelector(`#${MESSAGE_ID}`).innerHTML = html
    this.root.querySelector(`#${btnId}`).addEventListener('click', (e) => {
      e.preventDefault()
      const message: GoToTabMessage = {
        type: GOTOTAB_MESSAGE
      }
      this.postMessage(message)
    })
  }

  connectPort () {
    this.port = browser.runtime.connect({ name: PORT_NAME })
    this.port.onMessage.addListener(this.onMessage)
    this.port.onDisconnect.addListener(this.onDisconnect)
    return this.port
  }

  postMessage (message: Message) {
    this.port.postMessage(message)
  }

  onDisconnect () {
    this.port.onMessage.removeListener(this.onMessage)
    this.port.onDisconnect.removeListener(this.onDisconnect)
  }

  onMessage (event) {
    console.log(event)
    if (event.type === STATUS_MESSAGE) {
      if (event.action === 'interaction_required') {
        this.showInteractionRequired()
      } else if (event.message) {
        this.showUpdate(event.message)
      }
      return
    }

    this.hideLoading()

    if (event.type === FAILED_MESSAGE) {
      this.fail()
      return
    }
    if (event.type === SUCCES_MESSAGE) {
      this.showArticle(event.content, event.saveArticle)
      return
    }

    throw new Error('Unknown message type')
  }

  fail () {
    this.root.querySelector(`#${MESSAGE_ID}`).innerHTML = FAILED_HTML
    this.showPaywall()
  }

  showArticle (content, saveArticleUrl) {
    const main = this.extractor.getMainContentArea()
    content = content.join('')
    if (this.site.mimic) {
      if (typeof this.site.mimic === 'function') {
        content = this.site.mimic(content, main)
      } else {
        const mimic = this.root.querySelector(this.site.mimic)
        if (mimic !== null) {
          content = `<div class="${mimic.className}">${content}</div>`
        }
      }
    }
    if (this.site.paragraphStyle) {
      content = content.replace(/<p>/g, `<p class="${this.site.paragraphStyle.className || ''}" style="${this.site.paragraphStyle.style || ''}">`)
    }

    if (this.site.insertContent) {
      this.site.insertContent(this, main, content)
    } else {
      main.innerHTML = content
    }
    if (saveArticleUrl) {
      addSharingButton(main, content, saveArticleUrl)
    }
  }
}

export default SiteBot
