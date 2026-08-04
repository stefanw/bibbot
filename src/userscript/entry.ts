import { ArticleController } from './article_controller.js'
import { isOriginHost, isWorkerLocation, PAGE_MARKER } from './constants.js'
import { createDefaultRuntime } from './runtime.js'
import {
  consumeSettingsRequest,
  openSettings,
  registerSettingsMenu,
} from './settings.js'
import { WorkerController } from './worker.js'
import sites from './site_definitions.js'

async function start() {
  if (window.top !== window.self) {
    return
  }
  if (
    !document.documentElement ||
    document.documentElement.hasAttribute(PAGE_MARKER)
  ) {
    return
  }
  document.documentElement.setAttribute(PAGE_MARKER, '1')

  const runtime = createDefaultRuntime()
  registerSettingsMenu(runtime)

  if (isWorkerLocation(window.location)) {
    const settingsRequest = await consumeSettingsRequest(runtime).catch(
      () => 'none' as const,
    )
    if (settingsRequest === 'open') {
      await openSettings(runtime)
      return
    }
    if (settingsRequest === 'wait') {
      return
    }
    new WorkerController(runtime).start()
    return
  }

  if (!isOriginHost(window.location.hostname)) {
    return
  }
  const site = sites[window.location.host]
  if (!site || !document.body) {
    return
  }
  const controller = new ArticleController(
    site,
    document.body,
    window.location.host,
    runtime,
  )
  if (typeof site.waitOnLoad === 'number' && site.waitOnLoad > 0) {
    controller.start(site.waitOnLoad)
  } else {
    controller.start()
  }
}

start().catch(() => undefined)
