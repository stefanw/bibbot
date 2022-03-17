import * as browser from 'webextension-polyfill'

import { LOADER_HTML, BOT_ID, LOADER_ID, MESSAGE_ID, FAILED_HTML } from './ui.js'
import { FAILED_MESSAGE, INIT_MESSAGE, GOTOTAB_MESSAGE, STATUS_MESSAGE, SUCCES_MESSAGE, PORT_NAME } from './const.js'

import { addSharingButton } from './services.js'
import { Site, SiteBotInterface, FormattedDateRange, ArticleInfo, Message, InitMessage, GoToTabMessage } from './types.js'

class SiteBot implements SiteBotInterface {
  site: Site
  root: HTMLElement
  domain: string | null
  port?: browser.Runtime.Port | null

  constructor (site, root, domain = null) {
    this.site = site
    this.root = root
    this.domain = domain

    this.onDisconnect = this.onDisconnect.bind(this)
    this.onMessage = this.onMessage.bind(this)
  }

  start (delay?: boolean | number) {
    if (typeof delay === 'number') {
      window.setTimeout(() => this.start(), delay)
    }
    if (!this.hasPaywall()) {
      return
    }
    const articleInfo = this.startInfoExtraction()
    if (articleInfo) {
      this.startBackgroundConnection(articleInfo)
    }
  }

  startInfoExtraction () {
    if (this.site.start) {
      const result = this.site.start(this.root, this.getPaywall())
      if (result) {
        // determined not worth it
        return
      }
    } else {
      this.hidePaywall()
    }

    this.showLoading()
    try {
      return this.collectArticleInfo()
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
      articleInfo: articleInfo
    }
    this.postMessage(message)
  }

  getPaywall () {
    return this.runSelectorQueryElement(this.site.selectors.paywall)
  }

  hasPaywall () {
    return this.getPaywall() !== null
  }

  hidePaywall () {
    if (this.hasPaywall()) {
      this.getPaywall().style.display = 'none'
    }
  }

  showPaywall () {
    this.getPaywall().style.display = 'block'
  }

  getMainContentArea () {
    return this.runSelectorQueryElement(this.site.selectors.main)
  }

  showLoading () {
    if (this.site.selectors.loader) {
      const div = document.createElement('div')
      div.innerHTML = LOADER_HTML
      const el = this.runSelectorQueryElement(this.site.selectors.loader)
      el.parentNode.insertBefore(div, el.nextSibling)
    } else {
      const main = this.getMainContentArea()
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

  runSelectorQueryElement (selector) {
    if (typeof selector === 'function') {
      return selector(this.root, this)
    }
    let result = null
    if (Array.isArray(selector)) {
      for (const s of selector) {
        result = this.runSelectorQueryElement(s)
        if (result !== null) {
          return result
        }
      }
    }
    return this.root.querySelector(selector)
  }

  runSelectorQuery (selector) {
    if (typeof selector === 'function') {
      return selector(this.root, this)
    }
    if (Array.isArray(selector)) {
      for (const s of selector) {
        const result = this.runSelectorQuery(s)
        if (result !== '') {
          return result
        }
      }
      return ''
    }

    const parts = selector.split('@')
    const hasAttribute = parts.length > 1

    const result = this.root.querySelector(parts[0])
    if (result === null) {
      return ''
    }

    if (hasAttribute) {
      return result.attributes[parts[1]].value.trim()
    } else {
      return result.textContent.trim()
    }
  }

  extractDateQuery (dateValue, range = [1, 1]) {
    const defaultValue: FormattedDateRange = {
      dateStart: '', dateEnd: ''
    }
    if (!dateValue) {
      return defaultValue
    }
    let date
    let match = dateValue.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
    if (!match) {
      match = dateValue.match(/(\d{1,2})\. (\w+) (\d{4})/)
      if (match) {
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
          'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ]
        const monthIndex = monthNames.findIndex((x) => x === match[2])
        if (monthIndex === -1) {
          return defaultValue
        }
        date = new Date(`${match[3]}-${monthIndex + 1}-${match[1]}`)
      } else {
        return defaultValue
      }
    } else {
      date = new Date(`${match[3]}-${match[2]}-${match[1]}`)
    }
    if (isNaN(date)) {
      return defaultValue
    }
    const formatDate = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
    const day = 24 * 60 * 60 * 1000
    const dateStart = new Date(date.getTime() - day * range[0])
    const dateEnd = new Date(date.getTime() + day * range[1])
    const dateRange: FormattedDateRange = {
      dateStart: formatDate(dateStart),
      dateEnd: formatDate(dateEnd)
    }
    return dateRange
  }

  collectArticleInfo () {
    const articleInfoSelectors = ['query', 'edition', 'date']
    const articleInfo: ArticleInfo = {}
    for (const key of articleInfoSelectors) {
      if (this.site.selectors[key]) {
        const selector = this.site.selectors[key]
        let result = this.runSelectorQuery(selector)
        if (result instanceof window.HTMLElement) {
          result = result.innerText
        }
        articleInfo[key] = result
      }
    }
    let q = articleInfo.query
    // remove some special chars
    q = q.replace(/[!,:?;'/()]/g, '')
    // remove non-leading/trailing quotes
    q = q.replace(/(.)"(.)/g, '$1$2')
    articleInfo.query = q
    return {
      ...articleInfo,
      ...this.extractDateQuery(articleInfo.date, this.site.dateRange || [1, 1])
    }
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
    const main = this.getMainContentArea()
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
