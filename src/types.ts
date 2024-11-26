type TestExample = {
  url: string
  selectors: { query: string }
}

export type SourceIdentifier =
  | 'genios.de'
  | 'www.munzinger.de'
  | 'www.nexisuni.com'
  | 'old.genios.de'
export type DefaultSourceParams = {
  domain?: string
  scheme?: string
  portalId?: ''
}
type GeniosSourceParams = {
  dbShortcut?: string
  sourceNames?: string[]
}
export type SiteSourceParams = DefaultSourceParams & GeniosSourceParams

// eslint-disable-next-line no-use-before-define
type StringSelector =
  | string
  | string[]
  | ((root: HTMLElement, siteBot: SiteBotInterface) => string)
// eslint-disable-next-line no-use-before-define
type ElementSelector =
  | string
  | string[]
  | ((root: HTMLElement, siteBot: SiteBotInterface) => HTMLElement)
type DateRange = [offsetBefore: number, offsetAfter: number]
export type FormattedDateRange = {
  dateStart: string
  dateEnd: string
}

type Mimicer = string | ((content: string, main: HTMLElement) => string)
type ParagraphStyle = {
  className?: string
  style?: string
  selector?: string
}

export type RawArticleInfo = {
  query?: string
  edition?: string
  date?: string
}

export type ArticleInfo = {
  query?: string
  edition?: string
  dateStart?: string
  dateEnd?: string
}

export interface ExtractorInterface {
  shouldExtract(): boolean
  extractArticleInfo(): ArticleInfo
  runSelectorQuery(StringSelector): string
  getMainContentArea(): HTMLElement
  hasPaywall(): boolean
}

export interface SiteBotInterface {
  extractor: ExtractorInterface
  start(): void
  hideBot(): void
  startInfoExtraction(): ArticleInfo
  runSelectorQuery(StringSelector): string
}

export interface PartialSite {
  selectors: {
    query: StringSelector
    paywall: ElementSelector
    main: ElementSelector
    loader?: ElementSelector
    date?: StringSelector
    headline?: StringSelector
    edition?: StringSelector
  }
  start?: (root: HTMLElement, paywall: HTMLElement) => boolean | void
  mimic?: Mimicer
  insertContent?: (
    siteBot: SiteBotInterface,
    main: HTMLElement,
    content: string,
  ) => void
  waitOnLoad?: boolean | number
  paragraphStyle?: ParagraphStyle
  source: SourceIdentifier
  dateRange?: DateRange
  testSetup?: (page: PlaywrightPage) => Promise<void>
  examples?: TestExample[]
}

export interface Site extends PartialSite {
  sourceParams: SiteSourceParams
}

export type Sites = {
  [key: string]: Site
}

export type ProviderField = 'username' | 'password' | 'city' | 'name'

export type ProviderStorageOptions = {
  [key in ProviderField]?: string
}

export interface BibbotOptions {
  provider: string
  keepStats: boolean
  providerOptions: ProviderStorageOptions
  saveArticle: string | null
  disabledSites: string[]
}

export interface StorageItems extends BibbotOptions {
  installDate?: number | null
  stats?: {
    [key: string]: number
  }
}

export type InitMessage = {
  type: 'init'
  source: SourceIdentifier
  sourceParams: SiteSourceParams
  domain: string
  articleInfo: ArticleInfo
}

export type AbortMessage = {
  type: 'abort'
}

export type GoToTabMessage = {
  type: 'gototab'
}

export type StatusMessage = {
  type: 'status'
  message: string
  action?: 'interaction_required'
}

export type SuccessMessage = {
  type: 'success'
  content: string
  saveArticle?: string | null
}

export type FailedMessage = {
  type: 'failed'
  message: string
}

export type Message =
  | InitMessage
  | GoToTabMessage
  | StatusMessage
  | SuccessMessage
  | FailedMessage
  | AbortMessage

export type FillAction = {
  fill: {
    selector: string
    key?: string
    providerKey?: string
    value?: string
  }
}
export type ClickAction = {
  click: string
  optional?: boolean
  skipToNext?: boolean
}
export type MessageAction = {
  message: string
}
export type UrlAction = {
  url:
    | string
    | ((articleInfo: ArticleInfo, sourceParams: SiteSourceParams) => string)
}
export type FuncAction = {
  // eslint-disable-next-line no-use-before-define
  func: (userData: object) => void
}
export type HrefAction = {
  href: string
}
export type FailOnMissingAction = {
  failOnMissing: string
  failure: string
}
export type CaptchaAction = {
  captcha: string
}
export type WaitAction = {
  wait: number
}
export type EventAction = {
  event: {
    selector: string
    event: 'change' | 'input'
  }
}
export type ExtractAction = {
  extract: string
  convert?: string
}

export type Action =
  | FillAction
  | ClickAction
  | FuncAction
  | MessageAction
  | UrlAction
  | HrefAction
  | FailOnMissingAction
  | CaptchaAction
  | ExtractAction
  | WaitAction
  | EventAction
export type Actions = Action[]

export type Source = {
  loggedIn: string
  start: string
  defaultParams: DefaultSourceParams
  login: Actions[]
  search: Actions[]
}

export type Sources = {
  [key in SourceIdentifier]: Source
}

export type ProviderOptions = {
  id: ProviderField
  display: string
  type: 'text' | 'password'
}

export type ProviderSourceParams = {
  domain?: string
  scheme?: string
  portalId?: string
  startUrl?: string
}

export interface DefaultProvider {
  name: string
  bibName?: string
  web: string
  params: {
    [key in SourceIdentifier]?: ProviderSourceParams
  }
  defaultSource?: SourceIdentifier
  start?: string
  login: Actions[]
  options: ProviderOptions[]
}
export interface Provider extends DefaultProvider {
  permissions: string[]
}

export type Providers = {
  [key: string]: Provider
}
