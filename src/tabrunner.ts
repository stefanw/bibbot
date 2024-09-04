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
    if (!actionCode) {
      return
    }
    let result
    if (actionCode.localFunc) {
      result = await actionCode.localFunc(this)
    } else {
      result = await browser.scripting.executeScript({
        target: {
          tabId: this.tabId
        },
        func: actionCode.func,
        args: actionCode.args
      })
      result = result[0].result
    }
    if (actionCode.resultFunc) {
      return actionCode.resultFunc(result)
    }
    return result
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
      return {
        func: (selector, val) => {
          document.querySelector(selector).value = val
        },
        args: [action.fill.selector, val]
      }
    } else if ('event' in action) {
      return {
        func: (selector, event) => {
          document.querySelector(selector).dispatchEvent(new Event(event))
        },
        args: [action.event.selector, action.event.event]
      }
    } else if ('wait' in action) {
      return {
        localFunc: makeTimeout(action.wait)
      }
    } else if ('failOnMissing' in action) {
      return {
        func: (selector) => document.querySelector(selector) !== null,
        args: [action.failOnMissing],
        resultFunc: (result) => {
          if (result === true) {
            return result
          }
          throw new Error(action.failure)
        }
      }
    } else if ('func' in action) {
      return {
        func: action.func,
        args: [this.userData]
      }
    } else if ('click' in action) {
      if (action.optional) {
        return {
          func: (selector) => {
            const el = document.querySelector(selector)
            if (el) {
              el.click()
            }
            return el === null
          },
          args: [action.click]
        }
      } else {
        return {
          func: (selector) => {
            document.querySelector(selector).click()
          },
          args: [action.click]
        }
      }
    } else if ('url' in action) {
      return {
        func: (url) => {
          document.location.href = url
        },
        args: [escapeJsString(action.url)]
      }
    } else if ('href' in action) {
      return {
        func: (selector) => {
          document.location.href = document.querySelector(selector).href
        },
        args: [action.href]
      }
    } else if ('captcha' in action) {
      return {
        func: (selector) => document.querySelector(selector) === null,
        args: [action.captcha],
        resultFunc: (result) => {
          if (result === true) {
            return result
          }
          return (sourceBot) => {
            sourceBot.callback({
              type: STATUS_MESSAGE,
              action: 'interaction_required'
            })
            return false
          }
        }
      }
    } else if ('extract' in action) {
      return {
        func: (selector) => Array.from(document.querySelectorAll(selector)).map((el) => el.outerHTML),
        args: [action.extract],
        resultFunc: (result) => {
          if (result.length > 0 && action.convert) {
            result = converters[action.convert](result)
          }
          return result
        }
      }
    }
  }
}

export default TabRunner
