browser.runtime.onInstalled.addListener(function(details){
  if (details.reason == "install"){
    browser.runtime.openOptionsPage()
  }
});

const voebbLogin = [
  {message: "VÖBB-Konto wird eingeloggt..."},
  {fill: {selector: 'input[name="L#AUSW"]', key: "username"}},
  {fill: {selector: 'input[name="LPASSW"]', key: "password"}},
  {click: 'input[name="LLOGIN"]'},
]
const providers = {
    "www.munzinger.de": {
        init: "https://www.munzinger.de/search/go/spiegel/aktuell.jsp?portalid=50158",
        loggedIn: ".metanav-a[href='/search/logout']",
        login: [
          [
              {click: "#redirect"}
          ],
          voebbLogin,
          [
              {click: 'input[name="CLOGIN"]'}
          ]
        ],
        search: [
          [
              {message: "Suche wird durchgeführt..."},
              {url: "https://www.munzinger.de/search/query?template=%2Fpublikationen%2Fspiegel%2Fresult.jsp&query.id=query-spiegel&query.key=gQynwrIS&query.commit=yes&query.scope=spiegel&query.index-order=personen&query.facets=yes&facet.path=%2Fspiegel&facet.activate=yes&hitlist.highlight=yes&hitlist.sort=-field%3Aisort&query.Titel={query}&query.Ausgabe={edition}&query.Ressort=&query.Signatur=&query.Person=&query.K%C3%B6rperschaft=&query.Ort=&query.Text={overline}"},
          ],
          [
              {click: '.gdprcookie-buttons button', optional: true},
              {extract: ".mitte-text"}
          ]
        ]
    },
    "bib-voebb.genios.de": {
      init: "https://bib-voebb.genios.de/",
      loggedIn: ".boxLogin a[href='/openIdConnectClient/logout']",
      login: [
        voebbLogin
      ],
      search: [
        [
          {message: "Suche wird durchgeführt..."},
          {url: "https://bib-voebb.genios.de/dosearch?explicitSearch=true&q={query}&dbShortcut={providerParams.dbShortcut}&TI%2CUT%2CDZ%2CBT%2COT%2CSL=&AU=&KO=&MM%2COW%2CUF%2CMF%2CAO%2CTP%2CVM%2CNN%2CNJ%2CKV%2CZ2=&CT%2CDE%2CZ4%2CKW=&Z3%2CCN%2CCE%2CKC%2CTC%2CVC=&DT_from=&DT_to=&timeFilterType=selected&timeFilter=NONE&x=59&y=11"}
        ],
        [
          {message: "Artikel wird aufgerufen..."},
          {failOnMissing: ".boxHeader", failure: "Artikel nicht gefunden"},
          {click: ".boxHeader"}
        ],
        [
          {extract: ".divDocument pre.text", convert: "preToParagraph"},
        ]
      ]
    }
}




const converters = {
  preToParagraph: function (htmlArr) {
    return htmlArr.map(function(html) {
      html = html.replace(/<pre[^>]+>/, '').replace(/<\/pre>/, '')
      html = html.replace(/<em class="hlt1">/g, '').replace(/<\/em>/g, '')
      // Funny use of /// and // . for interviews for handelsblatt.com
      html = html.replace(/\/\/\//g, '\n\n<em>')
      html = html.replace(/\s+\/\/\s+\./g, '</em>\n\n')

      let parts = html.split('\n\n')
      return `<p>${parts.join('</p><p>')}</p>`
    })
  }
}

const readers = {}
const storageItems = {}

function retrieveStorage() {
  browser.storage.sync.get({username: '', password: '', keepStats: true}).then(function(items) {
    for (var key in items) {
      storageItems[key] = items[key]
    }
  })
}


function connected(port) {
  port.onMessage.addListener(function(message) {
    messageListener(message, port.sender, port.postMessage.bind(port))
  });
  retrieveStorage()
}

function messageListener(message, sender, sendResponse) {
  const reader = {
    postMessage: function(m) {
      console.log('Sending message to', this.tabId, m)
      sendResponse(m)
    },
    step: 0,
    phase: 'login',
    tabId: sender.tab.id,
  }

  readers[sender.tab.id] = reader
  console.log('received message', message, 'from', sender.tab.id)
  if (message.type === 'voebb-init') {
    reader.provider = message.provider
    reader.domain = message.domain
    reader.providerParams = message.providerParams
    reader.articleInfo = message.articleInfo
    startProvider(reader)
  }
  return true;
}

browser.runtime.onConnect.addListener(connected)

async function startProvider (reader) {
  const provider = providers[reader.provider]
  let tab = await browser.tabs.create({
    url: provider.init,
    active: false,
  });
  reader.tabId = tab.id
  console.log('tab created', tab.id)
  browser.tabs.onUpdated.addListener(function onTabUpdated (tabId, changeInfo, tabInfo) {
    if (reader.done) {
      return
    }
    if (tabId !== tab.id) {
      return
    }
    if (changeInfo.status === 'complete') {
      console.log('good tab complete', tabId)
      initStep(reader)
    }
  });
}

async function initStep (reader) {
  const provider = providers[reader.provider]
  let loggedIn = await loginTest(reader, provider)
  if (loggedIn) {
    reader.step = 0
    reader.phase = 'search'
  }
  await runStep(reader, provider)
}

async function loginTest (reader, provider) {
  if (reader.phase === 'login' && reader.step === 0) {
    let result = await browser.tabs.executeScript(reader.tabId, {
        code: `document.querySelector("${provider.loggedIn}") !== null`
    })
    console.log('loggedin?', result);
    return result[0]
  }
  return false
}

function sendStatusMessage(reader, text) {
  reader.postMessage({
    type: "message",
    text: text
  })
}

function updateStats (domain) {
  if (!storageItems.keepStats) { return }
  const isPrivate = browser.extension.inIncognitoContext;
  if (isPrivate) { return }
  browser.storage.sync.get({stats: {}}).then(function(items) {
    items.stats[domain] = (items.stats[domain] || 0) + 1
    browser.storage.sync.set({
      stats: items.stats
    })
  })
}

async function runStep (reader, provider) {
  const actions = provider[reader.phase][reader.step]
  const isFinalStep = reader.phase === 'search' && reader.step === provider[reader.phase].length - 1

  let result
  for (let action of actions) {
    console.log('Running', action)
    let actionCode = getActionCode(reader, action)
    try {
      result = await runScript(reader, actionCode)
    } catch (e) {
      reader.done = true
      reader.postMessage({
        type: "failed",
        content: e.toString()
      })
      return
    }
  }
  if (isFinalStep ) {
    reader.done = true
    if (result.length > 0) {
      reader.postMessage({
        type: "success",
        content: result
      })
      updateStats(reader.domain)
      browser.tabs.remove(reader.tabId)
    } else {
      console.warn('failed to find')
      reader.postMessage({
        type: "failed",
        content: result
      })
    }
    return
  }
  reader.step += 1
  if (reader.step > provider[reader.phase].length - 1) {
    if (reader.phase === 'login') {
      reader.phase = 'search'
    }
    reader.step = 0
  }
}

async function runScript (reader, actionCode) {
  if (actionCode.length === 0) {
    return
  }
  let result = await browser.tabs.executeScript(reader.tabId, {
    code: actionCode[0]
  })
  result = result[0]
  if (actionCode.length === 1) {
    return result
  }
  return actionCode[1](result)
}

function getActionCode (reader, action) {
  if (action.message) {
    sendStatusMessage(reader, action.message)
    return []
  } else if (action.fill) {
    if (storageItems[action.fill.key]) {
      return [`document.querySelector('${action.fill.selector}').value = '${storageItems[action.fill.key]}'`]
    } else {
      return []
    }
  } else if (action.failOnMissing) {
    return [
      `document.querySelector('${action.failOnMissing}') !== null`,
      function (result) {
        if (result === true) {
          return result
        }
        reader.postMessage({
          type: "failed",
          message: action.failure
        })
        throw new Error('Element not found')
      }
    ]
  } else if (action.click) {
    if (action.optional) {
      return [`var el = document.querySelector('${action.click}'); el && el.click()`]
    } else {
      return [`document.querySelector('${action.click}').click()`]
    }
  } else if (action.url) {
    const vars = ['query', 'edition', 'overline']
    let url = action.url
    for (let v of vars) {
      let q = reader.articleInfo[v] || ''
      if (v === 'query') {
        q = q.replace(/[!,:\?;'\/\(\)]/g, '')
        q = q.replace(/(.)"(.)/g, "$1$2")
      }
      url = url.replace(new RegExp(`\{${v}\}`), encodeURIComponent(q))
    }
    if (reader.providerParams) {
      for (let v in reader.providerParams) {
        url = url.replace(new RegExp(`\{providerParams.${v}\}`), encodeURIComponent(reader.providerParams[v] || ''))
      }
    }
    return [`document.location.href = '${url}';`]
  } else if (action.extract) {
    return [
      `Array.from(document.querySelectorAll('${action.extract}')).map(function(el) {
        return el.outerHTML
      })`,
    function (result) {
      if (result.length > 0 && action.convert) {
        result = converters[action.convert](result)
      }
      return result
    }]
  }
}