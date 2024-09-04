import * as browser from 'webextension-polyfill'

const ident = (x) => x

function interpolate (str, params, prefix = '', converter = ident, fallback = '') {
  if (prefix.length > 0) {
    prefix = `${prefix}\\.`
  }
  for (const key in params) {
    str = str.replace(
      new RegExp(`{${prefix}${key}}`),
      converter(params[key] || fallback)
    )
    str = str.replace(
      new RegExp(`{${prefix}${key}\\.raw}`),
      params[key] || fallback
    )
  }
  return str
}

function makeTimeout (duration: number) {
  return function (tabrunner) {
    return new Promise((resolve) => {
      browser.alarms.create(`tab${tabrunner.tabId}`, { delayInMinutes: duration / 60.0 / 1000.0 })
      const listener = (alarm) => {
        if (alarm.name === `tab${tabrunner.tabId}`) {
          browser.alarms.onAlarm.removeListener(listener)
          resolve(null)
        }
      }
      browser.alarms.onAlarm.addListener(listener)
    })
  }
}

const escapeJsString = (str) => {
  return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
}

export {
  escapeJsString, interpolate, makeTimeout
}
