import userscriptSites from './site_definitions.js'

export const SCHEMA_VERSION = 1

export const PROVIDER_ID = 'voebb.de'
export const SOURCE_ID = 'genios.de'

export const ORIGIN_HOSTS = Object.freeze(Object.keys(userscriptSites))

export const ACTIVE_JOB_KEY = 'bibbot:ios:v1:active-job'
export const EVENT_HINT_KEY = 'bibbot:ios:v1:last-event'
export const EVENT_KEY_PREFIX = 'bibbot:ios:v1:event:'
export const SETTINGS_KEY = 'bibbot:ios:v1:settings'
export const SETTINGS_REQUEST_KEY = 'bibbot:ios:v1:settings-request'
export const CREDENTIAL_KEY_PREFIX = 'bibbot:ios:v1:credential:'
export const TAB_DATA_KEY = 'bibbot:ios:v1:tab'
export const PAGE_MARKER = 'data-bibbot-ios-top'

export const DEFAULT_SETTINGS = {
  workerActive: false,
}

export const JOB_TTL_MS = 15 * 60 * 1000
export const POLL_INTERVAL_MS = 1500
export const SELECTOR_TIMEOUT_MS = 10000
export const SETTINGS_REQUEST_TTL_MS = 60 * 1000

export function isOriginHost(hostname: string) {
  return ORIGIN_HOSTS.includes(hostname)
}

export function isWorkerLocation(location: Location) {
  if (location.protocol !== 'https:') {
    return false
  }
  if (location.hostname === 'bib-voebb.genios.de') {
    return true
  }
  return (
    location.hostname === 'www.voebb.de' &&
    location.pathname.startsWith('/oidcp/authorize')
  )
}

export function isSettingsLocation(location: Location) {
  return (
    location.protocol === 'https:' &&
    location.hostname === 'bib-voebb.genios.de'
  )
}
