import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

import { userscriptMatches } from './scripts/userscript-hosts.mjs'

const packageData = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
)
const userscriptVersion =
  process.env.BIBBOT_USERSCRIPT_VERSION || packageData.version
const matches = userscriptMatches()

const grants = [
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

const testMetadataNames = new Set(['examples', 'testSetup'])

function propertyName(node) {
  if (
    ts.isIdentifier(node) ||
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node)
  ) {
    return node.text
  }
  return null
}

function stripSiteTestMetadata() {
  return {
    name: 'strip-site-test-metadata',
    transform(code, id) {
      if (!/[/\\]src[/\\]sites\.ts$/.test(id)) {
        return null
      }
      const sourceFile = ts.createSourceFile(
        id,
        code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      )
      const transformed = ts.transform(sourceFile, [
        (context) => {
          const visit = (node) => {
            if (
              ts.isPropertyAssignment(node) &&
              testMetadataNames.has(propertyName(node.name))
            ) {
              return undefined
            }
            return ts.visitEachChild(node, visit, context)
          }
          return (root) => ts.visitNode(root, visit)
        },
      ])
      try {
        return {
          code: ts
            .createPrinter({ removeComments: true })
            .printFile(transformed.transformed[0]),
          map: null,
        }
      } finally {
        transformed.dispose()
      }
    },
  }
}

const createPlugins = (productionUserscript = false) => [
  ...(productionUserscript ? [stripSiteTestMetadata()] : []),
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
  plugins: createPlugins(true),
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
