/* eslint-disable camelcase */

export type ChangeListener = (
  key: string,
  oldValue: unknown,
  newValue: unknown,
  remote: boolean,
) => void

export type TabData = Record<string, unknown>

export type OpenTabHandle = {
  close?: () => void | Promise<void>
  closed?: boolean
  onclose?: (callback: () => void) => void
}

export interface UserscriptRuntime {
  getValue<T>(key: string, fallback: T): Promise<T>
  setValue<T>(key: string, value: T): Promise<void>
  deleteValue(key: string): Promise<void>
  listValues(): Promise<string[]>
  addValueChangeListener(key: string, listener: ChangeListener): number | null
  removeValueChangeListener(listenerId: number | null): void
  getTab(): Promise<TabData>
  saveTab(data: TabData): Promise<void>
  getTabs(): Promise<Record<string, TabData>>
  openInTab(
    url: string,
    options: { active: boolean; setParent?: boolean },
  ): Promise<OpenTabHandle>
  registerMenuCommand(
    caption: string,
    callback: () => void | Promise<void>,
  ): unknown
}

type MaybePromise<T> = T | PromiseLike<T>

declare function GM_getValue<T>(key: string, fallback?: T): MaybePromise<T>
declare function GM_setValue<T>(key: string, value: T): MaybePromise<void>
declare function GM_deleteValue(key: string): MaybePromise<void>
declare function GM_listValues(): MaybePromise<string[]>
declare function GM_addValueChangeListener(
  key: string,
  listener: ChangeListener,
): number
declare function GM_removeValueChangeListener(listenerId: number): void
declare function GM_getTab(
  callback: (data: TabData) => void,
): MaybePromise<TabData>
declare function GM_saveTab(data: TabData): MaybePromise<void>
declare function GM_getTabs(
  callback: (tabs: Record<string, TabData>) => void,
): MaybePromise<Record<string, TabData>>
declare function GM_openInTab(
  url: string,
  options: { active: boolean; setParent?: boolean },
): MaybePromise<OpenTabHandle>
declare function GM_registerMenuCommand(
  caption: string,
  callback: () => void | Promise<void>,
): unknown

// GM APIs have different callback signatures; the loose function boundary is
// confined to this adapter and never carries job or credential data.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function available<T extends (...args: any[]) => any>(
  name: string,
  value: T | null,
): T {
  if (value === null) {
    throw new Error(`${name} is unavailable`)
  }
  return value
}

function asPromise<T>(result: MaybePromise<T>) {
  return Promise.resolve(result)
}

function callbackOrValue<T>(
  name: string,
  invoke: (callback: (value: T) => void) => MaybePromise<T> | void,
  timeoutMs = 3000,
) {
  return new Promise<T>((resolve, reject) => {
    let settled = false
    const finish = (callback: () => void) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      callback()
    }
    const timer = setTimeout(() => {
      finish(() => reject(new Error(`${name} callback timeout`)))
    }, timeoutMs)

    try {
      const result = invoke((value) => finish(() => resolve(value)))
      if (result !== undefined && result !== null) {
        Promise.resolve(result as T | PromiseLike<T>).then(
          (value) => finish(() => resolve(value)),
          (error) => finish(() => reject(error)),
        )
      }
    } catch (error) {
      finish(() => reject(error))
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getApi<T extends (...args: any[]) => any>(
  name: string,
  value: T | undefined,
) {
  return typeof value === 'function' ? value : null
}

export function createDefaultRuntime(): UserscriptRuntime {
  const getValueApi = getApi(
    'GM_getValue',
    typeof GM_getValue === 'function' ? GM_getValue : undefined,
  )
  const setValueApi = getApi(
    'GM_setValue',
    typeof GM_setValue === 'function' ? GM_setValue : undefined,
  )
  const deleteValueApi = getApi(
    'GM_deleteValue',
    typeof GM_deleteValue === 'function' ? GM_deleteValue : undefined,
  )
  const listValuesApi = getApi(
    'GM_listValues',
    typeof GM_listValues === 'function' ? GM_listValues : undefined,
  )
  const addListenerApi = getApi(
    'GM_addValueChangeListener',
    typeof GM_addValueChangeListener === 'function'
      ? GM_addValueChangeListener
      : undefined,
  )
  const removeListenerApi = getApi(
    'GM_removeValueChangeListener',
    typeof GM_removeValueChangeListener === 'function'
      ? GM_removeValueChangeListener
      : undefined,
  )
  const getTabApi = getApi(
    'GM_getTab',
    typeof GM_getTab === 'function' ? GM_getTab : undefined,
  )
  const saveTabApi = getApi(
    'GM_saveTab',
    typeof GM_saveTab === 'function' ? GM_saveTab : undefined,
  )
  const getTabsApi = getApi(
    'GM_getTabs',
    typeof GM_getTabs === 'function' ? GM_getTabs : undefined,
  )
  const openInTabApi = getApi(
    'GM_openInTab',
    typeof GM_openInTab === 'function' ? GM_openInTab : undefined,
  )
  const registerMenuApi = getApi(
    'GM_registerMenuCommand',
    typeof GM_registerMenuCommand === 'function'
      ? GM_registerMenuCommand
      : undefined,
  )

  return {
    getValue: async <T>(key: string, fallback: T) => {
      const api = available('GM_getValue', getValueApi)
      return await asPromise(api(key, fallback))
    },
    setValue: async <T>(key: string, value: T) => {
      const api = available('GM_setValue', setValueApi)
      await asPromise(api(key, value))
    },
    deleteValue: async (key: string) => {
      const api = available('GM_deleteValue', deleteValueApi)
      await asPromise(api(key))
    },
    listValues: async () => {
      const api = available('GM_listValues', listValuesApi)
      return await asPromise(api())
    },
    addValueChangeListener: (key: string, listener: ChangeListener) => {
      const api = available('GM_addValueChangeListener', addListenerApi)
      return api(key, listener)
    },
    removeValueChangeListener: (listenerId: number | null) => {
      if (listenerId === null) {
        return
      }
      const api = available('GM_removeValueChangeListener', removeListenerApi)
      api(listenerId)
    },
    getTab: async () => {
      const api = available('GM_getTab', getTabApi)
      return await callbackOrValue('GM_getTab', (callback) => api(callback))
    },
    saveTab: async (data: TabData) => {
      const api = available('GM_saveTab', saveTabApi)
      await asPromise(api(data))
    },
    getTabs: async () => {
      const api = available('GM_getTabs', getTabsApi)
      return await callbackOrValue('GM_getTabs', (callback) => api(callback))
    },
    openInTab: async (
      url: string,
      options: { active: boolean; setParent?: boolean },
    ) => {
      const api = available('GM_openInTab', openInTabApi)
      return await asPromise(api(url, options))
    },
    registerMenuCommand: (caption, callback) => {
      const api = available('GM_registerMenuCommand', registerMenuApi)
      return api(caption, callback)
    },
  }
}

export function randomToken(prefix: string) {
  let randomPart = ''
  try {
    const cryptoObject = (globalThis as { crypto?: Crypto }).crypto
    if (cryptoObject?.getRandomValues) {
      const values = new Uint32Array(3)
      cryptoObject.getRandomValues(values)
      randomPart = Array.from(values)
        .map((value) => value.toString(36))
        .join('')
    }
  } catch {
    randomPart = ''
  }
  if (!randomPart) {
    randomPart = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  }
  return `${prefix}-${randomPart.slice(0, 30)}`
}
