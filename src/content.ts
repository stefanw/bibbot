import * as browser from 'webextension-polyfill'
import sites from './sites.js'
import SiteBot from './sitebot.js'
import { COLOR } from './ui.js'

const domain = document.location.host
const site = sites[domain]

async function createFloatingButton(siteBot) {
  if (document.getElementById('bibbot-float-root')) return
  const host = document.createElement('div')
  host.id = 'bibbot-float-root'
  document.body.appendChild(host)
  const shadow = host.attachShadow({ mode: 'open' })
  const style = `
    :host { position: fixed; top: calc(env(safe-area-inset-top, 10px) + 8px); right: calc(env(safe-area-inset-right, 10px) + 8px); z-index: 2147483647; }
    #btn { all: initial; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; height: 48px; width: 56px; border-radius: 24px 0 0 24px; background: ${COLOR}; color: white; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.3); padding: 8px 12px; overflow: visible; }
    #btn:active { transform: translateY(1px); }
  `
  shadow.innerHTML = `<style>${style}</style>`

  const btn = document.createElement('button')
  btn.id = 'btn'
  btn.setAttribute('aria-label', 'BibBot starten')
  btn.innerHTML = '<span style="font-weight:700;color:white">B</span>'

  shadow.appendChild(btn)

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    host.style.display = 'none'
    if (siteBot.site.waitOnLoad) {
      if (document.readyState === 'complete') {
        siteBot.start(siteBot.site.waitOnLoad)
      } else {
        window.addEventListener('load', () => {
          siteBot.start(siteBot.site.waitOnLoad)
        })
      }
    } else {
      siteBot.start()
    }
  })
}

if (site !== undefined) {
  const siteBot = new SiteBot(site, document.body, domain)
    ; (async () => {
      const items = await browser.storage.sync.get({ manualTrigger: false, disabledSites: [] })
      if (items.disabledSites && items.disabledSites.includes(domain)) {
        return
      }
      if (items.manualTrigger) {
        if (siteBot.extractor.hasPaywall()) {
          createFloatingButton(siteBot)
        }
      } else {
        if (siteBot.site.waitOnLoad) {
          if (document.readyState === 'complete') {
            siteBot.start(siteBot.site.waitOnLoad)
          } else {
            window.addEventListener('load', () => {
              siteBot.start(siteBot.site.waitOnLoad)
            })
          }
        } else {
          siteBot.start()
        }
      }
    })()
}
