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
      title: ".leading-tight span:not(:first-child), .leading-none .leading-normal, h2 span:not(:first-child) span:not(:first-child)",
      main: "article section .clearfix",
      mimic: "article section .clearfix .RichText",
      paywall: "div[data-component='Paywall']"
    },
    provider: "www.munzinger.de"
  },
  "plus.tagesspiegel.de": {
    selectors: {
      title: "h1 > span",
      main: ".article--paid",
      paywall: ".article--paid > p:first-child~div",
      date: "time",
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: "TSP",
      searchMask: "5472"
    }
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
    start: function (paywall) {
      paywall.style.display = "none"
      document.querySelector('.paragraph.article__item').classList.remove('paragraph--faded')
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: "ZEIT",
      searchMask: "7499"
    }
  },
  "www.welt.de": {
    selectors: {
      title: "h2.c-headline",
      date: "time",
      paywall: ".contains_walled_content",
      main: ".c-article-text",
    },
    start: function () {
      document.querySelector('.c-page-container.c-la-loading').remove()
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: 'WEPL',
      searchMask: '7425'
    }
  },
  "www.sueddeutsche.de": {
    selectors: {
      // title: "article > header > h2 > span:last-child",
      title: () => {
        return document.querySelector('.sz-article-body__paragraph--reduced').innerText.split(' ').slice(0, 8).join(' ')
      },
      date: "time",
      paywall: "offer-page",
      main: "div[itemprop='articleBody']",
      mimic: ".sz-article-body__paragraph"
    },
    start: () => {
      const p = document.querySelector('.sz-article-body__paragraph--reduced')
      if (p) {
        p.className = 'sz-article-body__paragraph'
      }
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: 'SZ',
      searchMask: '5441'
    }
  },
  "www.handelsblatt.com": {
    selectors: {
      title: "span[itemprop='headline']",
      date: "span[itemprop='datePublished']",
      paywall: ".c-paywall",
      main: "div[itemprop='articleBody']",
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: 'HBON',
      searchMask: '6111'
    }
  },
  "www.berliner-zeitung.de": {
    selectors: {
      title: () => {
        return document.querySelector('.a-paragraph span:not(:first-child)').innerText.split(' ').slice(0, 5).join(' ')
      },
      main: '.o-article',
      paywall: '.paywall-dialog-box',
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: 'BEZE',
      searchMask: '5525'
    }
  },
  "www.morgenpost.de": {
    selectors: {
      title: () => {
        return document.querySelector('.article__body p').innerText.split(' ').slice(0, 8).join(' ')
      },
      main: "div[itemprop='articleBody']",
      paywall: '#paywall-container',
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: 'BMP',
      searchMask: '5601'
    }
  },
  "www.nordkurier.de": {
    selectors: {
      title: "article h1",
      main: ".article-content",
      paywall: '.nk-plus-subscription-options-breaker',
    },
    provider: "bib-voebb.genios.de",
    providerParams: {
      dbShortcut: 'NKU',
      searchMask: '5949'
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
      const selector = reader.selectors[key]
      if (typeof selector === "function") {
        articleInfo[key] = selector()
      } else {
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
  }

  const paywall = document.querySelector(reader.selectors.paywall)
  if (paywall === null) {
    return
  }
  console.log('Found paywall', articleInfo)

  if (reader.start) {
    reader.start(paywall)
  } else {
    paywall.style.display = "none"
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
      if (mimic !== null) {
        content = `<div class="${mimic.className}">${content}</div>`
      }
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