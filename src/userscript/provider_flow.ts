import sources from '../sources.js'
import voebbProvider from '../voebb_provider.js'
import {
  buildSourceUserData,
  getSourceActionList,
  getSourceActions,
  getSourceParams,
  makeSourceUrl,
} from '../source_flow.js'
import type {
  Action,
  ArticleInfo,
  Provider,
  SiteSourceParams,
  Source,
  SourceIdentifier,
} from '../types.js'
import {
  PROVIDER_ID,
  SOURCE_ID,
} from './constants.js'
import type { BibbotJob } from './job_store.js'

export type Credentials = {
  username?: string
  password?: string
}

export type VerticalFlow = {
  provider: Provider
  source: Source
  providerId: string
  sourceId: SourceIdentifier
  sourceParams: SiteSourceParams
}

export type WorkerReference = {
  jobId: string
  originToken: string
  workerToken: string
}

export function getVerticalFlow(sourceParams: SiteSourceParams): VerticalFlow {
  const provider = voebbProvider as Provider
  const source = sources[SOURCE_ID]
  if (!provider || !source) {
    throw new Error('VÖBB/GENIOS-Konfiguration fehlt.')
  }
  return {
    provider,
    source,
    providerId: PROVIDER_ID,
    sourceId: SOURCE_ID,
    sourceParams,
  }
}

export function getActionList(flow: VerticalFlow, phase: 'login' | 'search') {
  return getSourceActionList(flow.provider, flow.source, phase)
}

export function getActions(
  flow: VerticalFlow,
  phase: 'login' | 'search',
  step: number,
) {
  return getSourceActions(flow.provider, flow.source, phase, step)
}

export function getParams(flow: VerticalFlow) {
  return getSourceParams(
    flow.provider,
    flow.sourceId,
    flow.source,
    flow.sourceParams,
  )
}

export function makeUrl(
  flow: VerticalFlow,
  value: string | ((articleInfo: ArticleInfo, sourceParams: SiteSourceParams) => string),
  articleInfo: ArticleInfo,
) {
  return makeSourceUrl(value, articleInfo, getParams(flow))
}

export function buildUserData(
  flow: VerticalFlow,
  credentials: Credentials,
) {
  const username = credentials.username || ''
  const password = credentials.password || ''
  return buildSourceUserData(flow.provider, flow.providerId, {
    [`${flow.providerId}.options.username`]: username,
    [`${flow.providerId}.options.password`]: password,
  })
}

export function actionKind(action: Action) {
  if ('fill' in action) return 'fill'
  if ('event' in action) return 'event'
  if ('failOnMissing' in action) return 'failOnMissing'
  if ('func' in action) return 'func'
  if ('click' in action) return 'click'
  if ('url' in action) return 'url'
  if ('href' in action) return 'href'
  if ('captcha' in action) return 'captcha'
  if ('extract' in action) return 'extract'
  if ('message' in action) return 'message'
  return 'unknown'
}

export function nextPosition(
  flow: VerticalFlow,
  phase: 'login' | 'search',
  step: number,
) {
  const actionList = getActionList(flow, phase)
  if (step + 1 < actionList.length) {
    return { phase, step: step + 1 }
  }
  if (phase === 'login') {
    return { phase: 'search' as const, step: 0 }
  }
  return null
}

export function nextActionPosition(
  flow: VerticalFlow,
  phase: 'login' | 'search',
  step: number,
  actionIndex: number,
  actionCount: number,
) {
  if (actionIndex + 1 < actionCount) {
    return { phase, step, actionIndex: actionIndex + 1 }
  }
  const groupPosition = nextPosition(flow, phase, step)
  if (!groupPosition) {
    return null
  }
  return { ...groupPosition, actionIndex: 0 }
}

export function withWorkerFragment(url: string, job: BibbotJob) {
  const parsed = new URL(url, job.originUrl)
  const fragment = new URLSearchParams()
  fragment.set('bibbot-job', job.id)
  fragment.set('bibbot-origin', job.originToken)
  fragment.set('bibbot-worker', job.workerToken)
  parsed.hash = fragment.toString()
  return parsed.toString()
}

export function parseWorkerReference(urlValue: string): WorkerReference | null {
  try {
    const url = new URL(urlValue)
    const params = new URLSearchParams(url.hash.replace(/^#/, ''))
    const jobId = params.get('bibbot-job')
    const originToken = params.get('bibbot-origin')
    const workerToken = params.get('bibbot-worker')
    if (!jobId || !originToken || !workerToken) {
      return null
    }
    return { jobId, originToken, workerToken }
  } catch {
    return null
  }
}

export function expectedLocation(
  action: Action,
  flow: VerticalFlow,
  job: BibbotJob,
) {
  if (!('url' in action)) {
    return {}
  }
  try {
    const url = new URL(
      makeUrl(flow, action.url, job.articleInfo as ArticleInfo),
      job.originUrl,
    )
    return { expectedHost: url.host, expectedPath: url.pathname }
  } catch {
    return {}
  }
}

export function buildWorkerStartUrl(flow: VerticalFlow, job: BibbotJob) {
  const start = flow.provider.start || flow.source.start
  return withWorkerFragment(
    makeUrl(flow, start, job.articleInfo as ArticleInfo),
    job,
  )
}
