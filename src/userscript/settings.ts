import voebbProvider from '../voebb_provider.js'
import {
  CREDENTIAL_KEY_PREFIX,
  DEFAULT_SETTINGS,
  PROVIDER_ID,
  ORIGIN_HOSTS,
  SETTINGS_KEY,
} from './constants.js'
import type { UserscriptRuntime } from './runtime.js'

export type UserscriptSettings = {
  provider: string
  workerActive: boolean
  saveArticle: string | null
  disabledSites: string[]
}

export type StoredCredentials = {
  username?: string
  password?: string
}

const SETTINGS_HOST_ID = 'bibbot-ios-settings'
const CREDENTIAL_FIELDS = ['username', 'password'] as const

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
    ...(saved || {}),
    provider: PROVIDER_ID,
    saveArticle:
      typeof saved?.saveArticle === 'string' && saved.saveArticle.length > 0
        ? saved.saveArticle
        : null,
    disabledSites: Array.isArray(saved?.disabledSites)
      ? saved.disabledSites.filter((value): value is string => typeof value === 'string')
      : [],
    workerActive: saved?.workerActive === true,
  } satisfies UserscriptSettings
}

export async function saveSettings(
  runtime: UserscriptRuntime,
  settings: Partial<UserscriptSettings>,
) {
  const next: UserscriptSettings = {
    ...(await loadSettings(runtime)),
    ...settings,
    provider: PROVIDER_ID,
    saveArticle: settings.saveArticle || null,
    disabledSites: Array.from(new Set(settings.disabledSites || [])),
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
  return (await runtime.listValues()).filter((key) =>
    key.startsWith(CREDENTIAL_KEY_PREFIX),
  ).length === 0
}

function settingsStyles() {
  return `
    :host { all: initial; }
    .backdrop { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,.42); display: grid; place-items: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .panel { box-sizing: border-box; width: min(92vw,  thirtyrem); max-height: 90vh; overflow: auto; background: #fff; color: #17211c; border-radius: 14px; padding: 1rem; box-shadow: 0 12px 50px rgba(0,0,0,.3); }
    h2 { margin: 0 0 .75rem; color: #029d74; font-size: 1.25rem; }
    label { display: block; margin: .7rem 0 .25rem; font-weight: 600; }
    input, select { box-sizing: border-box; width: 100%; padding: .55rem; border: 1px solid #aab7b0; border-radius: 6px; font: inherit; }
    input[type=checkbox] { width: auto; margin-right: .45rem; }
    .checks label { font-weight: 400; }
    .buttons { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: 1rem; }
    button { border: 0; border-radius: 6px; padding: .6rem .85rem; font: inherit; cursor: pointer; }
    .primary { color: white; background: #029d74; }
    .secondary { background: #e7eeea; }
    .danger { color: #8a1520; background: #fbe6e8; }
    .hint { color: #4d5e55; font-size: .85rem; line-height: 1.35; }
    .message { min-height: 1.2em; color: #029d74; font-size: .9rem; }
    ul { padding-left: 1.2rem; }
    a { color: #006b50; }
  `.replace('thirtyrem', '30rem')
}

async function renderDiagnostics(runtime: UserscriptRuntime, target: HTMLElement) {
  let tabCount = 'nicht verfügbar'
  try {
    const tabs = await runtime.getTabs()
    tabCount = String(Object.keys(tabs || {}).length)
  } catch {
    // GM_getTabs is diagnostic only; lack of it does not block the flow.
  }
  target.textContent = `Script ${runtime.info().scriptVersion || 'unbekannt'} · ${tabCount} gespeicherte Tab-Markierungen`
}

export function registerSettingsMenu(runtime: UserscriptRuntime) {
  runtime.registerMenuCommand('BibBot einrichten', () => openSettings(runtime))
}

export async function openSettings(runtime: UserscriptRuntime) {
  const existing = document.getElementById(SETTINGS_HOST_ID)
  if (existing?.shadowRoot) {
    ;(existing.shadowRoot.querySelector('input, select') as HTMLElement | null)?.focus()
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
        <p class="hint">Die Zugangsdaten werden ausschließlich im Tampermonkey-Speicher dieses Geräts abgelegt. Sie werden weder exportiert noch in Jobs, Logs oder URLs geschrieben.</p>
        <label for="provider">Bibliothek</label>
        <select id="provider" disabled><option value="voebb.de">${provider.name}</option></select>
        <label for="username">${provider.options[0]?.display || 'Nutzername:'}</label>
        <input id="username" type="text" autocomplete="off" spellcheck="false">
        <label for="password">${provider.options[1]?.display || 'Passwort:'}</label>
        <input id="password" type="password" autocomplete="new-password">
        <div class="checks">
          <label><input id="disableZeit" type="checkbox" value="www.zeit.de">ZEIT deaktivieren</label>
          <label><input id="disableSpiegel" type="checkbox" value="www.spiegel.de">SPIEGEL deaktivieren</label>
          <label for="saveArticle">Später-lesen-URL (optional)</label>
          <input id="saveArticle" type="url" placeholder="https://…">
        </div>
        <p class="hint">Worker standardmäßig im Hintergrund öffnen. Bei Login, CAPTCHA oder Safari-Pausierung kann der Worker über den Hinweis im Artikel sichtbar geöffnet werden.</p>
        <label><input id="workerActive" type="checkbox">Worker-Tab sofort im Vordergrund öffnen</label>
        <p id="diagnostics" class="hint">Diagnose wird geladen…</p>
        <p class="hint">${ORIGIN_HOSTS.length} Verlagswebsites mit VÖBB/GENIOS-Unterstützung aktiviert.</p>
        <p class="hint"><a href="https://www.zeit.de/2021/11/soziale-ungleichheit-identitaetspolitik-diskriminierung-armut-bildung" target="_blank" rel="noreferrer">ZEIT-Testartikel</a> · <a href="https://www.spiegel.de/politik/deutschland/klara-geywitz-ueber-sanierungspflicht-von-immobilien-neuen-wohnraum-und-fluechtlinge-a-6aeb319e-fc25-4efa-a0cf-66e10ed49969" target="_blank" rel="noreferrer">SPIEGEL-Testartikel</a></p>
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
  input<HTMLInputElement>('saveArticle').value = settings.saveArticle || ''
  input<HTMLInputElement>('workerActive').checked = settings.workerActive
  input<HTMLInputElement>('disableZeit').checked = settings.disabledSites.includes(
    'www.zeit.de',
  )
  input<HTMLInputElement>('disableSpiegel').checked = settings.disabledSites.includes(
    'www.spiegel.de',
  )

  const remove = () => host.remove()
  input<HTMLButtonElement>('close').addEventListener('click', remove)
  input<HTMLFormElement>('form').addEventListener('submit', async (event) => {
    event.preventDefault()
    const disabledSites = [
      input<HTMLInputElement>('disableZeit'),
      input<HTMLInputElement>('disableSpiegel'),
    ]
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value)
    await saveCredentials(runtime, {
      username: input<HTMLInputElement>('username').value,
      password: input<HTMLInputElement>('password').value,
    })
    await saveSettings(runtime, {
      workerActive: input<HTMLInputElement>('workerActive').checked,
      saveArticle: input<HTMLInputElement>('saveArticle').value,
      disabledSites,
    })
    input<HTMLElement>('message').textContent = 'Gespeichert.'
  })
  input<HTMLButtonElement>('delete').addEventListener('click', async () => {
    const deleted = await deleteAllCredentials(runtime)
    input<HTMLInputElement>('username').value = ''
    input<HTMLInputElement>('password').value = ''
    input<HTMLElement>('message').textContent = deleted
      ? 'Zugangsdaten gelöscht.'
      : 'Löschen konnte nicht bestätigt werden.'
  })
  document.body.appendChild(host)
  renderDiagnostics(runtime, input<HTMLElement>('diagnostics')).catch(() => undefined)
}
