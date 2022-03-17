import * as browser from 'webextension-polyfill'

import providers from './providers.js'
import sources from './sources.js'
import TabRunner from './tabrunner.js'
import { SUCCES_MESSAGE, FAILED_MESSAGE, STATUS_MESSAGE } from './const.js'
import { interpolate } from './utils.js'
import { ArticleInfo, Source, Provider, SiteSourceParams, Message } from './types.js'

enum PHASE {
  LOGIN = 'login',
  SEARCH = 'search',
}

class SourceBot {
  step: number
  phase: PHASE
  sourceId: string
  providerId: string
  provider: Provider
  source: Source
  sourceParams: SiteSourceParams
  articleInfo: ArticleInfo
  providerOptions: object
  callback: (message: Message) => void
  tabId: number
  tabRunner: TabRunner
  done: boolean

  constructor (sourceId, providerId, providerOptions, sourceParams, articleInfo, callback) {
    this.step = 0
    this.phase = PHASE.LOGIN

    this.sourceId = sourceId
    this.source = sources[sourceId]

    this.providerId = providerId
    this.provider = providers[providerId]

    this.sourceParams = sourceParams
    this.articleInfo = articleInfo
    this.providerOptions = providerOptions
    this.callback = callback

    this.onTabUpdated = this.onTabUpdated.bind(this)
    this.done = false
  }

  getParams () {
    return Object.assign(
      {},
      this.source.defaultParams || {},
      this.provider.params[this.sourceId],
      this.sourceParams
    )
  }

  async run () {
    const url = this.makeUrl(this.source.start)
    const tab = await browser.tabs.create({
      url: url,
      active: false
    })
    this.tabId = tab.id
    console.log('tab created', tab.id)
    const userData = Object.assign({}, this.providerOptions);
    ['options.username', 'options.password'].forEach(key => {
      const confValue = userData[`${this.providerId}.${key}`]
      if (confValue !== undefined) {
        userData[key] = confValue
      }
    })
    this.tabRunner = new TabRunner(tab.id, userData)
    browser.tabs.onUpdated.addListener(this.onTabUpdated)
  }

  cleanUp () {
    browser.tabs.onUpdated.removeListener(this.onTabUpdated)
  }

  onTabUpdated (tabId, changeInfo) {
    if (this.done) {
      this.cleanUp()
      return
    }
    if (tabId !== this.tabId) {
      return
    }
    if (changeInfo.status === 'complete') {
      console.log('tab load complete', tabId)
      this.runNextSourceStep()
    }
  }

  async runNextSourceStep () {
    const loggedIn = await this.isLoggedIn()
    if (loggedIn) {
      this.step = 0
      this.phase = PHASE.SEARCH
    }
    await this.runActionsOfCurrentStep()
  }

  async isLoggedIn () {
    if (this.phase === PHASE.LOGIN && this.step === 0) {
      const result = await browser.tabs.executeScript(this.tabId, {
        code: `document.querySelector("${this.source.loggedIn}") !== null`
      })
      console.log('loggedin?', result)
      return result[0]
    }
    return false
  }

  getActions () {
    const actionList = this.provider[this.phase] || this.source[this.phase]
    const actions = actionList[this.step]
    if (Array.isArray(actions)) {
      return actions
    }
    throw new Error('Unknown action in source')
  }

  isFinalStep () {
    return (
      this.phase === PHASE.SEARCH &&
      this.step === this.source[this.phase].length - 1
    )
  }

  handleAction (action) {
    if (action.message) {
      // message does not need to run through tabrunner
      this.callback({
        type: STATUS_MESSAGE,
        message: action.message
      })
      return null
    }
    if (action.url) {
      // recreate action.url with interpolated url
      action = Object.assign({}, action)
      action.url = this.makeUrl(action.url)
    }
    return action
  }

  async runActionsOfCurrentStep () {
    const actions = this.getActions()

    let result
    for (let action of actions) {
      action = this.handleAction(action)
      if (action === null) { continue }
      try {
        result = await this.tabRunner.runAction(action)
      } catch (e) {
        this.fail(e.toString())
        return
      }
      if (typeof result === 'function') {
        if (!result(this)) {
          this.cleanUp()
          return
        }
      }
    }
    const isFinalStep = this.isFinalStep()
    if (isFinalStep) {
      this.finalize(result)
      return
    }
    // Move to next step and wait for tab update event
    this.step += 1
    if (this.step > this.source[this.phase].length - 1) {
      if (this.phase === PHASE.LOGIN) {
        this.phase = PHASE.SEARCH
      }
      this.step = 0
    }
  }

  finalize (result) {
    this.done = true
    if (result.length > 0) {
      this.callback({
        type: SUCCES_MESSAGE,
        message: result
      })

      browser.tabs.remove(this.tabId)
      this.cleanUp()
    } else {
      this.fail('failed to find content')
    }
  }

  fail (message) {
    console.error(message)
    this.callback({
      type: FAILED_MESSAGE,
      message: message
    })
    this.cleanUp()
  }

  makeUrl (url) {
    url = interpolate(url, this.articleInfo, '', encodeURIComponent)
    const params = this.getParams()
    url = interpolate(url, params, 'source', encodeURIComponent)
    return url
  }

  activateTab () {
    browser.tabs.update(this.tabId, {
      active: true
    })
  }
}

export default SourceBot
