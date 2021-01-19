const voebbLogin = [
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
              {url: "https://www.munzinger.de/search/query?template=%2Fpublikationen%2Fspiegel%2Fresult.jsp&query.id=query-spiegel&query.key=gQynwrIS&query.commit=yes&query.scope=spiegel&query.index-order=personen&query.facets=yes&facet.path=%2Fspiegel&facet.activate=yes&hitlist.highlight=yes&hitlist.sort=-field%3Aisort&query.Titel={title}&query.Ausgabe={edition}&query.Ressort=&query.Signatur=&query.Person=&query.K%C3%B6rperschaft=&query.Ort=&query.Text={overline}"},
          ],
          [
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
          {url: "https://bib-voebb.genios.de/dosearch?explicitSearch=true&q={title}&dbShortcut={providerParams.dbShortcut}&searchMask={providerParams.searchMask}&TI%2CUT%2CDZ%2CBT%2COT%2CSL=&AU=&KO=&MM%2COW%2CUF%2CMF%2CAO%2CTP%2CVM%2CNN%2CNJ%2CKV%2CZ2=&CT%2CDE%2CZ4%2CKW=&Z3%2CCN%2CCE%2CKC%2CTC%2CVC=&DT_from=&DT_to=&timeFilterType=selected&timeFilter=NONE&x=59&y=11"}
        ],
        [
          {click: ".boxHeader"}
        ],
        [
          {extract: ".divDocument pre:nth-of-type(4), .divDocument pre:nth-of-type(5)", convert: "preToParagraph"},
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

browser.storage.sync.get({username: '', password: ''}).then(function(items) {
  for (var key in items) {
    storageItems[key] = items[key]
  }
})

function connected(message, sender, sendResponse) {
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
    reader.providerParams = message.providerParams
    reader.articleInfo = message.articleInfo
    startProvider(reader)
  }
  return true;
}

// browser.runtime.onConnect.addListener(connected)
browser.runtime.onMessage.addListener(connected)


function startProvider (reader) {
  const provider = providers[reader.provider]
  var creating = browser.tabs.create({
    url: provider.init,
    active: false,
  });
  creating.then(function tabCreated(tab) {
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
  }); 
}

function initStep (reader) {
  const provider = providers[reader.provider]
  loginTest(reader, provider).then(function(loggedIn) {
    if (loggedIn) {
      reader.step = 0
      reader.phase = 'search'
    }
    runStep(reader, provider)
  })
}

function loginTest (reader, provider) {
  if (reader.phase === 'login' && reader.step === 0) {
    return new Promise(function(resolve) {
      browser.tabs.executeScript(reader.tabId, {
        code: `document.querySelector("${provider.loggedIn}") !== null`
      }).then(function(result) {
        console.log('loggedin?', result);
        resolve(result[0])
      }, function(err) {
        console.warn('Error after action', action, err)
      })
    })
  }
  return Promise.resolve(false)
}


function runStep (reader, provider) {
  const actions = provider[reader.phase][reader.step]
  const isFinal = reader.phase === 'search' && reader.step === provider[reader.phase].length - 1
  actions.forEach(function(action) {
    const actionCode = getActionCode(reader, action)
    console.log(actionCode)
    browser.tabs.executeScript(reader.tabId, {
      code: actionCode
    }).then(function(result) {
      console.log('action', action, 'result', result)
      result = result[0]
      if (result === undefined || result === null) {
        // Firefox returns undefined, chrome empty array
        result = []
      }
      if (result.length > 0 && action.convert) {
        result = converters[action.convert](result)
      }
      if (isFinal) {
        if (result.length > 0) {
          reader.postMessage({
            type: "success",
            content: result
          })
          browser.tabs.remove(reader.tabId)
        } else {
          console.warn('failed to find')
          reader.postMessage({
            type: "failed",
            content: result
          })
        }
      }
    }, function(err) {
      console.warn('Error after action', action, err)
    })
  })
  if (isFinal) {
    reader.done = true
  }
  reader.step += 1
  if (reader.step > provider[reader.phase].length - 1) {
    if (reader.phase === 'login') {
      reader.phase = 'search'
    }
    reader.step = 0
  }
}

function getActionCode (reader, action) {
  if (action.fill) {
    if (storageItems[action.fill.key]) {
      return `document.querySelector('${action.fill.selector}').value = '${storageItems[action.fill.key]}'`
    } else {
      return `undefined`
    }
  } else if (action.click) {
    return `document.querySelector('${action.click}').click()`
  } else if (action.url) {
    const vars = ['title', 'edition', 'overline']
    let url = action.url
    for (let v of vars) {
      url = url.replace(new RegExp(`\{${v}\}`), encodeURIComponent(reader.articleInfo[v] || ''))
    }
    if (reader.providerParams) {
      for (let v in reader.providerParams) {
        url = url.replace(new RegExp(`\{providerParams.${v}\}`), encodeURIComponent(reader.providerParams[v] || ''))
      }
    }
    return `document.location.href = '${url}';`
  } else if (action.extract) {
    return `
    Array.from(document.querySelectorAll('${action.extract}')).map(function(el) {
      return el.outerHTML
    })
    `
  }
}