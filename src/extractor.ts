import { ExtractorInterface, Site, FormattedDateRange, ArticleInfo } from './types.js'

const QUOTES = /["„].*["„]/

class Extractor implements ExtractorInterface {
  site: Site
  root: HTMLElement

  constructor (site, root) {
    this.site = site
    this.root = root
  }

  shouldExtract () {
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

  getLoadingArea () {
    if (this.site.selectors.loader) {
      return this.runSelectorQueryElement(this.site.selectors.loader)
    }
    return null
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

  extractDateQuery (dateValue, range = [3, 1]) {
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

  extractArticleInfo () {
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
    q = q.split(QUOTES).map(s => s.trim()).filter(s => s.split(' ').length > 1).map(s => `"${s}"`).join(' ')
    articleInfo.query = q
    return {
      ...articleInfo,
      ...this.extractDateQuery(articleInfo.date, this.site.dateRange || [1, 1])
    }
  }
}

export default Extractor
