import * as browser from 'webextension-polyfill'

document.querySelector('#settings').addEventListener('click', () => {
  browser.runtime.openOptionsPage()
})

const defaults = {
  keepStats: true,
  stats: {}
}
browser.storage.sync.get(defaults).then(function (items) {
  if (!items.keepStats) { return }
  const ul = document.createElement('ul')
  let count = 0
  for (const domain in items.stats) {
    const domainLabel = domain.replace(/^www\./, '')
    const li = document.createElement('li')
    li.innerHTML = `${domainLabel}:&nbsp;${items.stats[domain]}`
    ul.appendChild(li)
    count += items.stats[domain]
  }
  if (count > 0) {
    const stats: HTMLElement = document.querySelector('#stats')
    stats.style.display = 'block'
    document.body.appendChild(ul)
  }
})
