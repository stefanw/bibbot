import * as browser from 'webextension-polyfill'

import {
  ABORT_MESSAGE,
  FAILED_MESSAGE,
  GOTOTAB_MESSAGE,
  INIT_MESSAGE,
  LOG_NAME,
  PORT_NAME,
  STATUS_MESSAGE,
  SUCCESS_MESSAGE,
} from './const.js'
import {
  BOT_ID,
  FAILED_HTML,
  LOADER_HTML,
  LOADER_ID,
  MESSAGE_ID,
  STYLES,
} from './ui.js'

import Extractor from './extractor.js'
import { addSharingButton } from './services.js'
import {
  GoToTabMessage,
  InitMessage,
  Message,
  Site,
  SiteBotInterface,
} from './types.js'

class SiteBot implements SiteBotInterface {
  site: Site
  root: HTMLElement
  domain: string | null
  shadow: ShadowRoot | null
  container: HTMLElement | null
  extractor: Extractor
  port?: browser.Runtime.Port | null

  constructor(site: Site, root: HTMLElement, domain = null) {
    this.site = site
    this.root = root
    this.domain = domain
    this.extractor = new Extractor(site, root, this)
    this.shadow = null
    this.container = null

    this.onDisconnect = this.onDisconnect.bind(this)
    this.onMessage = this.onMessage.bind(this)
  }

  start(delay?: boolean | number) {
    if (typeof delay === 'number') {
      window.setTimeout(() => this.start(), delay)
      return
    }
    if (!this.extractor.hasPaywall()) {
      return
    }
    const articleInfo = this.startInfoExtraction()
    console.log(LOG_NAME, 'ArticleInfo', articleInfo)
    if (articleInfo) {
      this.startBackgroundConnection(articleInfo)
    }
  }

  setupUI() {
    if (this.shadow) {
      return
    }
    let loadingArea = this.extractor.getLoadingArea()
    if (loadingArea === null) {
      loadingArea = this.extractor.getMainContentArea()
    }
    const shadowHost = document.createElement('div')

    loadingArea.parentNode.insertBefore(shadowHost, loadingArea.nextSibling)

    this.shadow = shadowHost.attachShadow({ mode: 'open' })
    this.shadow.innerHTML = STYLES
    this.container = document.createElement('div')
    this.shadow.appendChild(this.container)
  }

  startInfoExtraction() {
    if (!this.extractor.shouldExtract()) {
      return
    }
    this.setupUI()
    this.showLoading()
    try {
      return this.extractor.extractArticleInfo()
    } catch (e) {
      console.error(LOG_NAME, e)
      this.showUpdate('Beim Extrahieren der Artikeldaten trat ein Fehler auf.')
      return null
    }
  }

  startBackgroundConnection(articleInfo) {
    this.connectPort()
    const message: InitMessage = {
      type: INIT_MESSAGE,
      source: this.site.source,
      sourceParams: this.site.sourceParams,
      domain: this.domain,
      articleInfo,
    }
    this.postMessage(message)
  }

  runSelectorQuery(selector) {
    return this.extractor.runSelectorQuery(selector)
  }

  hidePaywall() {
    if (this.extractor.hasPaywall()) {
      this.extractor.getPaywall().style.display = 'none'
    }
  }

  showPaywall() {
    this.extractor.getPaywall().style.display = 'block'
  }

  showLoading() {
    this.container.innerHTML = LOADER_HTML
  }

  hideLoading() {
    const loader: HTMLElement = this.shadow.querySelector(`#${LOADER_ID}`)
    loader.style.display = 'none'
  }

  hideBot() {
    const bot: HTMLElement = this.shadow.querySelector(`#${BOT_ID}`)
    bot.style.display = 'none'
  }

  showUpdate(text) {
    const message: HTMLElement = this.shadow.querySelector(`#${MESSAGE_ID}`)
    message.innerText = text
  }

  showInteractionRequired() {
    this.hideLoading()
    const btnId = 'bibbot-goto'
    const html = `<button id="${btnId}">Bitte gehen Sie zum geöffneten Tab.</button>`
    this.shadow.querySelector(`#${MESSAGE_ID}`).innerHTML = html
    this.shadow.querySelector(`#${btnId}`).addEventListener('click', (e) => {
      e.preventDefault()
      const message: GoToTabMessage = {
        type: GOTOTAB_MESSAGE,
      }
      this.postMessage(message)
    })
  }

  connectPort() {
    this.port = browser.runtime.connect({ name: PORT_NAME })
    this.port.onMessage.addListener(this.onMessage)
    this.port.onDisconnect.addListener(this.onDisconnect)
    return this.port
  }

  postMessage(message: Message) {
    this.port.postMessage(message)
  }

  onDisconnect() {
    this.port.onMessage.removeListener(this.onMessage)
    this.port.onDisconnect.removeListener(this.onDisconnect)
  }

  onMessage(event: Message) {
    console.log(LOG_NAME, event)
    if (event.type === ABORT_MESSAGE) {
      this.showPaywall()
      this.hideBot()
      return
    }
    if (event.type === STATUS_MESSAGE) {
      if (event.action === 'interaction_required') {
        this.showInteractionRequired()
      } else if (event.message) {
        this.showUpdate(event.message)
      }
      return
    }

    if (event.type === FAILED_MESSAGE) {
      this.hideLoading()
      this.fail()
      return
    }
    if (event.type === SUCCESS_MESSAGE) {
      this.showArticle(event.content, event.saveArticle)
      this.hideBot()
      return
    }

    throw new Error('Unknown message type')
  }

  fail() {
    this.shadow.querySelector(`#${MESSAGE_ID}`).innerHTML = FAILED_HTML
    this.showPaywall()
  }

  showArticle(content, saveArticleUrl) {
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
      let className = this.site.paragraphStyle.className || ''
      let style = this.site.paragraphStyle.style || ''
      if (this.site.paragraphStyle.selector) {
        const example = this.root.querySelector(
          this.site.paragraphStyle.selector,
        )
        if (example !== null) {
          className = example.className || className
          style = example.attributes.getNamedItem('style')?.value || style
        }
      }
      content = content.replace(
        /<p>/g,
        `<p class="${className}" style="${style}">`,
      )
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
