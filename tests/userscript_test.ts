import assert from 'node:assert/strict'

import completeSites from '../src/sites.js'
import voebbProvider from '../src/voebb_provider.js'
import { UserscriptActionRunner } from '../src/userscript/action_runner.js'
import { hasOriginOwner } from '../src/userscript/article_controller.js'
import {
  ACTIVE_JOB_KEY,
  CREDENTIAL_KEY_PREFIX,
  EVENT_HINT_KEY,
  ORIGIN_HOSTS,
  PROVIDER_ID,
  TAB_DATA_KEY,
  USERSCRIPT_MATCHES,
} from '../src/userscript/constants.js'
import userscriptSites from '../src/userscript/site_definitions.js'
import {
  JobBusyError,
  JobStore,
  fingerprintArticle,
  type BibbotJob,
} from '../src/userscript/job_store.js'
import {
  buildWorkerStartUrl,
  getVerticalFlow,
  parseWorkerReference,
} from '../src/userscript/provider_flow.js'
import {
  deleteAllCredentials,
  loadCredentials,
  saveCredentials,
} from '../src/userscript/settings.js'
import type {
  ChangeListener,
  OpenTabHandle,
  RuntimeInfo,
  TabData,
  UserscriptRuntime,
} from '../src/userscript/runtime.js'

class FakeRuntime implements UserscriptRuntime {
  values = new Map<string, unknown>()
  tab: TabData = {}
  listeners = new Map<number, { key: string; listener: ChangeListener }>()
  nextListenerId = 1
  opened: Array<{ url: string; active: boolean }> = []
  closedTabs = 0

  async getValue<T>(key: string, fallback: T) {
    return (this.values.has(key) ? this.values.get(key) : fallback) as T
  }

  async setValue<T>(key: string, value: T) {
    const oldValue = this.values.get(key)
    this.values.set(key, value)
    for (const { key: listenerKey, listener } of this.listeners.values()) {
      if (listenerKey === key) {
        listener(key, oldValue, value, true)
      }
    }
  }

  async deleteValue(key: string) {
    const oldValue = this.values.get(key)
    this.values.delete(key)
    for (const { key: listenerKey, listener } of this.listeners.values()) {
      if (listenerKey === key) {
        listener(key, oldValue, undefined, true)
      }
    }
  }

  async listValues() {
    return Array.from(this.values.keys())
  }

  addValueChangeListener(key: string, listener: ChangeListener) {
    const id = this.nextListenerId++
    this.listeners.set(id, { key, listener })
    return id
  }

  removeValueChangeListener(listenerId: number | null) {
    if (listenerId !== null) {
      this.listeners.delete(listenerId)
    }
  }

  async getTab() {
    return JSON.parse(JSON.stringify(this.tab)) as TabData
  }

  async saveTab(data: TabData) {
    this.tab = JSON.parse(JSON.stringify(data)) as TabData
  }

  async getTabs() {
    return { current: this.tab }
  }

  async openInTab(
    url: string,
    options: { active: boolean; setParent?: boolean },
  ): Promise<OpenTabHandle> {
    this.opened.push({ url, active: options.active })
    return {
      closed: false,
      close: () => {
        this.closedTabs += 1
      },
    }
  }

  registerMenuCommand() {
    return 1
  }

  info(): RuntimeInfo {
    return {
      handlerName: 'fake',
      isIncognito: false,
      scriptName: 'fake',
      scriptVersion: 'test',
    }
  }
}

async function testJobStore() {
  const runtime = new FakeRuntime()
  let now = 1000
  const store = new JobStore(runtime, () => now)
  const originToken = 'origin-test'
  const workerToken = 'worker-test'
  const articleInfo = { query: 'Ein sicherer Artikel', dateStart: '01.01.2026' }
  const fingerprint = fingerprintArticle({
    originUrl: 'https://www.zeit.de/story?utm_source=test',
    articleInfo,
  })
  const job = await store.create({
    originUrl: 'https://www.zeit.de/story?password=never-store-this',
    originDomain: 'www.zeit.de',
    originToken,
    workerToken,
    articleFingerprint: fingerprint,
    providerId: PROVIDER_ID,
    sourceId: 'genios.de',
    sourceParams: { domain: 'bib-voebb.genios.de' },
    articleInfo,
  })
  assert.equal(job.status, 'busy')
  await runtime.setValue(`${CREDENTIAL_KEY_PREFIX}voebb.de:password`, 'never-store-this')
  await store.workerUpdate(job.id, workerToken, {
    status: 'login',
    message: 'status secret=never-store-this',
  }, ['never-store-this'])
  const afterStatus = await store.get(job.id)
  assert.equal(afterStatus?.status, 'login')
  assert(!JSON.stringify(afterStatus).includes('never-store-this'))
  assert(!JSON.stringify(afterStatus).includes('password=never-store-this'))

  const longArticle = `<p>${'Langartikel '.repeat(2000)}never-store-this</p>`
  await store.workerUpdate(job.id, workerToken, {
    status: 'complete',
    resultHtml: longArticle,
    message: 'Artikel gefunden.',
  }, ['never-store-this'])
  const completed = await store.get(job.id)
  assert.equal(completed?.status, 'complete')
  assert((completed?.resultHtml?.length || 0) > 10_000)
  assert(!completed?.resultHtml?.includes('never-store-this'))
  assert(completed?.resultHtml?.includes('[redacted]'))
  await store.acknowledge(job.id, originToken)
  assert((await store.get(job.id))?.acknowledgedAt)

  const nextJob = await store.create({
    originUrl: 'https://www.spiegel.de/story',
    originDomain: 'www.spiegel.de',
    originToken: 'origin-two',
    workerToken: 'worker-two',
    articleFingerprint: 'article-two',
    providerId: PROVIDER_ID,
    sourceId: 'genios.de',
    sourceParams: {},
    articleInfo: { query: 'zweiter Artikel' },
    ttlMs: 5,
  })
  await assert.rejects(
    () =>
      store.create({
        originUrl: 'https://www.zeit.de/third',
        originDomain: 'www.zeit.de',
        originToken: 'origin-three',
        workerToken: 'worker-three',
        articleFingerprint: 'article-three',
        providerId: PROVIDER_ID,
        sourceId: 'genios.de',
        sourceParams: {},
        articleInfo: { query: 'dritter Artikel' },
      }),
    JobBusyError,
  )
  now += 10
  assert.equal((await store.getActive())?.status, 'expired')
  assert.equal((await runtime.getValue(ACTIVE_JOB_KEY, null) as { status?: string }).status, 'busy')
  assert(runtime.values.has(EVENT_HINT_KEY))
  assert(nextJob.id.length > 0)
}

async function testActionRunner() {
  const input = {
    value: '',
    events: [] as string[],
    dispatchEvent(event: { type: string }) {
      this.events.push(event.type)
    },
  }
  const button = {
    clicked: 0,
    click() {
      this.clicked += 1
    },
  }
  const content = { outerHTML: '<pre class="text">Hallo</pre>' }
  let delayedContentVisible = false
  const fakeDocument = {
    location: { href: 'https://bib-voebb.genios.de/' },
    querySelector(selector: string) {
      if (selector === '.delayed') {
        return delayedContentVisible ? content : null
      }
      if (selector === '.article') {
        return content
      }
      return ({ '#username': input, '#password': input, '#submit': button } as Record<string, unknown>)[selector] || null
    },
    querySelectorAll(selector: string) {
      return selector === '.article' ? [content] : []
    },
  }
  const previousDocument = (globalThis as { document?: unknown }).document
  ;(globalThis as { document?: unknown }).document = fakeDocument
  try {
    const runner = new UserscriptActionRunner(
      { username: 'user-only-in-memory', password: 'pass-only-in-memory' },
      { selectorTimeoutMs: 5 },
    )
    await runner.runAction({ fill: { selector: '#username', value: 'user-only-in-memory' } })
    await runner.runAction({ event: { selector: '#username', event: 'input' } })
    await runner.runAction({ click: '#submit' })
    const result = await runner.runAction({ extract: '.article' })
    assert.equal(result.value, '<pre class="text">Hallo</pre>')
    assert.equal(input.value, 'user-only-in-memory')
    assert.deepEqual(input.events, ['input'])
    assert.equal(button.clicked, 1)

    const delayedRunner = new UserscriptActionRunner({}, { selectorTimeoutMs: 300 })
    setTimeout(() => {
      delayedContentVisible = true
    }, 20)
    await delayedRunner.runAction({
      failOnMissing: '.delayed',
      failure: 'Verspäteter Treffer fehlt',
    })

    let navigated = ''
    const navigationRunner = new UserscriptActionRunner(
      {},
      {
        navigate: (url) => {
          navigated = url
        },
        navigationFragment: 'bibbot-job=job-only&bibbot-worker=worker-only',
      },
    )
    await navigationRunner.runAction({ url: 'https://bib-voebb.genios.de/search' })
    assert(navigated.includes('#bibbot-job=job-only'))
    assert(!navigated.includes('pass-only-in-memory'))
  } finally {
    ;(globalThis as { document?: unknown }).document = previousDocument
  }
}

async function testProviderAndCredentials() {
  const runtime = new FakeRuntime()
  await saveCredentials(runtime, {
    username: 'username-never-in-job',
    password: 'password-never-in-job',
  })
  assert.deepEqual(await loadCredentials(runtime), {
    username: 'username-never-in-job',
    password: 'password-never-in-job',
  })
  const job = {
    id: 'job-fragment',
    originUrl: 'https://www.zeit.de/story',
    originToken: 'origin-fragment',
    workerToken: 'worker-fragment',
    articleInfo: { query: 'Artikel' },
    sourceParams: {},
  } as unknown as BibbotJob
  const url = buildWorkerStartUrl(getVerticalFlow({}), job)
  assert.equal(getVerticalFlow({}).provider, voebbProvider)
  assert(url.includes('#bibbot-job=job-fragment'))
  assert(!url.includes('username-never-in-job'))
  assert.deepEqual(parseWorkerReference(url), {
    jobId: 'job-fragment',
    originToken: 'origin-fragment',
    workerToken: 'worker-fragment',
  })
  assert.equal(await deleteAllCredentials(runtime), true)
  assert.equal((await runtime.listValues()).some((key) => key.startsWith(CREDENTIAL_KEY_PREFIX)), false)
}

function testSiteCoverage() {
  const siteHosts = Object.keys(userscriptSites)
  assert.equal(siteHosts.length, 61)
  assert.deepEqual(ORIGIN_HOSTS, siteHosts)
  assert(siteHosts.every((host) => userscriptSites[host].source === 'genios.de'))
  assert.equal(USERSCRIPT_MATCHES.length, siteHosts.length + 2)
  for (const host of siteHosts) {
    assert(USERSCRIPT_MATCHES.includes(`https://${host}/*`))
    assert.equal(userscriptSites[host].selectors, completeSites[host].selectors)
    assert.equal(userscriptSites[host].sourceParams, completeSites[host].sourceParams)
    assert.equal('examples' in userscriptSites[host], false)
    assert.equal('testSetup' in userscriptSites[host], false)
  }
}

function testOriginOwnership() {
  const job = {
    originToken: 'origin-owner',
    articleFingerprint: 'article-owner',
  }
  assert.equal(
    hasOriginOwner(
      {
        article: {
          [TAB_DATA_KEY]: {
            role: 'origin',
            originToken: 'origin-owner',
            fingerprint: 'article-owner',
          },
        },
      },
      job,
    ),
    true,
  )
  assert.equal(
    hasOriginOwner(
      {
        navigated: {
          [TAB_DATA_KEY]: {
            role: 'origin',
            originToken: 'origin-owner',
            fingerprint: 'another-article',
          },
        },
        worker: {
          [TAB_DATA_KEY]: {
            role: 'worker',
            originToken: 'origin-owner',
            fingerprint: 'article-owner',
          },
        },
      },
      job,
    ),
    false,
  )
  assert.equal(hasOriginOwner({}, job), false)
}

async function main() {
  await testJobStore()
  await testActionRunner()
  await testProviderAndCredentials()
  testSiteCoverage()
  testOriginOwnership()
  console.log('PASS: Userscript-Jobstore, Action Runner, Fragment-Korrelation und Credential-Isolation getestet.')
}

main().catch((error) => {
  console.error('Userscript tests failed.', error)
  process.exitCode = 1
})
