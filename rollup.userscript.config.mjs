import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { readFileSync } from 'node:fs'

import { userscriptMatches } from './scripts/userscript-hosts.mjs'

const packageData = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
)
const userscriptVersion =
  process.env.BIBBOT_USERSCRIPT_VERSION || packageData.version
const matches = userscriptMatches()

const grants = [
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
]

const metadata = [
  '// ==UserScript==',
  '// @name         BibBot für Tampermonkey iOS',
  `// @namespace    https://github.com/stefanw/bibbot/tampermonkey-ios`,
  `// @version      ${userscriptVersion}`,
  '// @description  BibBot-Artikelzugriff über VÖBB/GENIOS in Safari auf iOS.',
  '// @author       BibBot maintainers and contributors',
  '// @license      GPL-3.0-or-later',
  '// @homepageURL  https://github.com/stefanw/bibbot',
  '// @supportURL   https://github.com/stefanw/bibbot/issues',
  `// @downloadURL   https://github.com/stefanw/bibbot/releases/latest/download/bibbot.user.js`,
  `// @updateURL     https://github.com/stefanw/bibbot/releases/latest/download/bibbot.user.js`,
  ...matches.map((value) => `// @match        ${value}`),
  '// @run-at       document-idle',
  '// @sandbox      DOM',
  '// @noframes',
  ...grants.map((value) => `// @grant        ${value}`),
  '// ==/UserScript==',
  '',
].join('\n')

const createPlugins = () => [
  commonjs(),
  nodeResolve(),
  typescript({ tsconfig: './tsconfig.userscript.json' }),
]

const userscriptBuild = {
  input: 'src/userscript/entry.ts',
  output: {
    file: 'dist/bibbot.user.js',
    format: 'iife',
    name: 'BibBotTampermonkey',
    banner: metadata,
    inlineDynamicImports: true,
  },
  plugins: createPlugins(),
}

const testBuild = {
  input: 'tests/userscript_test.ts',
  output: {
    file: 'test_build/userscript_test.js',
    format: 'cjs',
  },
  external: ['node:assert'],
  plugins: createPlugins(),
}

export default process.env.USERSCRIPT_TEST === 'true'
  ? testBuild
  : userscriptBuild
