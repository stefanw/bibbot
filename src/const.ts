import { StorageItems } from './types.js'

export const LOG_NAME = 'BibBot'
export const PORT_NAME = 'port-from-cs'
export const INIT_MESSAGE = 'init'
export const GOTOTAB_MESSAGE = 'gototab'
export const SUCCESS_MESSAGE = 'success'
export const FAILED_MESSAGE = 'failed'
export const ABORT_MESSAGE = 'abort'
export const STATUS_MESSAGE = 'status'
export const DEFAULT_PROVIDER = 'voebb.de'

export const storageDefaults: StorageItems = {
  installDate: null,
  provider: DEFAULT_PROVIDER,
  keepStats: true,
  stats: {},
  providerOptions: {},
  saveArticle: null,
  disabledSites: [],
}
