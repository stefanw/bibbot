import { expect, test } from '@playwright/test'
import { getFailOnMissingActionCode } from '../src/actiontarget.js'

const originalDocument = global.document
const originalWindow = global.window

test.afterEach(() => {
  global.document = originalDocument
  global.window = originalWindow
})

async function runFailOnMissing(availableAfter: number, waitMs: number) {
  let queries = 0
  global.document = {
    querySelector: () => (++queries > availableAfter ? {} : null),
  } as Document
  global.window = {
    setTimeout: (callback) => {
      callback()
      return 0
    },
  } as Window & typeof globalThis
  const actionCode = getFailOnMissingActionCode(
    '.result',
    'Artikel nicht gefunden',
    waitMs,
  )
  const result = actionCode.func(...actionCode.args)

  return actionCode.resultFunc(await result)
}

test('waits for a delayed failOnMissing target', async () => {
  await expect(runFailOnMissing(3, 300)).resolves.toBe(true)
})

test('uses the configured failure when a failOnMissing target stays absent', async () => {
  await expect(runFailOnMissing(Infinity, 10)).rejects.toThrow(
    'Artikel nicht gefunden',
  )
})
