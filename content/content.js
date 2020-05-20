const readers = {
  "magazin.spiegel.de": {
    selectors: {
      title: "#articles > article > header h1",
      main: "#articles > article > main .paragraph",
      edition: "body > footer > span.pvi",
      paywall: "#preview"
    },
    provider: "www.munzinger.de"
  },
  "www.spiegel.de": {
    selectors: {
      title: ".leading-tight span:not(:first-child), .leading-none .leading-normal",
      overline: "article .text-primary-base",
      main: "article section .clearfix",
      mimic: "article section .clearfix .RichText",
      paywall: "div[data-component='Paywall']"
    },
    provider: "www.munzinger.de"
  },
  "www.zeit.de": {
    selectors: {
      title: ".article-heading__title",
      edition: ".zplus-badge__media-item@alt",
      date: ".metadata__source.encoded-date",
      paywall: ".gate.article__item",
      main: ".article-page",
      mimic: ".article-page .paragraph"
    },
    start: function () {
      document.querySelector('.paragraph.article__item').classList.remove('paragraph--faded')
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: "%3A5%3A1%3A2%3AZEIT",
      searchMask: "5754"
    }
  },
  "www.wiwo.de": {
    selectors: {
      title: ".c-headline--article",
      date: ".o-article__element time",
      paywall: ".o-reco",
      main: ".o-article__content .u-richtext",
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: 'WWON',
      searchMask: '5968'
    }
  },
}

const loader = `
<center id="voebbit-loader"><svg version="1.1" id="L4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve"
  style="margin: 0 auto;display:inline-block;width: 100px;height: 100px;">
  <circle fill="#000" stroke="none" cx="6" cy="50" r="6">
    <animate
      attributeName="opacity"
      dur="1s"
      values="0;1;0"
      repeatCount="indefinite"
      begin="0.1"/>    
  </circle>
  <circle fill="#000" stroke="none" cx="26" cy="50" r="6">
    <animate
      attributeName="opacity"
      dur="1s"
      values="0;1;0"
      repeatCount="indefinite" 
      begin="0.2"/>       
  </circle>
  <circle fill="#000" stroke="none" cx="46" cy="50" r="6">
    <animate
      attributeName="opacity"
      dur="1s"
      values="0;1;0"
      repeatCount="indefinite" 
      begin="0.3"/>     
  </circle>
</svg></center>`


var articleInfo = {}
// const port = browser.runtime.connect({name:"port-from-cs"});
// port.onDisconnect.addListener(function(p) {
//   console.log('Port disconnected', p);
// })

function setupReader() {
  for (const key in reader.selectors) {
    if (reader.selectors[key]) {
      const parts = reader.selectors[key].split('@')
      const result = document.querySelector(parts[0])
      if (result === null) {
        articleInfo[key] = ''
        continue
      }
      if (parts[1]) {
        articleInfo[key] = result.attributes[parts[1]].value.trim()
      } else {
        articleInfo[key] = result.textContent.trim()
      }
    }
  }

  const paywall = document.querySelector(reader.selectors.paywall)
  if (paywall === null) {
    return
  }

  paywall.style.display = "none"

  if (reader.start) {
    reader.start()
  }

  const main = document.querySelector(reader.selectors.main)
  main.innerHTML = main.innerHTML + loader
    
  chrome.runtime.sendMessage({
    "type": "voebb-init",
    "provider": reader.provider,
    "providerParams": reader.providerParams,
    "articleInfo": articleInfo
  }, function finalizeReader (message) {
    console.log(message);
    if (message.type === 'failed') {
      paywall.style.display = "block"
      return Promise.resolve()
    }
    let content = message.content.join('')
    if (reader.selectors.mimic) {
      const mimic = document.querySelector(reader.selectors.mimic)
      content = `<div class="${mimic.className}">${content}</div>`
    }
    main.innerHTML = content
    if (reader.cleanup) {
      reader.cleanup()
    }
    return Promise.resolve()
  })

}


const host = document.location.host
const reader = readers[host]

if (reader !== undefined) {
  console.log("setup reader!");

  setupReader()
}