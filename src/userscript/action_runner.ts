import converters from '../converters.js'
import type { Action, Actions } from '../types.js'
import { SELECTOR_TIMEOUT_MS } from './constants.js'

export type ActionRunResult = {
  value?: unknown
  message?: string
  waiting?: boolean
  navigates?: boolean
  skipped?: boolean
}

export type ActionRunnerOptions = {
  navigationFragment?: string
  selectorTimeoutMs?: number
  navigate?: (url: string) => void
}

export class ActionRunnerError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ActionRunnerError'
    this.code = code
  }
}

function wait(milliseconds: number) {
  if (!milliseconds || milliseconds <= 0) {
    return Promise.resolve()
  }
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
}

function inputValue(element: Element, value: string) {
  const prototype = Object.getPrototypeOf(element)
  const descriptor = prototype
    ? Object.getOwnPropertyDescriptor(prototype, 'value')
    : null
  if (descriptor?.set) {
    descriptor.set.call(element, value)
  } else {
    ;(element as HTMLInputElement).value = value
  }
}

function eventFor(name: string) {
  if (typeof Event === 'function') {
    return new Event(name, { bubbles: true, composed: true })
  }
  return { type: name }
}

function elementClick(element: Element) {
  const clickable = element as HTMLElement & { click?: () => void }
  if (typeof clickable.click !== 'function') {
    throw new ActionRunnerError(
      'not-clickable',
      'Das Bibliotheksformular ist nicht klickbar.',
    )
  }
  clickable.click()
}

export class UserscriptActionRunner {
  private userData: Record<string, unknown>
  private options: Required<Pick<ActionRunnerOptions, 'selectorTimeoutMs'>> &
    Omit<ActionRunnerOptions, 'selectorTimeoutMs'>

  constructor(
    userData: Record<string, unknown>,
    options: ActionRunnerOptions = {},
  ) {
    this.userData = userData
    this.options = {
      selectorTimeoutMs: SELECTOR_TIMEOUT_MS,
      ...options,
    }
  }

  async runActions(actions: Actions) {
    let result: ActionRunResult = {}
    for (const action of actions) {
      result = await this.runAction(action)
    }
    return result
  }

  async runAction(action: Action): Promise<ActionRunResult> {
    if ('message' in action) {
      return { message: action.message }
    }

    if ('fill' in action) {
      await wait(action.wait || 0)
      const value = this.resolveFillValue(action.fill)
      const element = await this.find(action.fill.selector, false)
      inputValue(element, value)
      return { value: true }
    }

    if ('event' in action) {
      const element = await this.find(action.event.selector, false)
      element.dispatchEvent(eventFor(action.event.event) as Event)
      return { value: true }
    }

    if ('failOnMissing' in action) {
      try {
        await this.find(action.failOnMissing, false)
      } catch (error) {
        if (
          !(error instanceof ActionRunnerError) ||
          error.code !== 'missing-selector'
        ) {
          throw error
        }
        throw new ActionRunnerError(
          'missing-content',
          `${action.failure} (Selektor: ${action.failOnMissing})`,
        )
      }
      return { value: true }
    }

    if ('func' in action) {
      return { value: await action.func(this.userData) }
    }

    if ('click' in action) {
      await wait(action.wait || 0)
      const element = await this.find(action.click, !!action.optional)
      if (!element) {
        return { skipped: true, value: true }
      }
      elementClick(element)
      return { value: true, navigates: true }
    }

    if ('url' in action) {
      const url =
        typeof action.url === 'function' ? action.url({}, {}) : action.url
      this.navigate(url)
      return { navigates: true }
    }

    if ('href' in action) {
      const element = await this.find(action.href, false)
      const href = (element as HTMLAnchorElement).href
      if (!href) {
        throw new ActionRunnerError(
          'missing-href',
          'Der Bibliothekslink enthält keine Zieladresse.',
        )
      }
      this.navigate(href)
      return { navigates: true }
    }

    if ('captcha' in action) {
      const element = document.querySelector(action.captcha)
      if (element) {
        return { waiting: true }
      }
      return { value: true }
    }

    if ('extract' in action) {
      // GENIOS renders both result lists and full documents asynchronously on
      // mobile Safari. document-idle can therefore fire before the article
      // nodes exist even though the page itself has finished loading.
      await this.find(action.extract, false)
      let values = Array.from(document.querySelectorAll(action.extract)).map(
        (element) => element.outerHTML,
      )
      if (action.convert) {
        const converter = converters[action.convert]
        if (!converter) {
          throw new ActionRunnerError(
            'unknown-converter',
            'Die Artikeldaten konnten nicht umgewandelt werden.',
          )
        }
        values = converter(values)
      }
      return { value: values.join('') }
    }

    throw new ActionRunnerError(
      'unknown-action',
      'Unbekannte Bibliotheksaktion.',
    )
  }

  private resolveFillValue(fill: {
    key?: string
    providerKey?: string
    value?: string
  }) {
    let value: unknown
    if (
      fill.key &&
      Object.prototype.hasOwnProperty.call(this.userData, fill.key)
    ) {
      value = this.userData[fill.key]
    } else if (
      fill.providerKey &&
      Object.prototype.hasOwnProperty.call(this.userData, fill.providerKey)
    ) {
      value = this.userData[fill.providerKey]
    } else if (fill.value !== undefined) {
      value = fill.value
    }
    if (typeof value !== 'string' || value.length === 0) {
      throw new ActionRunnerError(
        'missing-credential',
        'Bibliothekszugangsdaten fehlen. Bitte BibBot einrichten.',
      )
    }
    return value
  }

  private async find(selector: string, optional: boolean) {
    const started = Date.now()
    const timeout = this.options.selectorTimeoutMs
    while (Date.now() - started <= timeout) {
      const element = document.querySelector(selector)
      if (element) {
        return element
      }
      if (optional) {
        return null
      }
      await wait(100)
    }
    throw new ActionRunnerError(
      'missing-selector',
      `Bibliothekselement nicht gefunden (${selector}).`,
    )
  }

  private navigate(url: string) {
    let destination = url
    try {
      const parsed = new URL(url, document.location.href)
      if (this.options.navigationFragment) {
        parsed.hash = this.options.navigationFragment.replace(/^#/, '')
      }
      destination = parsed.toString()
    } catch {
      throw new ActionRunnerError(
        'invalid-url',
        'Die Bibliotheksadresse ist ungültig.',
      )
    }
    if (this.options.navigate) {
      this.options.navigate(destination)
    } else {
      window.location.assign(destination)
    }
  }
}
