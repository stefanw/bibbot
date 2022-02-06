function increaseStats (domain) {
  const isPrivate = browser.extension.inIncognitoContext
  if (isPrivate) { return }
  browser.storage.sync.get({ stats: {} }).then(function (items) {
    items.stats[domain] = (items.stats[domain] || 0) + 1
    browser.storage.sync.set({
      stats: items.stats
    })
  })
}

export {
  increaseStats
}
