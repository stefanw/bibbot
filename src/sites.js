const extractQuery = (node) => `"${node.innerText.split(' ').slice(2, 10).join(' ')}"`

export default {
  'magazin.spiegel.de': {
    selectors: {
      query: '#articles > article > header h1',
      main: '#articles > article > main .paragraph',
      edition: 'body > footer > span.pvi',
      paywall: '#preview'
    },
    source: 'www.munzinger.de'
  },
  'www.spiegel.de': {
    selectors: {
      query: '.leading-tight span:not(:first-child), .leading-none .leading-normal, h2 span:not(:first-child) span:not(:first-child)',
      main: 'article section .clearfix',
      mimic: 'article section .clearfix .RichText',
      paywall: "div[data-component='Paywall'], div[data-target-id='paywall']"
    },
    // source: "www.munzinger.de"
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'SPII,KULS,SPIE,SPON,SSPE,UNIS,LISP,SPBE'
    }
  },
  'plus.tagesspiegel.de': {
    selectors: {
      // query: "h1 > span",
      query: (root) => {
        return extractQuery(root.querySelector('.article--paid > p'))
      },
      main: '.article--paid',
      paywall: '.article--paid > p:first-child~div',
      date: 'time'
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'TSP,TPCP,TSPO'
    }
  },
  'www.zeit.de': {
    selectors: {
      // query: ".article-heading__title, .article-header__title, .headline__title",
      query: () => {
        return extractQuery(document.querySelector('.paragraph.article__item'))
      },
      edition: '.zplus-badge__media-item@alt',
      date: '.metadata__source.encoded-date, time',
      paywall: '.gate.article__item',
      main: '.article-page',
      mimic: '.article-page .paragraph'
    },
    start: (root, paywall) => {
      paywall.style.display = 'none'
      root.querySelector('.paragraph.article__item').classList.remove('paragraph--faded')
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'ZEIT,ZEIO,ZTCS,ZTGS,ZTWI'

    }
  },
  'www.welt.de': {
    selectors: {
      query: 'h2.c-headline',
      date: 'time',
      paywall: '.contains_walled_content',
      main: '.c-article-text'
    },
    start: (root) => {
      root.querySelector('.c-page-container.c-la-loading').remove()
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'WEPL,WAMS,WELT,WEON'
    }
  },
  'www.sueddeutsche.de': {
    selectors: {
      // query: "article > header > h2 > span:last-child",
      query: () => {
        return extractQuery(document.querySelector('.sz-article-body__paragraph--reduced'))
      },
      date: 'time',
      paywall: 'offer-page',
      main: "div[itemprop='articleBody']",
      mimic: '.sz-article-body__paragraph'
    },
    start: (root) => {
      const p = root.querySelector('.sz-article-body__paragraph--reduced')
      if (p) {
        p.className = 'sz-article-body__paragraph'
      }
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'SZ'
    }
  },
  'www.handelsblatt.com': {
    selectors: {
      query: "span[itemprop='headline']",
      date: "span[itemprop='datePublished']",
      paywall: '.c-paywall',
      main: "div[itemprop='articleBody']"
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'HBON'
    }
  },
  'www.berliner-zeitung.de': {
    selectors: {
      query: () => {
        return extractQuery(document.querySelector('.a-paragraph span:not(:first-child), .a-paragraph'))
      },
      main: '.o-article',
      paywall: '.paywall-dialog-box'
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'BEZE'
    }
  },
  'www.morgenpost.de': {
    selectors: {
      query: '[itemprop="headline"]',
      // query: () => {
      //   return document.querySelector('.article__header__intro__text').innerText.split(' ').slice(0, 8).join(' ')
      // },
      main: "div[itemprop='articleBody']",
      paywall: '#paywall-container'
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'BMP,BMPO'
    }
  },
  'www.moz.de': {
    selectors: {
      query: () => {
        return document.querySelector('title').innerText.split('|')[0].trim()
      },
      main: '.article-content .article-text',
      paywall: '.article-content.paywall .justify-content-center'
    },
    start: () => {
      const p = document.querySelector('.article-content')
      if (p) {
        p.classList.remove('paywall')
      }
    },

    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'MOZ'
    }
  },
  'www.nordkurier.de': {
    selectors: {
      query: 'article h1',
      main: '.article-content',
      paywall: '.nk-plus-subscription-options-breaker'
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'NKU'
    }
  },
  'www.noz.de': {
    selectors: {
      query: () => {
        return extractQuery(document.querySelector('.paywall-fadeout'))
      },
      main: '.voebbot-main',
      time: '[itemprop="datePublished"]',
      paywall: '.paywall'
    },
    start: (root) => {
      const p = root.querySelector('.paywall-fadeout')
      if (p) {
        p.classList.remove('paywall-fadeout')
        p.classList.add('voebbot-main')
      }
    },

    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'NOZ'
    }
  },
  'www.abendblatt.de': {
    selectors: {
      query: "[itemprop='headline']",
      main: '.article__body',
      date: 'time',
      paywall: '#paywall-container'
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'HA,HABO'
    }
  },
  'www.waz.de': {
    selectors: {
      query: '[itemprop="headline"]',
      date: 'time',
      paywall: '#paywall-container',
      main: '.article__header__intro'
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'WAZ'
    }
  },
  'www.wiwo.de': {
    selectors: {
      query: '.c-headline--article',
      date: '.o-article__element time',
      paywall: '.o-reco',
      main: '.o-article__content .u-richtext'
    },
    source: 'bib-voebb.genios.de',
    sourceParams: {
      dbShortcut: 'WWON'
    }
  }
}
