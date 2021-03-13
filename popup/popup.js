document.querySelector('#settings').addEventListener('click', () => {
  browser.runtime.openOptionsPage()
})

const defaults = {
  keepStats: true,
  stats: {}
}
browser.storage.sync.get(defaults).then(function(items) {
  if (!items.keepStats) { return }
  var ul = document.createElement('ul')
  var count = 0
  for (var domain in items.stats) {
    var domainLabel = domain.replace(/^www\./, '')
    var li = document.createElement('li')
    li.innerHTML = `${domainLabel}:&nbsp;${items.stats[domain]}`
    ul.appendChild(li)
    count += items.stats[domain]
  }
  if (count > 0) {
    document.querySelector('#stats').style.display = 'block'
    document.body.appendChild(ul)
  }
})
