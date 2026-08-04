import voebbProvider from '../voebb_provider.js'
import {
  CREDENTIAL_KEY_PREFIX,
  DEFAULT_SETTINGS,
  isSettingsLocation,
  PROVIDER_ID,
  ORIGIN_HOSTS,
  SETTINGS_KEY,
  SETTINGS_REQUEST_KEY,
  SETTINGS_REQUEST_TTL_MS,
} from './constants.js'
import type { UserscriptRuntime } from './runtime.js'

export type UserscriptSettings = {
  workerActive: boolean
}

export type StoredCredentials = {
  username?: string
  password?: string
}

const SETTINGS_HOST_ID = 'bibbot-ios-settings'
const CREDENTIAL_FIELDS = ['username', 'password'] as const

function hasJobReference(urlValue: string) {
  try {
    const hash = new URLSearchParams(new URL(urlValue).hash.replace(/^#/, ''))
    return hash.has('bibbot-job')
  } catch {
    return false
  }
}

function credentialKey(providerId: string, field: string) {
  return `${CREDENTIAL_KEY_PREFIX}${encodeURIComponent(providerId)}:${field}`
}

export async function loadSettings(runtime: UserscriptRuntime) {
  const saved = await runtime.getValue<Partial<UserscriptSettings> | null>(
    SETTINGS_KEY,
    null,
  )
  return {
    ...DEFAULT_SETTINGS,
    workerActive: saved?.workerActive === true,
  } satisfies UserscriptSettings
}

export async function saveSettings(
  runtime: UserscriptRuntime,
  settings: UserscriptSettings,
) {
  const next: UserscriptSettings = {
    workerActive: settings.workerActive === true,
  }
  await runtime.setValue(SETTINGS_KEY, next)
  return next
}

export async function loadCredentials(
  runtime: UserscriptRuntime,
  providerId = PROVIDER_ID,
) {
  const credentials: StoredCredentials = {}
  for (const field of CREDENTIAL_FIELDS) {
    const value = await runtime.getValue<string | null>(
      credentialKey(providerId, field),
      null,
    )
    if (typeof value === 'string' && value.length > 0) {
      credentials[field] = value
    }
  }
  return credentials
}

export async function saveCredentials(
  runtime: UserscriptRuntime,
  credentials: StoredCredentials,
  providerId = PROVIDER_ID,
) {
  for (const field of CREDENTIAL_FIELDS) {
    const value = credentials[field]
    if (typeof value === 'string' && value.length > 0) {
      await runtime.setValue(credentialKey(providerId, field), value)
    } else {
      await runtime.deleteValue(credentialKey(providerId, field))
    }
  }
}

export async function deleteAllCredentials(runtime: UserscriptRuntime) {
  const keys = await runtime.listValues()
  await Promise.all(
    keys
      .filter((key) => key.startsWith(CREDENTIAL_KEY_PREFIX))
      .map((key) => runtime.deleteValue(key)),
  )
  return (
    (await runtime.listValues()).filter((key) =>
      key.startsWith(CREDENTIAL_KEY_PREFIX),
    ).length === 0
  )
}

export async function consumeSettingsRequest(
  runtime: UserscriptRuntime,
  now = Date.now(),
  urlValue = window.location.href,
) {
  if (hasJobReference(urlValue)) {
    return 'none' as const
  }
  const requestedAt = await runtime.getValue<number | null>(
    SETTINGS_REQUEST_KEY,
    null,
  )
  const isCurrent =
    typeof requestedAt === 'number' &&
    requestedAt <= now &&
    now - requestedAt <= SETTINGS_REQUEST_TTL_MS
  if (!isCurrent) {
    if (requestedAt !== null) {
      await runtime.deleteValue(SETTINGS_REQUEST_KEY)
    }
    return 'none' as const
  }
  const target = new URL(urlValue)
  if (target.hostname !== 'bib-voebb.genios.de') {
    return 'wait' as const
  }
  await runtime.deleteValue(SETTINGS_REQUEST_KEY)
  return 'open' as const
}

export async function showSettings(runtime: UserscriptRuntime) {
  if (
    isSettingsLocation(window.location) &&
    !hasJobReference(window.location.href)
  ) {
    await openSettings(runtime)
    return
  }
  await runtime.setValue(SETTINGS_REQUEST_KEY, Date.now())
  try {
    await runtime.openInTab('https://bib-voebb.genios.de/#bibbot-settings', {
      active: true,
      setParent: true,
    })
  } catch (error) {
    await runtime.deleteValue(SETTINGS_REQUEST_KEY)
    throw error
  }
}

function settingsStyles() {
  return `
    :host { all: initial; }
    .backdrop { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,.42); display: grid; place-items: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .panel { box-sizing: border-box; width: min(92vw, 30rem); max-height: 90vh; overflow: auto; background: #fff; color: #17211c; border-radius: 14px; padding: 1rem; box-shadow: 0 12px 50px rgba(0,0,0,.3); }
    h2 { margin: 0 0 .75rem; color: #029d74; font-size: 1.25rem; }
    label { display: block; margin: .7rem 0 .25rem; font-weight: 600; }
    input { box-sizing: border-box; width: 100%; padding: .55rem; border: 1px solid #aab7b0; border-radius: 6px; font: inherit; }
    input[type=checkbox] { width: auto; margin-right: .45rem; }
    .buttons { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: 1rem; }
    button { border: 0; border-radius: 6px; padding: .6rem .85rem; font: inherit; cursor: pointer; }
    button:disabled { cursor: wait; opacity: .65; }
    .primary { color: white; background: #029d74; }
    .secondary { background: #e7eeea; }
    .danger { color: #8a1520; background: #fbe6e8; }
    .hint { color: #4d5e55; font-size: .85rem; line-height: 1.35; }
    .library { margin: .25rem 0 .8rem; font-weight: 600; }
    details { margin-top: 1rem; }
    summary { color: #006b50; cursor: pointer; font-weight: 600; }
    details label { font-weight: 400; }
    .message { min-height: 1.2em; color: #029d74; font-size: .9rem; }
  `
}

export function registerSettingsMenu(runtime: UserscriptRuntime) {
  runtime.registerMenuCommand('BibBot einrichten', () => showSettings(runtime))
}

export async function openSettings(runtime: UserscriptRuntime) {
  if (!isSettingsLocation(window.location)) {
    throw new Error(
      'Die BibBot-Einstellungen dürfen nur auf GENIOS geöffnet werden.',
    )
  }
  const existing = document.getElementById(SETTINGS_HOST_ID)
  if (existing?.shadowRoot) {
    ;(existing.shadowRoot.querySelector('input') as HTMLElement | null)?.focus()
    return
  }

  const settings = await loadSettings(runtime)
  const credentials = await loadCredentials(runtime)
  const provider = voebbProvider
  const host = document.createElement('div')
  host.id = SETTINGS_HOST_ID
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>${settingsStyles()}</style>
    <div class="backdrop" role="dialog" aria-modal="true" aria-label="BibBot einrichten">
      <form id="form" class="panel">
        <h2>BibBot einrichten</h2>
        <p class="hint">Die Zugangsdaten werden im Tampermonkey-Speicher dieses Geräts abgelegt und ausschließlich für die Anmeldung beim VÖBB verwendet. BibBot schreibt sie nicht in Jobs, Fehlermeldungen oder URLs.</p>
        <label>Bibliothek</label>
        <p class="library">${provider.name}</p>
        <label for="username">${provider.options[0]?.display || 'Nutzername:'}</label>
        <input id="username" type="text" autocomplete="off" spellcheck="false">
        <label for="password">${provider.options[1]?.display || 'Passwort:'}</label>
        <input id="password" type="password" autocomplete="new-password">
        <details>
          <summary>Erweiterte Einstellung</summary>
          <p class="hint">Normalerweise öffnet BibBot den Bibliotheks-Tab im Hintergrund. Bei Problemen mit der VÖBB-Anmeldung kann er stattdessen sofort sichtbar geöffnet werden.</p>
          <label><input id="workerActive" type="checkbox">Bibliotheks-Tab sofort im Vordergrund öffnen</label>
        </details>
        <p class="hint">${ORIGIN_HOSTS.length} Verlagswebsites verwenden die gemeinsame VÖBB/GENIOS-Unterstützung.</p>
        <p id="message" class="message" aria-live="polite"></p>
        <div class="buttons">
          <button class="primary" type="submit">Speichern</button>
          <button class="secondary" id="close" type="button">Schließen</button>
          <button class="danger" id="delete" type="button">Alle Zugangsdaten löschen</button>
        </div>
      </form>
    </div>`

  const input = <T extends HTMLElement>(id: string) =>
    shadow.querySelector(`#${id}`) as T
  input<HTMLInputElement>('username').value = credentials.username || ''
  input<HTMLInputElement>('password').value = credentials.password || ''
  input<HTMLInputElement>('workerActive').checked = settings.workerActive

  const remove = () => {
    document.removeEventListener('keydown', closeOnEscape)
    host.remove()
  }
  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      remove()
    }
  }
  document.addEventListener('keydown', closeOnEscape)
  input<HTMLButtonElement>('close').addEventListener('click', remove)
  input<HTMLFormElement>('form').addEventListener('submit', async (event) => {
    event.preventDefault()
    const submit = shadow.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement
    submit.disabled = true
    input<HTMLElement>('message').textContent = 'Wird gespeichert…'
    try {
      await saveCredentials(runtime, {
        username: input<HTMLInputElement>('username').value,
        password: input<HTMLInputElement>('password').value,
      })
      await saveSettings(runtime, {
        workerActive: input<HTMLInputElement>('workerActive').checked,
      })
      input<HTMLElement>('message').textContent = 'Gespeichert.'
    } catch {
      input<HTMLElement>('message').textContent =
        'Speichern fehlgeschlagen. Bitte erneut versuchen.'
    } finally {
      submit.disabled = false
    }
  })
  input<HTMLButtonElement>('delete').addEventListener('click', async () => {
    const button = input<HTMLButtonElement>('delete')
    button.disabled = true
    input<HTMLElement>('message').textContent = 'Wird gelöscht…'
    try {
      const deleted = await deleteAllCredentials(runtime)
      if (deleted) {
        input<HTMLInputElement>('username').value = ''
        input<HTMLInputElement>('password').value = ''
      }
      input<HTMLElement>('message').textContent = deleted
        ? 'Zugangsdaten gelöscht.'
        : 'Löschen konnte nicht bestätigt werden.'
    } catch {
      input<HTMLElement>('message').textContent =
        'Löschen fehlgeschlagen. Bitte erneut versuchen.'
    } finally {
      button.disabled = false
    }
  })
  document.body.appendChild(host)
  input<HTMLInputElement>('username').focus()
}
