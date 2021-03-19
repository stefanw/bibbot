import converters from './converters.js'
import providers from './providers.js'
import { SUCCES_MESSAGE, FAILED_MESSAGE, STATUS_MESSAGE } from './const.js'

const PHASE_LOGIN = 'login'
const PHASE_SEARCH = 'search'

class SourceBot {
  constructor (source, provider, params, articleInfo, userData, callback) {
    this.step = 0
    this.phase = PHASE_LOGIN

    this.source = source
    this.provider = provider
    this.params = params
    this.articleInfo = articleInfo
    this.userData = userData
    this.callback = callback
    this.onTabUpdated = this.onTabUpdated.bind(this)
  }

  async run () {
    const tab = await browser.tabs.create({
      url: this.source.login[this.provider].start,
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
    let item
    if (this.phase === PHASE_LOGIN) {
      item = this.source.login[this.provider].login
    }
    item = this.source.search
    if (Array.isArray(item)) {
      return item
    }
    if (item.provider) {
      return providers[this.provider][item.provider]
    }
    throw new Error('Unknown action in source')
  }

  async runActionsOfCurrentStep () {
    const actionList = this.getActionList()
    const actions = actionList[this.step]
    const isFinalStep = this.phase === PHASE_SEARCH &&
                        this.step === actionList.length - 1

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
    if (isFinalStep) {
      this.finalize(result)
      return
    }
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
    const vars = ['query', 'edition', 'overline']
    for (const v of vars) {
      const q = this.articleInfo[v] || ''
      url = url.replace(new RegExp(`{${v}}`), encodeURIComponent(q))
    }
    if (this.params) {
      for (const v in this.params) {
        url = url.replace(
          new RegExp(`{sourceParams.${v}}`),
          encodeURIComponent(this.params[v] || '')
        )
      }
    }
    return url
  }
}

export default SourceBot
