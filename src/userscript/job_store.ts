import {
  ACTIVE_JOB_KEY,
  EVENT_HINT_KEY,
  EVENT_KEY_PREFIX,
  JOB_TTL_MS,
  SCHEMA_VERSION,
} from './constants.js'
import { randomToken, type UserscriptRuntime } from './runtime.js'

export type JobPhase = 'login' | 'search'
export type JobStatus =
  | 'busy'
  | 'login'
  | 'search'
  | 'waiting-interaction'
  | 'complete'
  | 'failed'
  | 'cancelled'
  | 'expired'

export type JobError = {
  name: string
  message: string
}

export type PendingAction = {
  phase: JobPhase
  step: number
  actionIndex: number
  kind: string
  nextPhase?: JobPhase
  nextStep?: number
  nextActionIndex?: number
  expectedHost?: string
  expectedPath?: string
}

export type ArticleFingerprintInput = {
  originUrl: string
  articleInfo: Record<string, unknown>
}

export type BibbotJob = {
  schemaVersion: number
  id: string
  revision: number
  createdAt: number
  updatedAt: number
  expiresAt: number
  lastHeartbeatAt: number
  originUrl: string
  originDomain: string
  originToken: string
  workerToken: string
  articleFingerprint: string
  providerId: string
  sourceId: string
  sourceParams: Record<string, unknown>
  articleInfo: Record<string, unknown>
  phase: JobPhase
  step: number
  actionIndex: number
  pendingAction: PendingAction | null
  status: JobStatus
  message: string
  resultHtml?: string
  resultRevision?: number
  acknowledgedAt?: number
  error?: JobError
}

type CreateJobInput = {
  originUrl: string
  originDomain: string
  originToken: string
  workerToken: string
  articleFingerprint: string
  providerId: string
  sourceId: string
  sourceParams: Record<string, unknown>
  articleInfo: Record<string, unknown>
  ttlMs?: number
}

type JobEvent = {
  schemaVersion: number
  eventId: string
  jobId: string
  createdAt: number
  writer: 'origin' | 'worker' | 'system'
  patch: Record<string, unknown>
}

const SECRET_KEY =
  /password|username|credential|provider.?options|user.?data|form.?value/i
const SENSITIVE_TEXT =
  /(?:password|passwd|passwort|username|user|credential|token)\s*[:=]\s*[^\s&]+/gi
const MAX_RESULT_HTML_LENGTH = 2 * 1024 * 1024

export class JobBusyError extends Error {
  constructor() {
    super('Ein anderer BibBot-Vorgang läuft bereits.')
    this.name = 'JobBusyError'
  }
}

export class JobOwnershipError extends Error {
  constructor() {
    super('Der BibBot-Vorgang gehört zu einem anderen Tab.')
    this.name = 'JobOwnershipError'
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizeText(value: unknown, secrets: string[] = []) {
  let result = typeof value === 'string' ? value : String(value ?? '')
  for (const secret of secrets) {
    if (secret.length > 0) {
      result = result.split(secret).join('[redacted]')
    }
  }
  return result.replace(SENSITIVE_TEXT, '[redacted]').slice(0, 500)
}

function safeUrl(value: string) {
  try {
    const url = new URL(value)
    // Query strings and fragments are not needed to resume an article and may
    // contain user-controlled values. They never enter the job record.
    return `${url.origin}${url.pathname}`
  } catch {
    return 'about:blank'
  }
}

function sanitizeValue(
  value: unknown,
  key = '',
  secrets: string[] = [],
): unknown {
  if (SECRET_KEY.test(key)) {
    return undefined
  }
  if (typeof value === 'string') {
    return normalizeText(value, secrets)
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeValue(item, key, secrets))
      .filter((item) => item !== undefined)
  }
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {}
    for (const [childKey, childValue] of Object.entries(value)) {
      const sanitized = sanitizeValue(childValue, childKey, secrets)
      if (sanitized !== undefined) {
        output[childKey] = sanitized
      }
    }
    return output
  }
  return value
}

function sanitizePatch(patch: Record<string, unknown>, secrets: string[] = []) {
  const { resultHtml, ...otherValues } = patch
  const sanitized = sanitizeValue(otherValues, '', secrets)
  const output = (
    sanitized && typeof sanitized === 'object' ? sanitized : {}
  ) as Record<string, unknown>
  if (typeof resultHtml === 'string') {
    let safeResult = resultHtml
    for (const secret of secrets) {
      if (secret.length > 0) {
        safeResult = safeResult.split(secret).join('[redacted]')
      }
    }
    output.resultHtml = safeResult.slice(0, MAX_RESULT_HTML_LENGTH)
  }
  return output
}

function isTerminal(job: BibbotJob) {
  return (
    job.status === 'complete' ||
    job.status === 'failed' ||
    job.status === 'cancelled' ||
    job.status === 'expired'
  )
}

function isBlocking(job: BibbotJob) {
  return !isTerminal(job) || (job.status === 'complete' && !job.acknowledgedAt)
}

function eventKey(jobId: string, eventId: string) {
  return `${EVENT_KEY_PREFIX}${jobId}:${eventId}`
}

function compareEvents(a: JobEvent, b: JobEvent) {
  if (a.createdAt !== b.createdAt) {
    return a.createdAt - b.createdAt
  }
  const writerOrder = { worker: 0, origin: 1, system: 2 }
  if (writerOrder[a.writer] !== writerOrder[b.writer]) {
    return writerOrder[a.writer] - writerOrder[b.writer]
  }
  return a.eventId.localeCompare(b.eventId)
}

function asJob(value: unknown): BibbotJob | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const job = value as Partial<BibbotJob>
  if (
    job.schemaVersion !== SCHEMA_VERSION ||
    typeof job.id !== 'string' ||
    typeof job.originToken !== 'string' ||
    typeof job.workerToken !== 'string' ||
    typeof job.status !== 'string'
  ) {
    return null
  }
  return clone(job as BibbotJob)
}

function applyEvent(job: BibbotJob, event: JobEvent) {
  const next = {
    ...job,
    ...(event.patch as Partial<BibbotJob>),
    revision: Math.max(
      job.revision,
      Number(event.patch.revision) || job.revision,
    ),
    updatedAt: Math.max(job.updatedAt, event.createdAt),
  }
  if (next.resultHtml && !next.resultRevision) {
    next.resultRevision = next.revision
  }
  return next
}

export function fingerprintArticle(input: ArticleFingerprintInput) {
  const source = `${safeUrl(input.originUrl)}|${JSON.stringify(input.articleInfo)}`
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `article-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export function redactError(error: unknown, secrets: string[] = []): JobError {
  const name =
    error && typeof error === 'object' && 'name' in error
      ? normalizeText((error as { name?: unknown }).name, [])
      : 'Error'
  const message =
    error && typeof error === 'object' && 'message' in error
      ? normalizeText((error as { message?: unknown }).message, secrets)
      : normalizeText(error, secrets)
  return {
    name: name || 'Error',
    message: message || 'Unbekannter Fehler',
  }
}

export class JobStore {
  private runtime: UserscriptRuntime
  private now: () => number
  private lastEventTime = 0

  constructor(runtime: UserscriptRuntime, now: () => number = Date.now) {
    this.runtime = runtime
    this.now = now
  }

  async create(input: CreateJobInput) {
    const existing = await this.getActive()
    if (existing && isBlocking(existing)) {
      throw new JobBusyError()
    }
    if (existing) {
      await this.remove(existing.id)
    }

    const timestamp = this.now()
    const job: BibbotJob = {
      schemaVersion: SCHEMA_VERSION,
      id: randomToken('job'),
      revision: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      expiresAt: timestamp + (input.ttlMs || JOB_TTL_MS),
      lastHeartbeatAt: timestamp,
      originUrl: safeUrl(input.originUrl),
      originDomain: input.originDomain,
      originToken: input.originToken,
      workerToken: input.workerToken,
      articleFingerprint: input.articleFingerprint,
      providerId: input.providerId,
      sourceId: input.sourceId,
      sourceParams: clone(
        sanitizeValue(input.sourceParams) as Record<string, unknown>,
      ),
      articleInfo: clone(
        sanitizeValue(input.articleInfo) as Record<string, unknown>,
      ),
      phase: 'login',
      step: 0,
      actionIndex: 0,
      pendingAction: null,
      status: 'busy',
      message: 'Pressedatenbank wird aufgerufen...',
    }
    await this.runtime.setValue(ACTIVE_JOB_KEY, job)
    await this.runtime.setValue(EVENT_HINT_KEY, {
      jobId: job.id,
      eventId: 'created',
      revision: job.revision,
    })
    return job
  }

  async getActive() {
    const raw = await this.runtime.getValue<unknown>(ACTIVE_JOB_KEY, null)
    let job = asJob(raw)
    if (!job) {
      return null
    }
    job = await this.reduce(job)
    if (
      job.status === 'complete' &&
      !job.acknowledgedAt &&
      job.expiresAt <= this.now()
    ) {
      await this.remove(job.id)
      return null
    }
    if (!isTerminal(job) && job.expiresAt <= this.now()) {
      await this.systemUpdate(job.id, {
        status: 'expired',
        message: 'Der BibBot-Vorgang ist abgelaufen.',
        pendingAction: null,
      })
      job = await this.reduce(job)
    }
    return job
  }

  async get(id: string) {
    const job = await this.getActive()
    return job && job.id === id ? job : null
  }

  async workerUpdate(
    id: string,
    workerToken: string,
    patch: Record<string, unknown>,
    secrets: string[] = [],
  ) {
    return await this.append(id, 'worker', workerToken, patch, secrets)
  }

  async originUpdate(
    id: string,
    originToken: string,
    patch: Record<string, unknown>,
  ) {
    return await this.append(id, 'origin', originToken, patch)
  }

  async acknowledge(id: string, originToken: string) {
    const current = await this.get(id)
    if (!current || current.originToken !== originToken) {
      throw new JobOwnershipError()
    }
    if (current.status !== 'complete') {
      return current
    }
    return await this.originUpdate(id, originToken, {
      acknowledgedAt: this.now(),
    })
  }

  async cancel(id: string, originToken: string) {
    return await this.originUpdate(id, originToken, {
      status: 'cancelled',
      pendingAction: null,
      message: 'Der BibBot-Vorgang wurde abgebrochen.',
    })
  }

  async expire(id: string) {
    return await this.systemUpdate(id, {
      status: 'expired',
      pendingAction: null,
      message: 'Der BibBot-Vorgang ist abgelaufen.',
    })
  }

  onChange(listener: () => void) {
    const ids = [
      this.runtime.addValueChangeListener(EVENT_HINT_KEY, () => listener()),
      this.runtime.addValueChangeListener(ACTIVE_JOB_KEY, () => listener()),
    ]
    return () => ids.forEach((id) => this.runtime.removeValueChangeListener(id))
  }

  async remove(id: string) {
    const active = asJob(
      await this.runtime.getValue<unknown>(ACTIVE_JOB_KEY, null),
    )
    if (active?.id === id) {
      await this.runtime.deleteValue(ACTIVE_JOB_KEY)
    }
    const hint = await this.runtime.getValue<{ jobId?: string } | null>(
      EVENT_HINT_KEY,
      null,
    )
    if (hint?.jobId === id) {
      await this.runtime.deleteValue(EVENT_HINT_KEY)
    }
    const values = await this.runtime.listValues()
    const prefix = `${EVENT_KEY_PREFIX}${id}:`
    await Promise.all(
      values
        .filter((key) => key.startsWith(prefix))
        .map((key) => this.runtime.deleteValue(key)),
    )
  }

  private async systemUpdate(id: string, patch: Record<string, unknown>) {
    return await this.append(id, 'system', null, patch)
  }

  private async append(
    id: string,
    writer: 'origin' | 'worker' | 'system',
    ownerToken: string | null,
    patch: Record<string, unknown>,
    secrets: string[] = [],
  ) {
    const current = await this.readStored(id)
    if (!current) {
      throw new Error('BibBot-Vorgang nicht gefunden.')
    }
    if (writer === 'origin' && current.originToken !== ownerToken) {
      throw new JobOwnershipError()
    }
    if (writer === 'worker' && current.workerToken !== ownerToken) {
      throw new JobOwnershipError()
    }
    if (isTerminal(current) && writer !== 'origin') {
      return current
    }

    const eventId = randomToken('event')
    const eventTime = this.eventTime()
    const event: JobEvent = {
      schemaVersion: SCHEMA_VERSION,
      eventId,
      jobId: id,
      createdAt: eventTime,
      writer,
      patch: sanitizePatch(
        {
          ...patch,
          revision: current.revision + 1,
          lastHeartbeatAt: eventTime,
        },
        secrets,
      ),
    }
    await this.runtime.setValue(eventKey(id, eventId), event)
    await this.runtime.setValue(EVENT_HINT_KEY, {
      jobId: id,
      eventId,
      revision: event.patch.revision,
    })
    return applyEvent(current, event)
  }

  private eventTime() {
    const timestamp = Math.max(this.now(), this.lastEventTime + 1)
    this.lastEventTime = timestamp
    return timestamp
  }

  private async reduce(base: BibbotJob) {
    const values = await this.runtime.listValues()
    const prefix = `${EVENT_KEY_PREFIX}${base.id}:`
    const events: JobEvent[] = []
    for (const key of values.filter((value) => value.startsWith(prefix))) {
      const event = await this.runtime.getValue<unknown>(key, null)
      if (
        event &&
        typeof event === 'object' &&
        (event as JobEvent).jobId === base.id &&
        (event as JobEvent).schemaVersion === SCHEMA_VERSION
      ) {
        events.push(event as JobEvent)
      }
    }
    return events.sort(compareEvents).reduce(applyEvent, clone(base))
  }

  private async readStored(id: string) {
    const raw = await this.runtime.getValue<unknown>(ACTIVE_JOB_KEY, null)
    const base = asJob(raw)
    if (!base || base.id !== id) {
      return null
    }
    return await this.reduce(base)
  }
}
