import { readFileSync } from 'node:fs'
import ts from 'typescript'

export const WORKER_MATCHES = [
  'https://bib-voebb.genios.de/*',
  'https://www.voebb.de/oidcp/authorize*',
]

function propertyName(node) {
  if (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isIdentifier(node)
  ) {
    return node.text
  }
  return null
}

export function readUserscriptOriginHosts(
  filename = new URL('../src/sites.ts', import.meta.url),
) {
  const sourceText = readFileSync(filename, 'utf8')
  const sourceFile = ts.createSourceFile(
    filename.toString(),
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const definitions = new Map()

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue
    }
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.initializer &&
        ts.isObjectLiteralExpression(declaration.initializer)
      ) {
        definitions.set(declaration.name.text, declaration.initializer)
      }
    }
  }

  const sites = definitions.get('sites')
  if (!sites) {
    throw new Error('Could not find the BibBot site definitions.')
  }

  const usesGenios = (definition, visited = new Set()) => {
    if (visited.has(definition)) {
      return false
    }
    visited.add(definition)
    for (const property of definition.properties) {
      if (
        ts.isPropertyAssignment(property) &&
        propertyName(property.name) === 'source' &&
        ts.isStringLiteral(property.initializer)
      ) {
        return property.initializer.text === 'genios.de'
      }
    }
    return definition.properties.some((property) => {
      if (
        !ts.isSpreadAssignment(property) ||
        !ts.isIdentifier(property.expression)
      ) {
        return false
      }
      const sharedDefinition = definitions.get(property.expression.text)
      return sharedDefinition
        ? usesGenios(sharedDefinition, new Set(visited))
        : false
    })
  }

  const hosts = sites.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property) || !usesGenios(property.initializer)) {
      return []
    }
    const host = propertyName(property.name)
    return host ? [host] : []
  })

  if (hosts.length === 0 || new Set(hosts).size !== hosts.length) {
    throw new Error('Could not derive a unique BibBot GENIOS host list.')
  }
  return hosts
}

export function userscriptMatches() {
  return [
    ...readUserscriptOriginHosts().map((host) => `https://${host}/*`),
    ...WORKER_MATCHES,
  ]
}
