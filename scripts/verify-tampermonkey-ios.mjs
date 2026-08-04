import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  readUserscriptOriginHosts,
  userscriptMatches,
} from './userscript-hosts.mjs'

const source = readFileSync('dist/bibbot.user.js', 'utf8')
const packageVersion = JSON.parse(readFileSync('package.json', 'utf8')).version
const expectedVersion = process.env.BIBBOT_USERSCRIPT_VERSION || packageVersion

function metadataValues(name) {
  return [
    ...source.matchAll(new RegExp(`^// @${name}(?:[ \\t]+(.*))?$`, 'gm')),
  ].map((match) => match[1] || '')
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const expectedMatches = userscriptMatches()
const expectedGrants = [
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
]

assert(
  source.startsWith('// ==UserScript=='),
  'Userscript metadata must be first',
)
assert(
  metadataValues('version')[0] === expectedVersion,
  'metadata version does not match the project version',
)
assert(
  JSON.stringify(metadataValues('match')) === JSON.stringify(expectedMatches),
  'exact @match coverage changed',
)
assert(
  JSON.stringify(metadataValues('grant')) === JSON.stringify(expectedGrants),
  'exact @grant surface changed',
)
assert(
  metadataValues('run-at')[0] === 'document-idle',
  'document-idle is required',
)
assert(metadataValues('sandbox')[0] === 'DOM', 'DOM sandbox is required')
assert(metadataValues('noframes').length === 1, '@noframes is required')
try {
  new Function(source)
} catch (error) {
  throw new Error(`userscript syntax error: ${error.message}`)
}

for (const forbidden of [
  '@connect',
  'GM_info',
  'GM_xmlhttpRequest',
  'disableZeit',
  'disableSpiegel',
  'disabledSites',
  'saveArticle',
  'Später-lesen-URL',
  'ZEIT-Testartikel',
  'SPIEGEL-Testartikel',
  'gespeicherte Tab-Markierungen',
  'consent setup:',
  'page never finishes loading',
  'testSetup:',
  'examples:',
  'browser.',
  'chrome.',
  'unsafeWindow',
  'document.cookie',
  '*://*/*',
  'https://*.genios.de/*',
]) {
  assert(
    !source.includes(forbidden),
    `forbidden userscript capability found: ${forbidden}`,
  )
}

for (const required of [
  'GM_getValue',
  'GM_setValue',
  'GM_addValueChangeListener',
  'GM_getTab',
  'GM_saveTab',
  'GM_openInTab',
  'BibBot einrichten',
  'Bibliotheks-Tab sofort im Vordergrund öffnen',
  'data-bibbot-ios-top',
  'pageshow',
  'visibilitychange',
  'active',
  'bibbot-job',
  'resultHtml',
  'acknowledgedAt',
]) {
  assert(
    source.includes(required),
    `required userscript behavior missing: ${required}`,
  )
}

const fixtureDirectory = mkdtempSync(join(tmpdir(), 'bibbot-userscript-hosts-'))
const fixturePath = join(fixtureDirectory, 'sites.ts')
try {
  writeFileSync(
    fixturePath,
    `
const SHARED = { source: 'genios.de' }
const sites = {
  'direct.example': { source: 'genios.de' },
  'shared.example': { ...SHARED },
  'referenced.example': SHARED,
  'other.example': { source: 'www.munzinger.de' },
}
`,
  )
  assert(
    JSON.stringify(readUserscriptOriginHosts(fixturePath)) ===
      JSON.stringify([
        'direct.example',
        'shared.example',
        'referenced.example',
      ]),
    'host derivation must exclude non-GENIOS sites',
  )
} finally {
  rmSync(fixtureDirectory, { recursive: true, force: true })
}

console.log(
  'PASS: Tampermonkey-Userscript-Metadaten, Berechtigungsgrenzen und Runtime-Sicherheitschecks validiert.',
)
