import type {
  Actions,
  Provider,
  ProviderSourceParams,
  SourceIdentifier,
} from './types.js'

export type AstecProviderInput = {
  id: string
  name: string
  web: string
  domain: string
  defaultSource?: SourceIdentifier
  params?: Partial<Record<SourceIdentifier, ProviderSourceParams>>
  permissions: string[]
}

// The VÖBB/GENIOS slice and the existing extension use the same ASTEC action
// contract. Keeping the factory shared prevents the two targets from drifting.
export function createAstecProvider(provider: AstecProviderInput): Provider {
  const defaultSource = provider.defaultSource || 'genios.de'
  const login: Actions[] = [
    [{ click: 'input[name="CLOGIN"]', optional: true, skipToNext: true }],
    [
      { message: 'Bibliothekskonto wird eingeloggt...' },
      {
        fill: {
          selector: 'input[name="L#AUSW"]',
          providerKey: `${provider.id}.options.username`,
        },
      },
      {
        fill: {
          selector: 'input[name="LPASSW"]',
          providerKey: `${provider.id}.options.password`,
        },
      },
      { click: 'input[name="LLOGIN"]' },
    ],
    [{ click: 'input[name="CLOGIN"]', optional: true }],
  ]
  return {
    name: provider.name,
    web: provider.web,
    params: {
      [defaultSource]: {
        domain: provider.domain,
      },
      ...(provider.params || {}),
    },
    defaultSource,
    login,
    options: [
      { id: 'username', display: 'Nutzername:', type: 'text' },
      { id: 'password', display: 'Passwort:', type: 'password' },
    ],
    permissions: provider.permissions,
  }
}
