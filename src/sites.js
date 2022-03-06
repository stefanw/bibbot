import { getConsentCdnSetup } from './test_utils.js'

const extractQuery = (node) => `"${createQuery(node.innerText)}"`
const createQuery = (text) => `"${text.split(' ').slice(2, 10).join(' ')}"`

const removeClass = (node, className) => {
  const el = node.querySelector(`.${className}`)
  if (el) {
    el.classList.remove(className)
  }
}

const findCommentNode = (parentNode, comment) => {
  return [...parentNode.childNodes].find(n => n.nodeType === window.Node.COMMENT_NODE && n.nodeValue === comment)
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
      dbShortcut: 'ZEIT,ZEIO,ZTCS,ZTGS,ZTWI,CUW'

    }
  },
  'www.welt.de': {
    selectors: {
      query: () => {
        return extractQuery(document.querySelector('.c-article-text > p'))
      },
      headline: 'h2.c-headline',
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
    }, {
      url: 'https://www.sueddeutsche.de/projekte/artikel/politik/lkw-unfaelle-beim-abbiegen-im-toten-winkel-e744638/?reduced=true',
      selectors: {
        query: '"Lastwagen in die Konstanzer Straße biegt obwohl er"'
      }
    }],
    selectors: {
      // query: "article > header > h2 > span:last-child",
      query: () => {
        const normalArticle = document.querySelector('.sz-article-body__paragraph')
        if (normalArticle) {
          return extractQuery(normalArticle)
        }
        const reportage = document.querySelector('.module-text .text p')
        if (reportage) {
          return extractQuery(reportage)
        }
      },
      date: 'time',
      paywall: 'offer-page',
      main: () => {
        const normalMain = document.querySelector("div[itemprop='articleBody']")
        if (normalMain) {
          return normalMain
        }
        return document.querySelector('.module-text .text')
      }
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
    testSetup: async (page) => {
      const consent = '.cmpboxbtn.cmpboxbtnyes'
      await page.waitForSelector(consent)
      await page.click(consent)
    },
    examples: [
      {
        url: 'https://www.morgenpost.de/bezirke/pankow/article234644603/Hindernisstrecke-Schoenhauser-Allee.html',
        // Paywall seems to be gone
        noPaywall: true,
        selectors: {
          query: 'So gefährlich ist Berlins gefährlichste Straße für Radfahrer'
        }
      }
    ],
    selectors: {
      query: '.article__header__headline',
      // query: () => {
      //   return document.querySelector('.article__header__intro__text').innerText.split(' ').slice(0, 8).join(' ')
      // },
      main: '.article__body',
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
    examples: [
      {
        url: 'https://www.wiwo.de/my/unternehmen/industrie/mischkonzern-zeppelin-ein-ausschluss-russlands-aus-swift-wuerde-eine-weltwirtschaftskrise-ausloesen/28091946.html',
        selectors: {
          query: 'Mischkonzern Zeppelin „Ein Ausschluss Russlands aus Swift würde eine Weltwirtschaftskrise auslösen“'
        }
      }
    ],
    selectors: {
      query: '.c-headline--article',
      date: '.o-article__element time',
      paywall: '.o-paywall',
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
    examples: [
      {
        url: 'https://www.nachrichten.at/meinung/kommentare/eine-mahnung;art210749,3586439',
        selectors: {
          query: 'Eine Mahnung'
        }
      }
    ],
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
    examples: [
      {
        url: 'https://www.falter.at/zeitung/20220223/sie-reden-vom-krieg/_27de9dfaf4',
        selectors: {
          query: 'Wie kann ein Frieden für die Ukraine aussehen Wo liegt die Zukunft Russlands Und was sollte Österreichs Außenpolitik in der jetzigen Situation leisten'
        }
      }
    ],
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
      const parRegex = /<p>/
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
  },
  'www.stuttgarter-zeitung.de': {
    testSetup: getConsentCdnSetup({ pageChanges: false }),
    examples: [
      {
        url: 'https://www.stuttgarter-zeitung.de/inhalt.probleme-bei-der-abrechnung-warum-ein-stuttgarter-impfarzt-schlaflose-naechte-hatte.98bea27d-f195-4bda-899b-8221d3d7f901.html?reduced=true',
        selectors: {
          query: 'Der Stuttgarter Arzt Christian Schweninger impft gegen Corona und musste wegen Zahlungsverzögerungen beinahe einen Kredit aufnehmen. Wie kam es so weit'
        }
      }
    ],
    selectors: {
      query: '.intro-text p',
      date: 'div[itemprop="datePublished"]',
      paywall: '.c1-offers-target',
      main: '.article-body > p'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'STZ'
    }
  },
  'www.stuttgarter-nachrichten.de': {
    testSetup: getConsentCdnSetup({ pageChanges: false }),
    examples: [
      {
        url: 'https://www.stuttgarter-nachrichten.de/inhalt.e-mobilitaet-in-stuttgart-zahl-privater-e-ladestellen-waechst-deutlich.a3a5609d-b274-4ac3-a2b1-2558da9a1d69.html?reduced=true',
        selectors: {
          query: 'Die Ladekapazitäten für E-Autos zu Hause haben in den vergangenen drei Jahren in Stuttgart stark zugelegt – der Zuwachs in den einzelnen Bezirken ist dabei heterogen. Das zeigen Daten des lokalen Stromnetzbetreibers.'
        }
      }
    ],
    selectors: {
      query: '.intro-text p',
      date: 'div[itemprop="datePublished"]',
      paywall: '.c1-offers-target',
      main: '.article-body > p'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'STN'
    }
  },
  'www.ostsee-zeitung.de': {
    testSetup: getConsentCdnSetup({ pageChanges: false, framePart: 'cmp-sp' }),
    examples: [
      {
        url: 'https://www.ostsee-zeitung.de/Mecklenburg/Rostock/Zu-gefaehrlich-fuer-Radfahrer-Kommt-Tempo-30-fuer-die-Rostocker-Dethardingstrasse',
        selectors: {
          query: 'Eine der wichtigsten Ost-West-Achsen in der Rostocker Innenstadt könnte in eine Tempo-30-Zone umgewandelt werden Die aktuelle Situation für Radler in...'
        }
      }
    ],
    selectors: {
      query: '.pdb-article-body-paidcontentintro p',
      date: '.pdb-article-publicationdate-part',
      paywall: '.pdb-article-paidcontent-registration',
      main: '.pdb-article-body'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'OSZ'
    }
  },
  'www.stimme.de': {
    testSetup: async (page) => {
      await page.click('.cmp_button.cmp_button_bg.cmp_button_font_color')
    },
    examples: [
      {
        url: 'https://www.stimme.de/regional/region/informationsfreiheit-wenn-in-akten-blaettern-10000-euro-kostet-art-4598515',
        selectors: {
          query: '"was eine Behörde tut ist irgendwo verzeichnet in"'
        }
      }
    ],
    start: (root) => {
      const div = root.querySelector('.fadeOut')
      if (div) {
        div.classList.remove('fadeOut')
      }
    },
    selectors: {
      query: () => {
        return extractQuery(document.querySelector('.art-text p'))
      },
      date: 'time',
      paywall: '.paywall-product-box',
      main: '.art-text p'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'HST'
    }
  },
  'kurier.at': {
    selectors: {
      query: (root) => {
        return extractQuery(root.querySelector('.article-paragraphs .paragraph p:nth-of-type(2)'))
      },
      date: '.article-header-intro-right span',
      paywall: (root, sitebot) => {
        const paywall = '.plusContent app-paywall'
        if (window.voebbot_observer === undefined) {
          window.voebbot_observer = new window.MutationObserver((mutations, observer) => {
            // The single page application simply swaps HTML contents instead of navigating to a new page, so we try to detect when the article content is replaced by a new one
            const switchedArticle = mutations.find(m => [...m.addedNodes.values()].find(n => n.nodeName === 'ARTICLECOMP' && n.className === 'ng-star-inserted') !== undefined) !== undefined
            if (switchedArticle) {
              sitebot.start()
            }
          })
          window.voebbot_observer.observe(root, { subtree: true, childList: true })
        }
        return root.querySelector(paywall)
      },
      main: '.article-paragraphs paragraph:first-of-type .paragraph'
    },
    start: (root, paywall) => {
      const div = root.querySelector('.article-paragraphs')
      if (div) {
        div.querySelectorAll('.article-paragraphs > .ng-star-inserted').forEach(e => {
          e.classList.add('visible')
        })
        paywall.remove()
        // kurier.at delivers the whole article, just hidden; we don't have to query Genios for it
        return true
      } else {
        paywall.style.display = 'none'
      }
      return false
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'KUR'
    },
    waitOnLoad: true
  },
  'freizeit.at': {
    examples: [
      {
        url: 'https://freizeit.at/zeitgeist/will-smith-als-tennisvater-koeniginnen-des-tenniscourts/401915917',
        selectors: {
          query: '"sie Venus und Serena Williams sind moderne Amazonen"'
        }
      }
    ],
    selectors: {
      query: (root) => {
        return extractQuery(root.querySelector('.article-main .paragraph p:nth-of-type(2)'))
      },
      date: '.headerComp-author-date',
      paywall: '#cfs-paywall-container',
      main: '.article-main .paragraph'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'KUR'
    }
  },
  'www.diepresse.com': {
    examples: [
      {
        url: 'https://www.diepresse.com/6103269/das-home-office-gesetz-laesst-vieles-im-dunkeln',
        selectors: {
          query: '"praxistauglich ist das Home-Office-Gesetz Schon vor einem Jahr"'
        }
      }
    ],
    selectors: {
      query: (root) => {
        return extractQuery(root.querySelector('#article-body p:not(.lead)'))
      },
      date: '.meta__date',
      paywall: '.vued--premium-content',
      main: '#article-body'
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()

      const div = document.createElement('div')
      div.innerHTML = content
      div.querySelector('p:first-of-type').classList.add('lead')
      const contentArray = Array.from(div.childNodes)

      main.querySelectorAll('#article-body > p').forEach(p => p.remove())
      main.prepend(...contentArray)
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'PRE'
    }
  },
  'www.sn.at': {
    examples: [
      {
        url: 'https://www.sn.at/salzburg/chronik/nach-toedlichem-unfall-mit-polizeibus-im-lungau-verfahren-gegen-lenker-eingestellt-117530491',
        selectors: {
          query: '"nach dem Unfalldrama im Lungau bei dem ein"'
        }
      }
    ],
    selectors: {
      query: (root) => {
        return extractQuery(root.querySelector('.article__bodytext p'))
      },
      date: '.article-aside__publishdate time',
      paywall: '.article__premium-bar',
      main: '.article__bodytext'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SN'
    }
  },
  'www.kleinezeitung.at': {
    examples: [
      {
        url: 'https://www.kleinezeitung.at/steiermark/weiz/6100137/Gefaehrlicher-Trend_Uebelkeit-Herzrasen_Nikotinbeutel-machen-bei',
        selectors: {
          query: '""Skruf "Faro "Lyft und Velo riechen nach Menthol"'
        }
      }
    ],
    selectors: {
      query: (root) => {
        return extractQuery(findCommentNode(root.querySelector('.article__content'), '- - - body of article - - - ')?.nextSibling)
      },
      date: "meta[property='article:published_time']",
      paywall: '.paidblocker--article',
      main: '.article__content'
    },
    start: (root, paywall) => {
      const blocker = root.querySelector('.blocker')
      blocker.classList.remove('blocker')
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()

      main.querySelectorAll('.article__content > p, .article__content > div').forEach(e => {
        if (e.className === '') {
          e.remove()
        }
      })
      const mainContentComment = findCommentNode(main, '- - - body of article - - - ')
      mainContentComment.nextElementSibling.insertAdjacentHTML('beforebegin', content)
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'KLEI'
    }
  },
  'www.thueringer-allgemeine.de': {
    examples: [
      {
        url: 'https://www.thueringer-allgemeine.de/sport/kommentar-von-wegen-sportstadt-erfurt-id234487935.html',
        selectors: {
          query: 'Kommentar: Von wegen Sportstadt Erfurt'
        }
      }
    ],
    selectors: {
      query: '.article__header__headline',
      date: 'time',
      paywall: '#paywall-container',
      main: '.article__body'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'TA'
    }
  },
  'www.mopo.de': {
    examples: [
      {
        url: 'https://www.mopo.de/hamburg/vor-29-jahren-stillgelegt-das-wird-jetzt-aus-dem-schellfischtunnel/?reduced=true',
        selectors: {
          query: '"und knarzt als Ines Hinrichs vom Landesbetrieb Straßen"'
        }
      }
    ],
    selectors: {
      query: (root) => {
        return extractQuery(root.querySelector('.elementor-widget-theme-post-content'))
      },
      date: '.elementor-post-info__item--type-date',
      paywall: '.elementor-widget-theme-post-content > .elementor-widget-container > div > div[data-elementor-type="section"]',
      main: '.elementor-widget-theme-post-content > .elementor-widget-container > div > div'
    },
    start: (root) => {
      const p = root.querySelector('.paywall-fade')
      if (p) {
        p.classList.remove('paywall-fade')
      }
      const paywall = root.querySelector('.elementor-widget-theme-post-content > .elementor-widget-container > div > div[data-elementor-type="section"]')
      if (paywall) {
        paywall.style.display = 'none'
      }
    },
    waitOnLoad: 1000,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MOPO'
    }
  }
}
