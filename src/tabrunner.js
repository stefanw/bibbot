import converters from './converters.js'
import { STATUS_MESSAGE } from './const.js'
import { makeTimeout } from './utils.js'

class TabRunner {
  constructor (tabId, userData) {
    this.tabId = tabId
    this.userData = userData
  }

  async runActions (actions) {
    let result
    for (const action of actions) {
      await this.runAction(action)
    }
    return result
  }

  async runAction (action) {
    console.log('Running', action)
    const actionCode = this.getActionCode(action)
    return await this.runScript(actionCode)
  }

  async runScript (actionCode) {
    if (actionCode.length === 0) {
      return
    }
    let result
    if (typeof actionCode[0] === 'function') {
      result = await actionCode[0](this)
    } else {
      result = await browser.tabs.executeScript(
        this.tabId, {
          code: actionCode[0]
        })
      result = result[0]
    }
    if (actionCode.length === 1) {
      return result
    }
    return actionCode[1](result)
  }

  getActionCode (action) {
    if (action.fill) {
      if (action.fill.key && this.userData[action.fill.key]) {
        return [`document.querySelector('${action.fill.selector}').value = '${this.userData[action.fill.key]}'`]
      } else if (action.fill.providerKey) {
        return [`document.querySelector('${action.fill.selector}').value = '${this.userData[action.fill.providerKey]}'`]
      } else if (action.fill.value) {
        return [`document.querySelector('${action.fill.selector}').value = '${action.fill.value}'`]
      } else {
        return []
      }
    } else if (action.event) {
      return [`document.querySelector('${action.event.selector}').dispatchEvent(new Event('${action.event.event}'))`]
    } else if (action.wait) {
      return [makeTimeout(action.wait)]
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
      return [`document.location.href = '${action.url}';`]
    } else if (action.href) {
      return [`document.location.href = document.querySelector('${action.href}').href;`]
    } else if (action.captcha) {
      return [`document.querySelector('${action.captcha}') === null`,
        function (result) {
          if (result === true) {
            return result
          }
          return function (sourceBot) {
            sourceBot.callback({
              type: STATUS_MESSAGE,
              action: 'interaction_required'
            })
            return false
          }
        }]
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
}

export default TabRunner
