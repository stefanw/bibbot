import { LOADER_HTML, LOADER_ID, MESSAGE_ID, FAILED_HTML } from './ui.js'
import { FAILED_MESSAGE, INIT_MESSAGE, GOTOTAB_MESSAGE, STATUS_MESSAGE, SUCCES_MESSAGE, PORT_NAME } from './const.js'

class SiteBot {
  constructor (site, root, domain = null) {
    this.site = site
    this.root = root
    this.domain = domain

    this.onDisconnect = this.onDisconnect.bind(this)
    this.onMessage = this.onMessage.bind(this)
  }

  start () {
    if (!this.hasPaywall()) {
      return
    }

    if (this.site.start) {
      this.site.start(this.root, this.getPaywall())
    } else {
      this.hidePaywall()
    }

    this.showLoading()
    let articleInfo
    try {
      articleInfo = this.collectArticleInfo()
    } catch (e) {
      this.showUpdate('Beim Extrahieren der Artikeldaten trat ein Fehler auf.')
      return
    }
    this.connectPort()
    this.postMessage({
      type: INIT_MESSAGE,
      source: this.site.source,
      sourceParams: this.site.sourceParams,
      domain: this.domain,
      articleInfo: articleInfo
    })
  }

  getPaywall () {
    return this.root.querySelector(this.site.selectors.paywall)
  }

  hasPaywall () {
    return this.getPaywall() !== null
  }

  hidePaywall () {
    this.getPaywall().style.display = 'none'
  }

  showPaywall () {
    this.getPaywall().style.display = 'block'
  }

  getMainContentArea () {
    return this.root.querySelector(this.site.selectors.main)
  }

  showLoading () {
    if (this.site.selectors.loader) {
      const div = document.createElement('div')
      div.innerHTML = LOADER_HTML
      const el = this.root.querySelector(this.site.selectors.loader)
      el.parentNode.insertBefore(div, el.nextSibling)
    } else {
      const main = this.getMainContentArea()
      main.innerHTML = main.innerHTML + LOADER_HTML
    }
  }

  hideLoading () {
    this.root.getElementById(LOADER_ID).style.display = 'none'
  }

  showUpdate (text) {
    this.root.querySelector(`#${MESSAGE_ID}`).innerText = text
  }

  showInteractionRequired () {
    this.hideLoading()
    const btnId = 'voebbot-goto'
    const html = `<button id="${btnId}">Bitte gehen Sie zum geöffneten Tab.</button>`
    this.root.querySelector(`#${MESSAGE_ID}`).innerHTML = html
    this.root.querySelector(`#${btnId}`).addEventListener('click', (e) => {
      e.preventDefault()
      this.postMessage({
        type: GOTOTAB_MESSAGE
      })
    })
  }

  collectArticleInfo () {
    const articleInfo = {}
    for (const key in this.site.selectors) {
      if (this.site.selectors[key]) {
        const selector = this.site.selectors[key]
        if (typeof selector === 'function') {
          articleInfo[key] = selector(this.root)
        } else {
          const parts = this.site.selectors[key].split('@')
          const result = this.root.querySelector(parts[0])
          if (result === null) {
            articleInfo[key] = ''
            continue
          }
          if (parts[1]) {
            articleInfo[key] = result.attributes[parts[1]].value.trim()
          } else {
            articleInfo[key] = result.textContent.trim()
          }
        }
      }
    }
    let q = articleInfo.query
    // remove some special chars
    q = q.replace(/[!,:?;'/()]/g, '')
    // remove non-leading/trailing quotes
    q = q.replace(/(.)"(.)/g, '$1$2')
    articleInfo.query = q
    return articleInfo
  }

  connectPort () {
    this.port = browser.runtime.connect({ name: PORT_NAME })
    this.port.onMessage.addListener(this.onMessage)
    this.port.onDisconnect.addListener(this.onDisconnect)
    return this.port
  }

  postMessage (message) {
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
      this.showArticle(event.content)
      return
    }

    throw new Error('Unknown message type')
  }

  fail () {
    this.root.querySelector(`#${MESSAGE_ID}`).innerHTML = FAILED_HTML
    this.showPaywall()
  }

  showArticle (content) {
    content = content.join('')
    if (this.site.mimic) {
      if (typeof this.site.mimic === 'function') {
        content = this.site.mimic(content)
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

    const main = this.getMainContentArea()
    main.innerHTML = content
  }
}

export default SiteBot
