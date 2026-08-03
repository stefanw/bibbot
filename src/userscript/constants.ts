import userscriptSites from './site_definitions.js'

export const SCRIPT_NAMESPACE = 'https://github.com/stefanw/bibbot/tampermonkey-ios'
export const SCHEMA_VERSION = 1

export const PROVIDER_ID = 'voebb.de'
export const SOURCE_ID = 'genios.de'

export const ORIGIN_HOSTS = Object.freeze(Object.keys(userscriptSites))
export const WORKER_HOSTS = ['bib-voebb.genios.de', 'www.voebb.de'] as const

export const USERSCRIPT_MATCHES = [
  ...ORIGIN_HOSTS.map((host) => `https://${host}/*`),
  'https://bib-voebb.genios.de/*',
  'https://www.voebb.de/oidcp/authorize*',
]

export const USERSCRIPT_GRANTS = [
  'GM_info',
  'GM_getValue',
  'GM_setValue',
  'GM_deleteValue',
  'GM_listValues',
  'GM_addValueChangeListener',
  'GM_removeValueChangeListener',
  'GM_getTab',
  'GM_saveTab',
  'GM_getTabs',
  'GM_openInTab',
  'GM_registerMenuCommand',
] as const

export const ACTIVE_JOB_KEY = 'bibbot:ios:v1:active-job'
export const EVENT_HINT_KEY = 'bibbot:ios:v1:last-event'
export const EVENT_KEY_PREFIX = 'bibbot:ios:v1:event:'
export const SETTINGS_KEY = 'bibbot:ios:v1:settings'
export const CREDENTIAL_KEY_PREFIX = 'bibbot:ios:v1:credential:'
export const TAB_DATA_KEY = 'bibbot:ios:v1:tab'
export const PAGE_MARKER = 'data-bibbot-ios-top'

export const DEFAULT_SETTINGS = {
  provider: PROVIDER_ID,
  workerActive: false,
  saveArticle: null,
  disabledSites: [] as string[],
}

export const JOB_TTL_MS = 15 * 60 * 1000
export const POLL_INTERVAL_MS = 1500
export const SELECTOR_TIMEOUT_MS = 10000

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
