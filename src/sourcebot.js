import converters from './converters.js'
import providers from './providers.js'
import sources from './sources.js'
import { SUCCES_MESSAGE, FAILED_MESSAGE, STATUS_MESSAGE } from './const.js'
import { interpolate } from './utils.js'

const PHASE_LOGIN = 'login'
const PHASE_SEARCH = 'search'

class SourceBot {
  constructor (sourceId, providerId, params, articleInfo, userData, callback) {
    this.step = 0
    this.phase = PHASE_LOGIN

    this.sourceId = sourceId
    this.source = sources[sourceId]

    this.providerId = providerId
    this.provider = providers[providerId]

    this.params = params
    this.articleInfo = articleInfo
    this.userData = userData
    this.callback = callback

    this.onTabUpdated = this.onTabUpdated.bind(this)
  }

  async run () {
    const url = interpolate(
      this.source.start,
      this.provider.params[this.sourceId],
      'provider', encodeURIComponent
    )
    const tab = await browser.tabs.create({
      url: url,
      active: false
    })
    this.tabId = tab.id
    console.log('tab created', tab.id)

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
      this.runNextsourcestep()
    }
  }

  async runNextsourcestep () {
    const loggedIn = await this.isLoggedIn()
    if (loggedIn) {
      this.step = 0
      this.phase = PHASE_SEARCH
    }
    await this.runActionsOfCurrentStep()
  }

  async isLoggedIn () {
    if (this.phase === PHASE_LOGIN && this.step === 0) {
      const result = await browser.tabs.executeScript(this.tabId, {
        code: `document.querySelector("${this.source.loggedIn}") !== null`
      })
      console.log('loggedin?', result)
      return result[0]
    }
    return false
  }

  getActionList () {
    const actionList = this.source[this.phase]
    const actions = actionList[this.step]
    if (Array.isArray(actions)) {
      return actions
    }
    if (actions.provider) {
      return this.provider[actions.provider]
    }
    throw new Error('Unknown action in source')
  }

  isFinalStep () {
    return (
      this.phase === PHASE_SEARCH &&
      this.step === this.source[this.phase][this.step].length - 1
    )
  }

  async runActionsOfCurrentStep () {
    const actions = this.getActionList()

    let result
    for (const action of actions) {
      console.log('Running', action)
      const actionCode = this.getActionCode(action)
      try {
        result = await this.runScript(actionCode)
      } catch (e) {
        this.fail(e.toString())
        return
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
      if (this.phase === PHASE_LOGIN) {
        this.phase = PHASE_SEARCH
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
    this.callback({
      type: FAILED_MESSAGE,
      message: message
    })
    this.cleanUp()
  }

  async runScript (actionCode) {
    if (actionCode.length === 0) {
      return
    }
    let result = await browser.tabs.executeScript(
      this.tabId, {
        code: actionCode[0]
      })
    result = result[0]
    if (actionCode.length === 1) {
      return result
    }
    return actionCode[1](result)
  }

  getActionCode (action) {
    if (action.message) {
      this.callback({
        type: STATUS_MESSAGE,
        message: action.message
      })
      return []
    } else if (action.fill) {
      if (this.userData[action.fill.key]) {
        return [`document.querySelector('${action.fill.selector}').value = '${this.userData[action.fill.key]}'`]
      } else {
        return []
      }
    } else if (action.failOnMissing) {
      return [
        `document.querySelector('${action.failOnMissing}') !== null`,
        function (result) {
          if (result === true) {
            return result
          }
          throw new Error(action.failure)
        }
      ]
    } else if (action.click) {
      if (action.optional) {
        return [`var el = document.querySelector('${action.click}'); el && el.click()`]
      } else {
        return [`document.querySelector('${action.click}').click()`]
      }
    } else if (action.url) {
      const url = this.makeUrl(action.url)
      return [`document.location.href = '${url}';`]
    } else if (action.extract) {
      return [
        `Array.from(document.querySelectorAll('${action.extract}')).map(function(el) {
          return el.outerHTML
        })`,
        function (result) {
          if (result.length > 0 && action.convert) {
            result = converters[action.convert](result)
          }
          return result
        }]
    }
  }

  makeUrl (url) {
    url = interpolate(url, this.articleInfo, '', encodeURIComponent)
    if (this.params) {
      url = interpolate(url, this.params, 'source', encodeURIComponent)
    }
    return url
  }
}

export default SourceBot
