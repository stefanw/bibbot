import { addSharingButton } from '../services.js'
import Extractor from '../extractor.js'
import {
  BOT_ID,
  FAILED_HTML,
  LOADER_HTML,
  LOADER_ID,
  MESSAGE_ID,
  STYLES,
} from '../ui.js'
import type { Site, SiteBotInterface, StringSelector } from '../types.js'
import {
  POLL_INTERVAL_MS,
  TAB_DATA_KEY,
} from './constants.js'
import { fingerprintArticle, JobBusyError, JobStore, type BibbotJob } from './job_store.js'
import {
  buildWorkerStartUrl,
  getVerticalFlow,
} from './provider_flow.js'
import {
  randomToken,
  type OpenTabHandle,
  type UserscriptRuntime,
} from './runtime.js'
import { loadSettings } from './settings.js'

export function hasOriginOwner(
  tabs: Record<string, Record<string, unknown>>,
  job: Pick<BibbotJob, 'originToken' | 'articleFingerprint'>,
) {
  return Object.values(tabs).some((tabData) => {
    const marker = tabData[TAB_DATA_KEY]
    if (!marker || typeof marker !== 'object') {
      return false
    }
    const values = marker as Record<string, unknown>
    return (
      values.role === 'origin' &&
      values.originToken === job.originToken &&
      values.fingerprint === job.articleFingerprint
    )
  })
}

export class ArticleController implements SiteBotInterface {
  private site: Site
  private root: HTMLElement
  private domain: string
  private runtime: UserscriptRuntime
  private store: JobStore
  extractor: Extractor
  private shadow: ShadowRoot | null = null
  private container: HTMLElement | null = null
  private originToken: string | null = null
  private articleFingerprint: string | null = null
  private currentJob: BibbotJob | null = null
  private workerTab: OpenTabHandle | null = null
  private appliedJobId: string | null = null
  private removeListener: (() => void) | null = null
  private pollHandle: ReturnType<typeof setInterval> | null = null
  private started = false

  constructor(
    site: Site,
    root: HTMLElement,
    domain: string,
    runtime: UserscriptRuntime,
    store = new JobStore(runtime),
  ) {
    this.site = site
    this.root = root
    this.domain = domain
    this.runtime = runtime
    this.store = store
    this.extractor = new Extractor(site, root, this)
  }

  start(delay?: boolean | number) {
    if (typeof delay === 'number' && delay > 0) {
      window.setTimeout(() => this.start(), delay)
      return
    }
    this.startAsync().catch(() => undefined)
  }

  private async startAsync() {
    if (this.started) {
      await this.resumeJob()
      return
    }
    const settings = await loadSettings(this.runtime)
    if (settings.disabledSites.includes(this.domain)) {
      return
    }
    if (!this.extractor.hasPaywall()) {
      return
    }
    const articleInfo = this.startInfoExtraction()
    if (!articleInfo) {
      return
    }
    this.started = true
    this.articleFingerprint = fingerprintArticle({
      originUrl: window.location.href,
      articleInfo,
    })
    this.originToken = await this.getOriginToken(this.articleFingerprint)

    const existing = await this.store.getActive()
    if (
      existing &&
      existing.originToken === this.originToken &&
      existing.articleFingerprint === this.articleFingerprint &&
      !['failed', 'cancelled', 'expired'].includes(existing.status)
    ) {
      this.currentJob = existing
      this.attachResumeHooks()
      await this.renderJob(existing)
      return
    }
    if (existing && this.isBlockingForAnotherArticle(existing)) {
      if (existing.originToken === this.originToken) {
        await this.store.cancel(existing.id, this.originToken)
      } else if (!(await this.hasLiveOwner(existing))) {
        await this.store.remove(existing.id)
      } else {
        this.setupUI()
        this.showBusy(existing)
        return
      }
    }

    const workerToken = randomToken('worker')
    try {
      const job = await this.store.create({
        originUrl: window.location.href,
        originDomain: this.domain,
        originToken: this.originToken,
        workerToken,
        articleFingerprint: this.articleFingerprint,
        providerId: settings.provider,
        sourceId: this.site.source,
        sourceParams: this.site.sourceParams,
        articleInfo,
      })
      this.currentJob = job
      this.attachResumeHooks()
      await this.openWorker(job, settings.workerActive)
    } catch (error) {
      if (error instanceof JobBusyError) {
        const blocking = await this.store.getActive()
        if (blocking) {
          this.showBusy(blocking)
        } else {
          this.showUpdate('Ein anderer BibBot-Vorgang läuft bereits.')
        }
        return
      }
      this.showUpdate('Der Bibliotheks-Tab konnte nicht geöffnet werden.')
    }
  }

  private isBlockingForAnotherArticle(job: BibbotJob) {
    if (job.status === 'complete') {
      return !job.acknowledgedAt
    }
    return !['failed', 'cancelled', 'expired'].includes(job.status)
  }

  private async hasLiveOwner(job: BibbotJob) {
    try {
      return hasOriginOwner(await this.runtime.getTabs(), job)
    } catch {
      // If Tampermonkey cannot enumerate tabs, preserve the existing job and
      // let the user explicitly decide whether to replace it.
      return true
    }
  }

  private async getOriginToken(fingerprint: string) {
    let tabData: Record<string, unknown> = {}
    try {
      tabData = await this.runtime.getTab()
    } catch {
      tabData = {}
    }
    const marker = tabData[TAB_DATA_KEY]
    if (
      marker &&
      typeof marker === 'object' &&
      (marker as Record<string, unknown>).role === 'origin' &&
      typeof (marker as Record<string, unknown>).originToken === 'string'
    ) {
      const originToken = (marker as Record<string, string>).originToken
      if ((marker as Record<string, unknown>).fingerprint !== fingerprint) {
        await this.runtime.saveTab({
          [TAB_DATA_KEY]: {
            role: 'origin',
            originToken,
            fingerprint,
            host: location.host,
            path: location.pathname,
          },
        })
      }
      return originToken
    }
    const originToken = randomToken('origin')
    await this.runtime.saveTab({
      [TAB_DATA_KEY]: {
        role: 'origin',
        originToken,
        fingerprint,
        host: location.host,
        path: location.pathname,
      },
    })
    return originToken
  }

  private async openWorker(job: BibbotJob, active: boolean) {
    const flow = getVerticalFlow(this.site.sourceParams)
    const url = buildWorkerStartUrl(flow, job)
    try {
      this.workerTab = await this.runtime.openInTab(url, {
        active,
        setParent: true,
      })
    } catch {
      await this.store.originUpdate(job.id, job.originToken, {
        status: 'failed',
        message: 'Der Bibliotheks-Tab konnte nicht geöffnet werden.',
        error: {
          name: 'OpenTabError',
          message: 'Bibliotheks-Tab konnte nicht geöffnet werden.',
        },
      })
    }
  }

  private attachResumeHooks() {
    if (this.removeListener) {
      return
    }
    this.removeListener = this.store.onChange(() => {
      this.resumeJob().catch(() => undefined)
    })
    for (const eventName of ['pageshow', 'visibilitychange', 'focus']) {
      window.addEventListener(eventName, () => {
        this.resumeJob().catch(() => undefined)
      })
    }
    this.pollHandle = setInterval(() => {
      this.resumeJob().catch(() => undefined)
    }, POLL_INTERVAL_MS)
  }

  private async resumeJob() {
    if (!this.originToken || !this.articleFingerprint) {
      return
    }
    const job = await this.store.getActive()
    if (
      !job ||
      job.originToken !== this.originToken ||
      job.articleFingerprint !== this.articleFingerprint
    ) {
      return
    }
    this.currentJob = job
    await this.renderJob(job)
  }

  private async renderJob(job: BibbotJob) {
    this.setupUI()
    if (job.status === 'complete' && job.resultHtml && this.appliedJobId !== job.id) {
      this.showArticle(job.resultHtml, (await loadSettings(this.runtime)).saveArticle)
      this.appliedJobId = job.id
      this.hideBot()
      await this.store.acknowledge(job.id, job.originToken)
      await this.closeWorkerTab()
      return
    }
    if (job.status === 'failed' || job.status === 'expired' || job.status === 'cancelled') {
      this.hideLoading()
      this.fail(job)
      return
    }
    if (job.status === 'waiting-interaction') {
      this.showInteractionRequired(job)
      return
    }
    this.showUpdate(job.message || 'BibBot arbeitet…')
  }

  private async closeWorkerTab() {
    const tab = this.workerTab
    this.workerTab = null
    if (!tab || tab.closed || typeof tab.close !== 'function') {
      return
    }
    try {
      await tab.close()
    } catch {
      // Closing the helper tab is a convenience; article delivery must stay
      // successful if Safari or Tampermonkey refuses the close operation.
    }
  }

  private showInteractionRequired(job: BibbotJob) {
    this.hideLoading()
    const message = this.shadow?.querySelector(`#${MESSAGE_ID}`)
    if (!message) {
      return
    }
    message.textContent = ''
    const text = document.createTextNode(
      'Bitte die Prüfung im geöffneten Bibliotheks-Tab abschließen. ',
    )
    const button = document.createElement('button')
    button.id = 'bibbot-goto'
    button.type = 'button'
    button.textContent = 'Worker-Tab sichtbar öffnen'
    button.addEventListener('click', () => {
      this.openWorker(job, true).catch(() => undefined)
    })
    message.append(text, button)
  }

  private showBusy(job: BibbotJob) {
    this.hideLoading()
    const message = this.shadow?.querySelector(`#${MESSAGE_ID}`)
    if (!message) {
      return
    }
    const ageSeconds = Math.max(0, Math.floor((Date.now() - job.createdAt) / 1000))
    const age =
      ageSeconds < 60
        ? `${ageSeconds} Sekunden`
        : `${Math.floor(ageSeconds / 60)} Minuten`
    message.textContent = ''
    const text = document.createElement('p')
    text.textContent =
      `BibBot arbeitet bereits für ${job.originDomain} ` +
      `(seit ${age}, Status: ${job.status}).`
    const hint = document.createElement('p')
    hint.textContent =
      'Wenn der ursprüngliche Artikel nicht mehr benötigt wird, kann dieser Vorgang sicher ersetzt werden.'
    const takeover = document.createElement('button')
    takeover.id = 'bibbot-takeover'
    takeover.type = 'button'
    takeover.textContent = 'Alten Vorgang abbrechen und hier fortfahren'
    takeover.addEventListener('click', async () => {
      takeover.disabled = true
      takeover.textContent = 'Alter Vorgang wird beendet…'
      try {
        await this.store.remove(job.id)
        window.location.reload()
      } catch {
        takeover.disabled = false
        takeover.textContent = 'Erneut versuchen'
      }
    })
    message.append(text, hint, takeover)
  }

  startInfoExtraction() {
    if (!this.extractor.shouldExtract()) {
      return undefined
    }
    this.setupUI()
    this.showLoading()
    try {
      return this.extractor.extractArticleInfo()
    } catch {
      this.showUpdate('Beim Extrahieren der Artikeldaten trat ein Fehler auf.')
      return undefined
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
    if (!loadingArea?.parentNode) {
      return
    }
    const shadowHost = document.createElement('div')
    loadingArea.parentNode.insertBefore(shadowHost, loadingArea.nextSibling)
    this.shadow = shadowHost.attachShadow({ mode: 'open' })
    this.shadow.innerHTML = STYLES
    this.container = document.createElement('div')
    this.shadow.appendChild(this.container)
  }

  runSelectorQuery(selector: StringSelector) {
    return this.extractor.runSelectorQuery(selector)
  }

  hidePaywall() {
    const paywall = this.extractor.getPaywall()
    if (paywall) {
      paywall.style.display = 'none'
    }
  }

  showPaywall() {
    const paywall = this.extractor.getPaywall()
    if (paywall) {
      paywall.style.display = 'block'
    }
  }

  showLoading() {
    if (this.container) {
      this.container.innerHTML = LOADER_HTML
    }
  }

  hideLoading() {
    const loader = this.shadow?.querySelector(`#${LOADER_ID}`) as HTMLElement | null
    if (loader) {
      loader.style.display = 'none'
    }
  }

  hideBot() {
    const bot = this.shadow?.querySelector(`#${BOT_ID}`) as HTMLElement | null
    if (bot) {
      bot.style.display = 'none'
    }
  }

  showUpdate(text: string) {
    const message = this.shadow?.querySelector(`#${MESSAGE_ID}`) as HTMLElement | null
    if (message) {
      message.textContent = text
    }
  }

  fail(job?: BibbotJob) {
    const message = this.shadow?.querySelector(`#${MESSAGE_ID}`) as HTMLElement | null
    if (message) {
      message.innerHTML = FAILED_HTML
      if (job?.error?.message) {
        const details = document.createElement('p')
        details.className = 'bibbot-error-details'
        details.textContent = `Technischer Hinweis: ${job.error.message}`
        message.appendChild(details)
      }
      const retry = document.createElement('button')
      retry.type = 'button'
      retry.id = 'bibbot-retry'
      retry.textContent = 'Erneut versuchen'
      retry.addEventListener('click', () => window.location.reload())
      message.appendChild(retry)
    }
    this.showPaywall()
  }

  showArticle(content: string | string[], saveArticleUrl: string | null) {
    const main = this.extractor.getMainContentArea()
    let html = Array.isArray(content) ? content.join('') : content
    if (this.site.mimic) {
      if (typeof this.site.mimic === 'function') {
        html = this.site.mimic(html, main)
      } else {
        const mimic = this.root.querySelector(this.site.mimic)
        if (mimic !== null) {
          html = `<div class="${mimic.className}">${html}</div>`
        }
      }
    }
    if (this.site.paragraphStyle) {
      let className = this.site.paragraphStyle.className || ''
      let style = this.site.paragraphStyle.style || ''
      if (this.site.paragraphStyle.selector) {
        const example = this.root.querySelector(this.site.paragraphStyle.selector)
        if (example !== null) {
          className = example.className || className
          style = example.attributes.getNamedItem('style')?.value || style
        }
      }
      html = html.replace(
        /<p>/g,
        `<p class="${className}" style="${style}">`,
      )
    }
    if (this.site.insertContent) {
      this.site.insertContent(this, main, html)
    } else {
      main.innerHTML = html
    }
    if (saveArticleUrl) {
      addSharingButton(main, html, saveArticleUrl)
    }
  }
}
