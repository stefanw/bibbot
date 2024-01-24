import * as browser from 'webextension-polyfill'
import { Action, Actions } from './types.js'

import { STATUS_MESSAGE } from './const.js'
import converters from './converters.js'
import { escapeJsString, makeTimeout } from './utils.js'

class TabRunner {
  tabId: number
  userData: object

  constructor (tabId, userData) {
    this.tabId = tabId
    this.userData = userData
  }

  async runActions (actions: Actions) {
    let result
    for (const action of actions) {
      result = await this.runAction(action)
    }
    return result
  }

  async runAction (action: Action) {
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

  getActionCode (action: Action) {
    if ('fill' in action) {
      let val
      if (action.fill.key && this.userData[action.fill.key]) {
        val = this.userData[action.fill.key]
      } else if (action.fill.providerKey) {
        val = this.userData[action.fill.providerKey]
      } else if (action.fill.value) {
        val = action.fill.value
      } else {
        return []
      }
      return [`document.querySelector('${action.fill.selector}').value = '${val}'`]
    } else if ('event' in action) {
      return [`document.querySelector('${action.event.selector}').dispatchEvent(new Event('${action.event.event}'))`]
    } else if ('wait' in action) {
      return [makeTimeout(action.wait)]
    } else if ('failOnMissing' in action) {
      return [
        `document.querySelector('${action.failOnMissing}') !== null`,
        function (result) {
          if (result === true) {
            return result
          }
          throw new Error(action.failure)
        }
      ]
    } else if ('script' in action) {
      return [action.script]
    } else if ('click' in action) {
      if (action.optional) {
        return [`var el = document.querySelector('${action.click}'); el && el.click(); el === null`]
      } else {
        return [`document.querySelector('${action.click}').click()`]
      }
    } else if ('url' in action) {
      return [`document.location.href = '${escapeJsString(action.url)}';`]
    } else if ('href' in action) {
      return [`document.location.href = document.querySelector('${action.href}').href;`]
    } else if ('captcha' in action) {
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
    } else if ('extract' in action) {
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
