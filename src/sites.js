import { getConsentCdnSetup } from './test_utils.js'

const extractQuery = (node) => `"${createQuery(node.innerText)}"`
const createQuery = (text) => `"${text.split(' ').slice(2, 10).join(' ')}"`

const removeClass = (node, className) => {
  const el = node.querySelector(`.${className}`)
  if (el) {
    el.classList.remove(className)
  }
}

const GA = {
  selectors: {
    query: () => {
      return extractQuery(document.querySelector('.park-article__intro.park-article__content'))
    },
    date: 'time',
    paywall: '.park-article-paywall',
    main: '.park-article__body'
  },
  insertContent: (siteBot, main, content) => {
    siteBot.hideBot()
    const div = document.createElement('div')
    div.style.maxWidth = '640px'
    div.style.margin = '0 auto'
    div.innerHTML = content
    main.appendChild(div)
  },
  start: (root) => {
    const article = root.querySelector('.park-article--reduced')
    if (article) {
      article.classList.remove('park-article--reduced')
    }
    const widget = root.querySelector('.park-widget--paywall-article')
    if (widget) {
      widget.remove()
    }
    const garbage = root.querySelector('.park-article-content')
    if (garbage) {
      garbage.remove()
    }
  },
  source: 'genios.de',
  waitOnLoad: true
}

const KSTA = {
  selectors: {
    date: 'time',
    paywall: '.dm_premium_container #c1-template-platzhalter',
    main: '.dm_article_text'
  },
  start: (root) => {
    const paywall = root.querySelector('#c1-template-platzhalter')
    if (paywall) {
      paywall.remove()
    }
    const articleText = root.querySelector('.hide-paid-content')
    if (articleText) {
      articleText.classList.remove('hide-paid-content')
    }
    return true
  },
  source: 'genios.de'
}

export default {
  'www.spiegel.de': {
    selectors: {
      query: (root, siteBot) => {
        const text = siteBot.runSelectorQuery([
          '.leading-loose',
          '.leading-tight span:not(:first-child), .leading-none .leading-normal, h2 span:not(:first-child) span:not(:first-child)'
        ])
        return createQuery(text)
      },
      main: 'article section.relative',
      paywall: "div[data-component='Paywall'], div[data-target-id='paywall']"
    },
    mimic: (content) => {
      return `
      <div class="lg:mt-32 md:mt-32 sm:mt-24 md:mb-48 lg:mb-48 sm:mb-32">
        <div class="RichText RichText--iconLinks lg:w-8/12 md:w-10/12 lg:mx-auto md:mx-auto lg:px-24 md:px-24 sm:px-16 break-words word-wrap">
        ${content}
        </div>
      </div>
      `
    },
    source: 'genios.de',
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
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'TSP,TPCP,TSPO'
    }
  },
  'www.zeit.de': {
    testSetup: getConsentCdnSetup({ pageChanges: true }),
    examples: [
      {
        url: 'https://www.zeit.de/2021/11/soziale-ungleichheit-identitaetspolitik-diskriminierung-armut-bildung',
        selectors: {
          query: '"Sie das schon – der Begriff allein Ganz"'
        }
      }
    ],
    selectors: {
      // query: ".article-heading__title, .article-header__title, .headline__title",
      query: () => {
        return extractQuery(document.querySelector('.article__item .paragraph'))
      },
      edition: '.metadata__source',
      date: '.metadata__source.encoded-date, time',
      paywall: '.gate.article__item',
      main: '.article-page'
    },
    start: (root, paywall) => {
      paywall.style.display = 'none'
      try {
        root.querySelector('.paragraph--faded')?.classList.remove('paragraph--faded')
      } catch {
        console.error('Could not unfade article')
      }
    },
    mimic: (content) => {
      return content.replace(/<p>/g, '<p class="paragraph article__item">')
    },
    source: 'genios.de',
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
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'WEPL,WAMS,WELT,WEON'
    }
  },
  'www.sueddeutsche.de': {
    testSetup: getConsentCdnSetup({ pageChanges: false }),
    examples: [{
      url: 'https://www.sueddeutsche.de/kultur/milch-ernaehrung-klimawandel-1.5521054?reduced=true',
      selectors: {
        query: '"Zeit um die Mitte der Sechziger hörte die"'
      }
    }],
    selectors: {
      // query: "article > header > h2 > span:last-child",
      query: () => {
        return extractQuery(document.querySelector('.sz-article-body__paragraph'))
      },
      date: 'time',
      paywall: 'offer-page',
      main: "div[itemprop='articleBody']"
    },
    start: (root) => {
      const p = root.querySelector('.sz-article-body__paragraph--reduced')
      if (p) {
        p.className = 'sz-article-body__paragraph'
      }
      const offer = root.querySelector('offer-page')
      if (offer) {
        offer.style.display = 'none'
      }
    },
    mimic: '.sz-article-body__paragraph',
    paragraphStyle: {
      style: 'margin-bottom: 1rem'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SZ'
    }
  },
  'sz-magazin.sueddeutsche.de': {
    selectors: {
      query: () => {
        return extractQuery(document.querySelector('.articlemain__content'))
      },
      date: 'time',
      paywall: '.offerpage-container',
      main: '.articlemain__content'
    },
    start: (root) => {
      removeClass(root, 'paragraph--reduced')
      removeClass(root, 'articlemain__inner--reduced')
      root.querySelector('.offerpage-container').style.display = 'none'
    },
    mimic: (content) => {
      return content.replace(/<p>/g, '<p class="paragraph text__normal">')
    },
    waitOnLoad: true,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SZMA'
    }
  },
  'www.handelsblatt.com': {
    selectors: {
      query: '.vhb-article-area--read > p',
      // date: "span[itemprop='datePublished']",
      paywall: '.c-paywall',
      main: '.vhb-article-area--read'
    },
    start: (root) => {
      Array.from(root.querySelectorAll('.c-paywall')).forEach(el => {
        el.style.display = 'none'
      })
    },
    waitOnLoad: true,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'HB,HBON,HBGM,HBLI,HBMA,HBMB,HBZ'
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
    source: 'genios.de',
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
    source: 'genios.de',
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

    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MOZ'
    }
  },
  'www.maz-online.de': {
    selectors: {
      // query: '.pdb-article-teaser-breadcrumb-headline-title',
      query: () => {
        return extractQuery(document.querySelector('.pdb-article-body-paidcontentintro p'))
      },
      paywall: '.pdb-article-paidcontent-registration',
      main: '.pdb-article-body'
    },
    start: (root) => {
      root.querySelector('.pdb-article-paidcontent-registration').remove()
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MAER'
    }
  },
  'www.lr-online.de': {
    selectors: {
      query: () => {
        return extractQuery(document.querySelector('.article-text .text'))
      },
      paywall: '.paywall .row .flex-wrap',
      main: '.article-text'
    },
    start: (root) => {
      root.querySelector('.paywall .row .flex-wrap').remove()
      root.querySelector('.paywall').classList.remove('paywall')
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'LR'
    }
  },

  'www.nordkurier.de': {
    selectors: {
      query: 'article h1',
      main: '.article-content',
      paywall: '.nk-plus-subscription-options-breaker'
    },
    source: 'genios.de',
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

    source: 'genios.de',
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
    source: 'genios.de',
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
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'WAZ'
    }
  },
  'www.wiwo.de': {
    selectors: {
      query: '.c-headline--article',
      date: '.o-article__element time',
      paywall: '.c-label--premium',
      main: '.o-article__content .u-richtext'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'WWON'
    }
  },
  'www.heise.de': {
    selectors: {
      query: () => {
        return extractQuery(document.querySelector('.article-content p'))
      },
      date: 'time',
      paywall: 'a-paid-content-teaser',
      main: '.article-content',
      loader: '.article-content p:last-of-type'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MACI,TERE,CT,CTFO,IX,MAKE'
    },
    waitOnLoad: true
  },
  'www.nachrichten.at': {
    selectors: {
      query: '.artDetail__headline',
      date: '.artDetail__header__infoline--datum',
      paywall: '.oonplusOverlay',
      main: '#artikeldetailText'
    },
    start: (root) => {
      if (typeof window.oonObj === 'undefined') {
        root.querySelector('.oonplusOverlay')?.remove()
      } else {
        window.oonObj.isGaa = function () { return true }
      }
      const p = root.querySelector('#artikeldetailText')
      if (p) {
        p.classList.remove('plusTextFadeout')
      }
    },
    paragraphStyle: {
      className: 'ArtikelText'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'OOEN'
    }
  },
  'ga.de': {
    ...GA,
    sourceParams: {
      dbShortcut: 'GAZ'
    }
  },
  'www.ksta.de': {
    ...KSTA,
    sourceParams: {
      dbShortcut: 'KSTA'
    }
  },
  'www.rundschau-online.de': {
    ...KSTA,
    sourceParams: {
      dbShortcut: 'KR'
    }
  },
  'rp-online.de': {
    ...GA,
    sourceParams: {
      dbShortcut: 'RP'
    }
  },
  'www.tagesanzeiger.ch': {
    selectors: {
      query: 'article > p span',
      date: 'time',
      paywall: '#piano-premium',
      main: 'article'
    },
    mimic: (content, main) => {
      const className = main.parentNode.querySelector('article > p').className
      return content.replace(/<p>/g, `<p class="${className}">`)
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()
      const paras = main.parentNode.querySelectorAll('article figure + p, article p + p')
      Array.from(paras).forEach(p => p.remove())
      main.innerHTML += content
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'TAG,TAS'
    }
  },
  'www.falter.at': {
    selectors: {
      query: '.head-content h2',
      date: 'time',
      paywall: '.paywall-info',
      main: '.paywall-content'
    },
    start: (root) => {
      const div = root.querySelector('.paywall-info')
      if (div) {
        div.parentNode.parentNode.style.display = 'none'
      }
    },
    mimic: (content) => {
      const parRegex = new RegExp(/<p>/)
      let parNo = 1
      while (parRegex.test(content)) {
        content = content.replace(parRegex, `<p class="par${parNo} article-p storycontent-article">`)
        parNo++
      }
      return content
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'FALT'
    }
  }

}
