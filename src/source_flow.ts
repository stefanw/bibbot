import type {
  ArticleInfo,
  Provider,
  SiteSourceParams,
  Source,
  SourceIdentifier,
  UrlAction,
} from './types.js'
import { interpolate } from './utils.js'

export type SourcePhase = 'login' | 'search'

export function getSourceParams(
  provider: Provider,
  sourceId: SourceIdentifier,
  source: Source,
  sourceParams: SiteSourceParams,
) {
  return Object.assign(
    {},
    source.defaultParams || {},
    provider.params[sourceId],
    sourceParams,
  )
}

export function getSourceActionList(
  provider: Provider,
  source: Source,
  phase: SourcePhase,
) {
  return provider[phase] || source[phase]
}

export function getSourceActions(
  provider: Provider,
  source: Source,
  phase: SourcePhase,
  step: number,
) {
  const actions = getSourceActionList(provider, source, phase)[step]
  if (!Array.isArray(actions)) {
    throw new Error('Unknown action in source')
  }
  return actions
}

export function buildSourceUserData(
  provider: Provider,
  providerId: string,
  providerOptions: Record<string, unknown>,
) {
  const userData: Record<string, unknown> = {
    bibName: provider.bibName || provider.name,
    ...providerOptions,
  }
  for (const key of ['options.username', 'options.password']) {
    const providerValue = userData[`${providerId}.${key}`]
    if (providerValue !== undefined) {
      userData[key] = providerValue
    }
  }
  return userData
}

export function makeSourceUrl(
  value: string | UrlAction['url'],
  articleInfo: ArticleInfo,
  sourceParams: SiteSourceParams,
) {
  if (typeof value === 'function') {
    return value(articleInfo, sourceParams)
  }
  let url = interpolate(value, articleInfo, '', encodeURIComponent)
  url = interpolate(url, sourceParams, 'source', encodeURIComponent)
  return url
}
