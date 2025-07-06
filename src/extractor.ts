import {
  ArticleInfo,
  ElementSelector,
  ExtractorInterface,
  FormattedDateRange,
  RawArticleInfo,
  Site,
  SiteBotInterface,
  StringSelector,
} from './types.js'

class Extractor implements ExtractorInterface {
  site: Site
  siteBot: SiteBotInterface
  root: HTMLElement
  main: HTMLElement | null

  constructor(site, root, siteBot) {
    this.site = site
    this.root = root
    this.siteBot = siteBot
    this.main = null
  }

  shouldExtract() {
    if (this.site.start) {
      const result = this.site.start(this.root, this.getPaywall())
      if (result) {
        // determined not worth it
        return false
      }
    } else {
      this.hidePaywall()
    }
    return true
  }

  getPaywall() {
    return this.runSelectorQueryElement(this.site.selectors.paywall)
  }

  hasPaywall() {
    return this.getPaywall() !== null
  }

  hidePaywall() {
    if (this.hasPaywall()) {
      this.getPaywall().style.display = 'none'
    }
  }

  showPaywall() {
    this.getPaywall().style.display = 'block'
  }

  getMainContentArea() {
    if (this.main) {
      return this.main
    }
    const main = this.runSelectorQueryElement(this.site.selectors.main)
    if (this.site.insertAfterMain) {
      const newMain = document.createElement('div')
      main.parentNode.insertBefore(newMain, main.nextSibling)
      this.main = newMain
    } else {
      this.main = main
    }
    return this.main
  }

  getLoadingArea() {
    if (this.site.selectors.loader) {
      return this.runSelectorQueryElement(this.site.selectors.loader)
    }
    return null
  }

  runSelectorQueryElement(selector: ElementSelector): HTMLElement | null {
    if (typeof selector === 'function') {
      return selector(this.root, this.siteBot)
    }
    let result = null
    if (Array.isArray(selector)) {
      for (const s of selector) {
        result = this.runSelectorQueryElement(s)
        if (result !== null) {
          return result
        }
      }
      return null
    }
    return this.root.querySelector(selector)
  }

  runSelectorQuery(selector: StringSelector): string {
    const result = this._runSelectorQuery(selector)
    if (result === null) {
      return ''
    }
    if (result instanceof window.HTMLElement) {
      return result.innerText
    }
    return result
  }

  _runSelectorQuery(selector: StringSelector): string | HTMLElement | null {
    if (typeof selector === 'function') {
      return selector(this.root)
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

  extractDateQuery(dateValue: string, range): FormattedDateRange {
    const defaultValue: FormattedDateRange = {
      dateStart: '',
      dateEnd: '',
      dateUSStart: '',
      dateUSEnd: '',
    }
    let date;
    if (!dateValue) {
      ['meta[name=date]','meta[name=last-modified]'].forEach(query => {
        if(!!document.querySelector(query)){
        date = new Date(document.querySelector(query).content);
        return date;
      }})
      return defaultValue
    }
    if (dateValue.match(/(\d{4})-(\d{2})-(\d{2})/)) {
      date = new Date(dateValue)
    } else {
      let match = dateValue.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
      if (!match) {
        match = dateValue.match(/(\d{1,2})\. ([^ ]+) (\d{4})/)
        if (match) {
          const monthNames = [
            'Januar',
            'Februar',
            'März',
            'April',
            'Mai',
            'Juni',
            'Juli',
            'August',
            'September',
            'Oktober',
            'November',
            'Dezember',
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
    }
    const formatDate = (d) =>
      `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
    const formatUSDate = (d) =>
      `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.${d.getFullYear()}`
    const day = 24 * 60 * 60 * 1000
    const dateStart = new Date(date.getTime() - day * range[0])
    const dateEnd = new Date(date.getTime() + day * range[1])
    const dateRange: FormattedDateRange = {
      dateStart: formatDate(dateStart),
      dateEnd: formatDate(dateEnd),
      dateUSStart: formatUSDate(dateStart),
      dateUSEnd: formatUSDate(dateEnd),
    }
    return dateRange
  }

  extractArticleInfo(): ArticleInfo {
    const articleInfoSelectors = ['query', 'edition', 'date']
    const articleInfo: RawArticleInfo = {}
    for (const key of articleInfoSelectors) {
      if (this.site.selectors[key]) {
        const selector = this.site.selectors[key]
        const result = this.runSelectorQuery(selector)
        articleInfo[key] = result
      }
    }
    return {
      query: articleInfo.query,
      edition: articleInfo.edition,
      ...this.extractDateQuery(articleInfo.date, this.site.dateRange || [4, 1]),
    }
  }
}

export default Extractor
