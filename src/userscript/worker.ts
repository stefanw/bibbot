import type { Action } from '../types.js'
import { POLL_INTERVAL_MS, TAB_DATA_KEY } from './constants.js'
import { UserscriptActionRunner } from './action_runner.js'
import type { BibbotJob, JobPhase, PendingAction } from './job_store.js'
import { JobStore, redactError } from './job_store.js'
import {
  actionKind,
  buildUserData,
  expectedLocation,
  getActions,
  getVerticalFlow,
  makeUrl,
  nextActionPosition,
  nextPosition,
  parseWorkerReference,
  type WorkerReference,
} from './provider_flow.js'
import { loadCredentials } from './settings.js'
import type { UserscriptRuntime } from './runtime.js'

function phaseStatus(phase: JobPhase) {
  return phase === 'login' ? 'login' : 'search'
}

function navigationFragment(reference: WorkerReference) {
  const params = new URLSearchParams()
  params.set('bibbot-job', reference.jobId)
  params.set('bibbot-origin', reference.originToken)
  params.set('bibbot-worker', reference.workerToken)
  return params.toString()
}

export class WorkerController {
  private runtime: UserscriptRuntime
  private store: JobStore
  private running = false
  private stopped = false
  private removeListener: (() => void) | null = null
  private pollHandle: ReturnType<typeof setInterval> | null = null

  constructor(runtime: UserscriptRuntime, store = new JobStore(runtime)) {
    this.runtime = runtime
    this.store = store
  }

  start() {
    this.removeListener = this.store.onChange(() => {
      this.resume().catch(() => undefined)
    })
    for (const eventName of ['pageshow', 'visibilitychange', 'focus']) {
      window.addEventListener(eventName, () => {
        this.resume().catch(() => undefined)
      })
    }
    this.pollHandle = setInterval(() => {
      this.resume().catch(() => undefined)
    }, POLL_INTERVAL_MS)
    this.resume().catch(() => undefined)
  }

  stop() {
    this.stopped = true
    this.removeListener?.()
    this.removeListener = null
    if (this.pollHandle !== null) {
      clearInterval(this.pollHandle)
      this.pollHandle = null
    }
  }

  private async resume() {
    if (this.running || this.stopped) {
      return
    }
    this.running = true
    try {
      const resolved = await this.findJob()
      if (!resolved) {
        this.stop()
        return
      }
      let job = resolved.job
      const flow = getVerticalFlow(job.sourceParams)

      await this.runtime.saveTab({
        [TAB_DATA_KEY]: {
          role: 'worker',
          jobId: job.id,
          originToken: job.originToken,
          workerToken: job.workerToken,
          host: location.host,
          path: location.pathname,
        },
      })

      if (job.status === 'busy') {
        job = await this.store.workerUpdate(
          job.id,
          resolved.reference.workerToken,
          {
            status: 'login',
            message: 'Bibliothekskonto wird geprüft...',
          },
        )
      }
      if (
        job.status === 'complete' ||
        job.status === 'failed' ||
        job.status === 'cancelled' ||
        job.status === 'expired'
      ) {
        this.stop()
        return
      }

      if (job.pendingAction) {
        job = await this.reconcilePending(job, resolved.reference.workerToken)
      }

      if (job.phase === 'login' && job.step === 0 && this.isLoggedIn(flow)) {
        job = await this.store.workerUpdate(
          job.id,
          resolved.reference.workerToken,
          {
            phase: 'search',
            step: 0,
            actionIndex: 0,
            pendingAction: null,
            status: 'search',
            message: 'Pressedatenbank wird aufgerufen...',
          },
        )
      }

      await this.runActions(job, flow, resolved.reference)
    } catch (error) {
      const resolved = await this.findJob().catch(() => null)
      if (resolved) {
        await this.fail(resolved.job, resolved.reference.workerToken, error, [])
      }
    } finally {
      this.running = false
    }
  }

  private async findJob() {
    const reference = parseWorkerReference(window.location.href)
    let tabData: Record<string, unknown> = {}
    try {
      tabData = await this.runtime.getTab()
    } catch {
      tabData = {}
    }
    const marker = tabData[TAB_DATA_KEY]
    const markerReference =
      marker && typeof marker === 'object'
        ? {
            jobId: (marker as Record<string, unknown>).jobId,
            originToken: (marker as Record<string, unknown>).originToken,
            workerToken: (marker as Record<string, unknown>).workerToken,
          }
        : null
    const candidate =
      reference ||
      (markerReference &&
      typeof markerReference.jobId === 'string' &&
      typeof markerReference.originToken === 'string' &&
      typeof markerReference.workerToken === 'string'
        ? (markerReference as WorkerReference)
        : null)
    if (!candidate) {
      return null
    }
    const job = await this.store.get(candidate.jobId)
    if (
      !job ||
      job.originToken !== candidate.originToken ||
      job.workerToken !== candidate.workerToken
    ) {
      return null
    }
    return { job, reference: candidate }
  }

  private isLoggedIn(flow: ReturnType<typeof getVerticalFlow>) {
    return document.querySelector(flow.source.loggedIn) !== null
  }

  private async reconcilePending(job: BibbotJob, workerToken: string) {
    const pending = job.pendingAction
    if (!pending) {
      return job
    }
    if (!pending.nextPhase || pending.nextStep === undefined) {
      return job
    }
    return await this.store.workerUpdate(job.id, workerToken, {
      phase: pending.nextPhase,
      step: pending.nextStep,
      actionIndex: pending.nextActionIndex || 0,
      pendingAction: null,
      status: phaseStatus(pending.nextPhase),
    })
  }

  private async runActions(
    initialJob: BibbotJob,
    flow: ReturnType<typeof getVerticalFlow>,
    reference: WorkerReference,
  ) {
    let job = initialJob
    const credentials = await loadCredentials(this.runtime, job.providerId)
    const userData = buildUserData(flow, credentials)
    const secrets = Object.values(credentials).filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    )
    const runner = new UserscriptActionRunner(userData, {
      navigationFragment: navigationFragment(reference),
    })
    const actions = getActions(flow, job.phase, job.step)
    let lastValue: unknown

    for (let index = job.actionIndex; index < actions.length; index += 1) {
      const current = await this.store.get(job.id)
      if (!current || current.workerToken !== reference.workerToken) {
        return
      }
      job = current
      const action = this.prepareAction(actions[index], flow, job)
      const next = nextActionPosition(
        flow,
        job.phase,
        job.step,
        index,
        actions.length,
      )
      const pending: PendingAction = {
        phase: job.phase,
        step: job.step,
        actionIndex: index,
        kind: actionKind(action),
        ...(next
          ? {
              nextPhase: next.phase,
              nextStep: next.step,
              nextActionIndex: next.actionIndex,
            }
          : {}),
        ...expectedLocation(action, flow, job),
      }
      if (this.isPotentiallyNavigational(action)) {
        job = await this.store.workerUpdate(
          job.id,
          reference.workerToken,
          { pendingAction: pending, status: phaseStatus(job.phase) },
          secrets,
        )
      }

      let result
      try {
        result = await runner.runAction(action)
      } catch (error) {
        await this.fail(job, reference.workerToken, error, secrets)
        return
      }
      if (result.waiting) {
        await this.store.workerUpdate(
          job.id,
          reference.workerToken,
          {
            pendingAction: null,
            status: 'waiting-interaction',
            message:
              'Bitte die CAPTCHA-/Anmeldeprüfung im geöffneten Tab abschließen.',
          },
          secrets,
        )
        return
      }
      if (result.message) {
        await this.store.workerUpdate(
          job.id,
          reference.workerToken,
          { message: result.message, status: phaseStatus(job.phase) },
          secrets,
        )
      }
      if (result.value !== undefined) {
        lastValue = result.value
      }

      if (result.navigates) {
        if (next) {
          await this.store.workerUpdate(
            job.id,
            reference.workerToken,
            {
              phase: next.phase,
              step: next.step,
              actionIndex: next.actionIndex,
              pendingAction: null,
              status: phaseStatus(next.phase),
            },
            secrets,
          )
        }
        return
      }
      job = await this.store.workerUpdate(
        job.id,
        reference.workerToken,
        {
          actionIndex: index + 1,
          pendingAction: null,
          status: phaseStatus(job.phase),
        },
        secrets,
      )
    }

    const afterGroup = nextPosition(flow, job.phase, job.step)
    if (!afterGroup) {
      const content = typeof lastValue === 'string' ? lastValue : ''
      if (!content.trim()) {
        await this.fail(
          job,
          reference.workerToken,
          new Error('Artikel nicht gefunden'),
          secrets,
        )
        return
      }
      await this.store.workerUpdate(
        job.id,
        reference.workerToken,
        {
          status: 'complete',
          phase: 'search',
          actionIndex: actions.length,
          pendingAction: null,
          resultHtml: content,
          message: 'Artikel gefunden.',
        },
        secrets,
      )
      window.setTimeout(() => {
        try {
          window.close()
        } catch {
          // Closing a Tampermonkey-created tab is best effort on iOS.
        }
      }, 0)
      return
    }
    await this.store.workerUpdate(
      job.id,
      reference.workerToken,
      {
        phase: afterGroup.phase,
        step: afterGroup.step,
        actionIndex: 0,
        pendingAction: null,
        status: phaseStatus(afterGroup.phase),
      },
      secrets,
    )
  }

  private prepareAction(
    action: Action,
    flow: ReturnType<typeof getVerticalFlow>,
    job: BibbotJob,
  ): Action {
    if ('url' in action) {
      return {
        ...action,
        url: makeUrl(flow, action.url, job.articleInfo),
      }
    }
    return action
  }

  private isPotentiallyNavigational(action: Action) {
    return 'url' in action || 'href' in action || 'click' in action
  }

  private async fail(
    job: BibbotJob,
    workerToken: string,
    error: unknown,
    secrets: string[],
  ) {
    try {
      await this.store.workerUpdate(
        job.id,
        workerToken,
        {
          status: 'failed',
          pendingAction: null,
          message: 'Artikel konnte nicht geladen werden.',
          error: redactError(error, secrets),
        },
        secrets,
      )
    } catch {
      // A stale/expired job must not create a second visible failure.
    }
  }
}
