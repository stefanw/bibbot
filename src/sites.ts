import { getCmpBoxConsent, getConsentCdnSetup } from './test_utils.js'

import { PartialSite, Sites } from './types.js'

const extractQuery = (node: HTMLElement) => createQuery(node.innerText)
const createQuery = (text: string) => {
  const query = text.split(' ').slice(2, 15).join(' ')
  return query
}
const makeQueryFunc = (selector: string|string[]) => {
  if (!Array.isArray(selector)) {
    selector = [selector]
  }
  return (node) => {
    for (const sel of selector) {
      const el = node.querySelector(sel)
      if (el) {
        return extractQuery(el)
      }
    }
  }
}

const removeClass = (node: HTMLElement, className: string) => {
  const el = node.querySelector(`.${className}`)
  if (el) {
    el.classList.remove(className)
  }
}

const findCommentNode = (parentNode: Node, comment: string) => {
  return ([...parentNode.childNodes] as HTMLElement[]).find(n => n.nodeType === window.Node.COMMENT_NODE && n.nodeValue === comment)
}

const RND: PartialSite = {
  selectors: {
    query: makeQueryFunc('div[class*="ArticleHeadstyled__ArticleTeaserContainer"] > div > p[class*="Textstyled__Text"] span:not(:first-child)'),
    headline: '#article header h2',
    date: 'time',
    paywall: 'div[class*="PianoContainerstyled__PianoContainer"]',
    main: 'div[class*="ArticleHeadstyled__ArticleTeaserContainer"] > div:not([class])'
  },
  waitOnLoad: true,
  start: (root) => {
    const main: HTMLElement = root.querySelector('div[class*="ArticleHeadstyled__ArticleTeaserContainer"]')
    main.style.height = 'auto'
    main.style.overflow = 'auto'
  },
  mimic: (content) => {
    const pClassName = document.querySelector('div[class*="ArticleHeadstyled__ArticleTeaserContainer"] > div:not([class]) :first-child').className
    return content.replace(/<p>/g, `<p class="${pClassName}">`)
  },
  source: 'genios.de'
}

const GA: PartialSite = {
  selectors: {
    query: makeQueryFunc('[data-cy="article_content"] p'),
    date: 'time',
    paywall: '.paid-content ',
    main: '[data-cy="article_content"] > div'
  },
  paragraphStyle: {
    selector: '[data-cy="article_content"] > div p'
  },
  source: 'genios.de',
  waitOnLoad: 300
}

const KSTA: PartialSite = {
  selectors: {
    query: makeQueryFunc('.dm-article__intro'),
    date: 'time',
    paywall: '.dm-paywall-wrapper',
    main: '.dm-article-content-width'
  },
  waitOnLoad: 500,
  source: 'genios.de'
}

const sites: Sites = {
  'www.spiegel.de': {
    testSetup: getConsentCdnSetup({ framePart: 'sp-spiegel-de', button: '.primary-button' }),
    examples: [
      {
        url: 'https://www.spiegel.de/politik/deutschland/klara-geywitz-ueber-sanierungspflicht-von-immobilien-neuen-wohnraum-und-fluechtlinge-a-6aeb319e-fc25-4efa-a0cf-66e10ed49969',
        selectors: {
          query: '"»Es wird nicht ohne Ordnungsrecht gehen wenn wir die Klimaziele erreichen wollen«"'
        }
      }
    ],
    selectors: {
      query: (root, siteBot) => {
        return siteBot.runSelectorQuery([
          '.leading-tight span:not(:first-child), .leading-none .leading-normal, h2 span:not(:first-child) span:not(:first-child)',
          '.leading-loose'
        ])
      },
      date: 'time',
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
    dateRange: [7, 1], // search from 7 days before to one day after given date
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SPPL,SPII,KULS,SPIE,SSPE,UNIS,LISP,SPBE'
    }
  },
  'www.manager-magazin.de': {
    selectors: {
      query: makeQueryFunc('header h2~div:nth-of-type(1)'),
      date: 'time',
      headline: 'h2 span.align-middle',
      paywall: '[data-area="paywall"]',
      main: '[data-area="body"]'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MM,MMAG'
    }
  },
  'www.tagesspiegel.de': {
    selectors: {
      // query: "h1 > span",
      query: makeQueryFunc('.article--paid p'),
      main: '.article--paid #story-elements',
      paywall: '.article--paid #paywal',
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
      query: makeQueryFunc(['.article__item .paragraph:nth-child(2)', '.article__item .paragraph', '.article__item .summary']),
      edition: '.metadata__source',
      date: '.metadata__source.encoded-date, time',
      paywall: '#paywall, .gate',
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
      query: makeQueryFunc('.c-summary__intro'),
      headline: 'h2.c-headline',
      date: 'time',
      paywall: '.contains_walled_content',
      main: '.o-text.c-summary '
    },
    waitOnLoad: 500,
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
        query: '"Zeit um die Mitte der Sechziger hörte die Jugend des Westens einen Song"'
      }
    }, {
      url: 'https://www.sueddeutsche.de/projekte/artikel/politik/lkw-unfaelle-beim-abbiegen-im-toten-winkel-e744638/?reduced=true',
      selectors: {
        query: '"Lastwagen in die Konstanzer Straße biegt obwohl er doch eigentlich anhalten müsste hat"'
      }
    }],
    selectors: {
      // query: "article > header > h2 > span:last-child",
      query: (root) => {
        const normalArticle: HTMLElement = root.querySelector('.sz-article-body__paragraph')
        if (normalArticle) {
          return extractQuery(normalArticle)
        }
        const reportage: HTMLElement = root.querySelector('.module-text .text p')
        if (reportage) {
          return extractQuery(reportage)
        }
      },
      date: 'time',
      paywall: 'offer-page',
      main: (root) => {
        const normalMain: HTMLElement = root.querySelector("div[itemprop='articleBody']")
        if (normalMain) {
          return normalMain
        }
        return root.querySelector('.module-text .text')
      }
    },
    start: (root) => {
      const p: HTMLElement = root.querySelector('.sz-article-body__paragraph--reduced')
      if (p) {
        p.className = 'sz-article-body__paragraph'
      }
      const offer: HTMLElement = root.querySelector('offer-page')
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
      dbShortcut: 'SZ,SZDE,SZPT,SZPW,SZRE,SZW,SZMA,SZMO'
    }
  },
  'sz-magazin.sueddeutsche.de': {
    selectors: {
      query: makeQueryFunc('.articlemain__content'),
      date: 'time',
      paywall: '.offerpage-container',
      main: '.articlemain__content'
    },
    start: (root) => {
      removeClass(root, 'paragraph--reduced')
      removeClass(root, 'articlemain__inner--reduced')
      const paywall: HTMLElement = root.querySelector('.offerpage-container')
      paywall.style.display = 'none'
    },
    mimic: (content) => {
      return content.replace(/<p>/g, '<p class="paragraph text__normal">')
    },
    waitOnLoad: true,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SZMA,SZMO'
    }
  },
  'www.handelsblatt.com': {
    selectors: {
      query: '.vhb-article--introduction',
      // date: "span[itemprop='datePublished']",
      paywall: '.c-paywall',
      main: '.vhb-article-area--read'
    },
    start: (root) => {
      Array.from(root.querySelectorAll('.c-paywall')).forEach((el: HTMLElement) => {
        el.style.display = 'none'
      })
    },
    waitOnLoad: true,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'HBLATE,HBONLATE,HBGM,HBLI,HBMA,HBMBLATE,HBZ'
    }
  },
  'www.berliner-zeitung.de': {
    selectors: {
      query: makeQueryFunc(['.a-paragraph span:not(:first-child)', '.a-paragraph']),
      main: '.o-article',
      paywall: '.paywall-dialog-box'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'BEZE'
    }
  },
  'www.morgenpost.de': {
    testSetup: getCmpBoxConsent(),
    examples: [
      {
        url: 'https://www.morgenpost.de/bezirke/pankow/article234644603/Hindernisstrecke-Schoenhauser-Allee.html',
        // Paywall seems to be gone
        noPaywall: true,
        selectors: {
          query: '"So gefährlich ist Berlins gefährlichste Straße für Radfahrer"'
        }
      }
    ],
    selectors: {
      query: '.article__header__headline',
      // query: (root) => {
      //   return root.querySelector('.article__header__intro__text').innerText.split(' ').slice(0, 8).join(' ')
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
      query: (root) => {
        return root.querySelector('title').innerText.split('|')[0].trim()
      },
      main: '.article-content .article-text',
      paywall: '.article-content.paywall .justify-content-center'
    },
    start: (root) => {
      const p = root.querySelector('.article-content')
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
    ...RND,
    sourceParams: {
      dbShortcut: 'MAER'
    }
  },
  'www.lr-online.de': {
    selectors: {
      query: makeQueryFunc('.article-text .text'),
      paywall: '#paywall-container',
      date: 'time',
      main: '.article-text'
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
    testSetup: getConsentCdnSetup({ pageChanges: false }),
    examples: [
      {
        url: 'https://www.noz.de/lokales/hasbergen/artikel/im-angesicht-des-kriegs-ausstellung-am-augustaschacht-hasbergen-23451387',
        selectors: {
          query: '"Ist es angemessen in der Gedenkstätte Augustaschacht in Hasbergen eine Ausstellung zur Erinnerung an die sowjetischen Kriegsgefangenen des Zweiten Weltkrieges zu zeigen während russische Truppen einen Angriffskrieg gegen die Ukraine führen Mehr denn je sagen Landrätin Anna Kebschull und Ausstellungskuratorin Babette Quinkert"'
        }
      }
    ],
    selectors: {
      query: 'p.w-600',
      main: '.content--group__section:last-child',
      date: '[itemprop="datePublished"]',
      paywall: '.paywall'
    },
    start: (root) => {
      const p = root.querySelector('.p.w-600')
      if (p) {
        p.classList.remove('p.w-600')
        p.classList.add('bibbot-main')
      }
    },

    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'NOZ'
    }
  },
  'www.abendblatt.de': {
    selectors: {
      query: 'h2',
      main: '.article__body',
      date: 'time',
      paywall: '#paywall-container'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'HA,HABO,BEZG'
    }
  },
  'www.waz.de': {
    selectors: {
      query: 'h2',
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
          query: '"Mischkonzern Zeppelin „Ein Ausschluss Russlands aus Swift würde eine Weltwirtschaftskrise auslösen“"'
        }
      }
    ],
    selectors: {
      query: makeQueryFunc('.c-leadtext'),
      main: '.o-article__content',
      paywall: '.isArticle .isPremium',
      date: 'time'
    },
    dateRange: [8, 1], // search from roughly week before
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'WWLATE,WWONLATE,WWBW,WWGR'
    }
  },
  'www.heise.de': {
    selectors: {
      query: makeQueryFunc('.article-content p'),
      date: 'time',
      paywall: 'a-paid-content-teaser',
      main: '.article-content',
      loader: '.article-content p:last-of-type'
    },
    dateRange: [8, 1], // search from 7 days before to one day after given date
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
          query: '"Wie kann ein Frieden für die Ukraine aussehen Wo liegt die Zukunft Russlands Und was sollte Österreichs Außenpolitik in der jetzigen Situation leisten"'
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
      const div: HTMLElement = root.querySelector('.paywall-info')
      if (div) {
        div.parentNode.parentElement.style.display = 'none'
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
          query: '"Schlaflose Nächte hat Christian Schweninger hinter sich die vergangenen zweieinhalb Monate seien „heftig“"'
        }
      }
    ],
    selectors: {
      query: makeQueryFunc('.offerpage-wrapper .introText > p'),
      date: 'span[itemprop="datePublished"]',
      paywall: '.c1-offers-target',
      main: '.offerpage-wrapper .introText'
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
          query: '"Die Ladekapazitäten für E-Autos zu Hause haben in den vergangenen drei Jahren in Stuttgart stark zugelegt – der Zuwachs in den einzelnen Bezirken ist dabei heterogen Das zeigen Daten des lokalen Stromnetzbetreibers"'
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
          query: '"Zu gefährlich für Radfahrer Kommt Tempo 30 für die Rostocker Dethardingstraße"'
        }
      }
    ],
    selectors: {
      query: 'nav *[class*="Breadcrumbstyled__Title"]',
      date: 'time',
      paywall: '.paywall',
      main: 'header div[class*="ArticleHeadstyled__ArticleTeaserContainer"] div:not([class])'
    },
    waitOnLoad: true,
    start: (root) => {
      const main: HTMLElement = root.querySelector('header div[class*="ArticleHeadstyled__ArticleTeaserContainer"]')
      main.style.height = 'auto'
      main.style.overflow = 'auto'
    //   const obj = JSON.parse(document.evaluate('//script[@type="application/ld+json" and contains(./text(), "mainEntityOfPage")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent)
    //   paywall.textContent = obj.articleBody
    //   return true
    },
    mimic: '*[class*="Textstyled__InlineText"]',
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'OSZ'
    }
  },
  'www.stimme.de': {
    testSetup: async (page) => {
      const buttonHandle = await page.evaluateHandle('document.querySelector("#cmpwrapper")?.shadowRoot?.querySelector("#cmpwelcomebtnyes")')
      if (buttonHandle) {
        const buttonElement = buttonHandle.asElement()
        await buttonElement.click.bind(buttonElement)()
      }
    },
    examples: [
      {
        url: 'https://www.stimme.de/regional/region/informationsfreiheit-wenn-in-akten-blaettern-10000-euro-kostet-art-4598515',
        selectors: {
          query: '"was eine Behörde tut ist irgendwo verzeichnet in Aktenordnern oder digital Bürger haben"'
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
      query: makeQueryFunc('.art-text p'),
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
      query: makeQueryFunc('.article-paragraphs .paragraph p'),
      date: '.article-header-leadText-date',
      paywall: (root, sitebot) => {
        const paywall = 'app-paywall'
        if (window.bibbotObserver === undefined) {
          window.bibbotObserver = new window.MutationObserver((mutations) => {
            // The single page application simply swaps HTML contents instead of navigating to a new page, so we try to detect when the article content is replaced by a new one
            const switchedArticle = mutations.find(m => [...m.addedNodes.values()].find((n: HTMLElement) => n.nodeName === 'ARTICLECOMP' && n.className === 'ng-star-inserted') !== undefined) !== undefined
            if (switchedArticle) {
              sitebot.start()
            }
          })
          window.bibbotObserver.observe(root, { subtree: true, childList: true })
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
          query: '"sie Venus und Serena Williams sind moderne Amazonen athletisch ehrgeizig kämpferisch Weltklasse-Tennisspielerinnen die"'
        }
      }
    ],
    selectors: {
      query: makeQueryFunc('.article-main .paragraph p:nth-of-type(2)'),
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
          query: '"praxistauglich ist das Home-Office-Gesetz Schon vor einem Jahr wurde darüber heftig diskutiert Anlass"'
        }
      }
    ],
    selectors: {
      query: makeQueryFunc('#article-body p:not(.lead)'),
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
          query: '"nach dem Unfalldrama im Lungau bei dem ein 15-jähriger Mopedlenker getötet wurde ist"'
        }
      }
    ],
    selectors: {
      query: makeQueryFunc('p.article-leadtext'),
      date: 'article-publication-date time',
      paywall: '#article-paywall',
      main: '.article-body-text'
    },
    start: (root) => {
      const paywall: HTMLElement = root.querySelector('#article-paywall')
      if (paywall) {
        paywall.style.display = 'none'
      }
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SN'
    }
  },
  'www.kleinezeitung.at': {
    testSetup: getConsentCdnSetup({ pageChanges: false, framePart: 'cmp-consent', button: 'button#save' }),
    examples: [
      {
        url: 'https://www.kleinezeitung.at/steiermark/weiz/6100137/Gefaehrlicher-Trend_Uebelkeit-Herzrasen_Nikotinbeutel-machen-bei',
        selectors: {
          query: '"riechen nach Menthol oder Minze und erinnern in"'
        }
      }
    ],
    selectors: {
      query: makeQueryFunc('.article-body div div'),
      date: 'time',
      paywall: '#pianoPaywall',
      main: '.article-body'
    },
    start: (root) => {
      const blocker = root.querySelector('.blocker')
      if (blocker) {
        blocker.classList.remove('blocker')
      }
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
          query: '"Kommentar Von wegen Sportstadt Erfurt"'
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
          query: '"und knarzt als Ines Hinrichs vom Landesbetrieb Straßen Brücken und Gewässer LSBG das"'
        }
      }
    ],
    selectors: {
      query: makeQueryFunc('.elementor-widget-theme-post-content'),
      date: '.elementor-post-info__item--type-date',
      paywall: '#paywall',
      main: '.elementor-widget-theme-post-content > .elementor-widget-container > div > div'
    },
    start: (root) => {
      const p = root.querySelector('.paywall-fade')
      if (p) {
        p.classList.remove('paywall-fade')
      }
      const paywall: HTMLElement = root.querySelector('.elementor-widget-theme-post-content > .elementor-widget-container > div > div[data-elementor-type="section"]')
      if (paywall) {
        paywall.style.display = 'none'
      }
    },
    waitOnLoad: 1000,
    source: 'genios.de',
    dateRange: [14, 1],
    sourceParams: {
      dbShortcut: 'MOPO'
    }
  },
  'www.saechsische.de': {
    testSetup: getConsentCdnSetup({ framePart: 'privacy-mgmt.com', button: 'button[title~="Akzeptieren"]' }),
    examples: [
      {
        url: 'https://www.saechsische.de/sachsen/die-dresdner-lehrerin-und-ihre-radikale-sekte-5418484-plus.html',
        selectors: {
          query: '"Die Dresdner Lehrerin und ihre radikale Sekte"'
        }
      }
    ],
    selectors: {
      query: '.article-detail-title h2',
      headline: '.article-detail-title h2',
      date: 'time',
      paywall: '#piano-inline',
      main: '.article-detail-content'
    },
    start: (root) => {
      const blur = root.querySelector('.plus-overlay-blur')
      if (blur) {
        blur.remove()
      }
      const paywall: HTMLElement = root.querySelector('#piano-inline')
      if (paywall) {
        paywall.style.display = 'none'
      }
    },
    waitOnLoad: true,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SZO'
    }
  },
  'www.freiepresse.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp2.freiepresse.de', button: 'button[title="Alle akzeptieren"]' }),
    examples: [
      {
        url: 'https://www.freiepresse.de/chemnitz/neue-schau-im-wasserschloss-klaffenbach-tiere-musik-und-schokolade-artikel11437998',
        selectors: {
          query: '"Neue Schau im Wasserschloss Klaffenbach Tiere Musik und Schokolade"'
        }
      }
    ],
    selectors: {
      query: '.article-headlines > *',
      headline: '.article-headlines > *',
      paywall: '.pw-layer',
      main: '.article-text:not(.m8)'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'FEPR'
    }
  },
  'www.haz.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp-sp.haz.de', button: 'button[title="Alle akzeptieren"]' }),
    examples: [
      {
        url: 'https://www.haz.de/der-norden/tour-mit-9-euro-ticket-auf-dem-sofa-bei-hitzacker-ueber-die-elbe-schippern-UO2T7PN7TB73CND54EVFCMYVA4.html',
        selectors: {
          query: '"der Moment in dem er den Motor ausmacht"'
        }
      }
    ],
    ...RND,
    sourceParams: {
      dbShortcut: 'HAZ'
    }
  },
  'www.lvz.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp-sp.lvz.de', button: 'button[title="Alle akzeptieren"]' }),
    examples: [
      {
        url: 'https://www.lvz.de/lokales/leipzig/lvb-letzte-xl-strassenbahn-ist-da-tatras-verabschieden-sich-aus-leipzig-KJTZK5LMTYO7SABWWZTM2CT37A.html',
        selectors: {
          query: '"In Heiterblick ist am Dienstag ein Großprojekt zu Ende gegangen Die Leipziger Verkehrsbetriebe LVB nahmen dort in ihrem Technischen Zentrum ihre letzte XL-Straßenbahn in Empfang Künftig setzt das Unternehmen auf eine neue Straßenbahn-Generation die rund 10 Zentimeter breiter ist und mehr Fahrgäste befördern kann Das erste Fahrzeug dieses neuen Typs soll im Jahr 2024 eintreffen"'
        }
      }
    ],
    selectors: {
      query: 'span[class*="Textstyled__InlineText"]',
      headline: '#article header h2',
      paywall: '#piano-lightbox-article-lvz',
      main: 'div[class*="ArticleHeadstyled__ArticleTeaserContainer"] > div > p[class*="Textstyled__Text"]'
    },
    waitOnLoad: true,
    start: (root) => {
      const main: HTMLElement = root.querySelector('div[class*="ArticleHeadstyled__ArticleTeaserContainer"]')
      main.style.height = 'auto'
      main.style.overflow = 'auto'
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()
      main.querySelector('span[class*="Textstyled__InlineText"]').innerHTML = content
      main.parentElement.childNodes.forEach((node, i) => {
        if (i > 0) {
          node.remove()
        }
      })
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'LVZ'
    }
  },
  'www.dnn.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp-sp.dnn.de', button: 'button[title="Alle akzeptieren"]' }),
    examples: [
      {
        url: 'https://www.dnn.de/lokales/dresden/laesst-dresden-800-wartehaeuschen-schreddern-FCEJWIVOHYVCWZ7OYHCO42YBVE.html',
        selectors: {
          query: '"Werden in Dresden 800 Wartehäuschen an Straßenbahn- und Bushaltestellen abgerissen Wenn des nach dem Willen von Grünen CDU und FDP geht beginnt bald der große Abriss Die drei Fraktionen haben sich auf einen Antrag geeinigt der den Abriss der Fahrgastunterstände vorsieht Unter anderem"'
        }
      }
    ],
    selectors: {
      query: 'span[class*="Textstyled__InlineText"]',
      headline: '#article header h2',
      paywall: '#piano-lightbox-article-dnn',
      main: 'div[class*="ArticleHeadstyled__ArticleTeaserContainer"] > div > p[class*="Textstyled__Text"]'
    },
    waitOnLoad: true,
    start: (root) => {
      const main: HTMLElement = root.querySelector('div[class*="ArticleHeadstyled__ArticleTeaserContainer"]')
      main.style.height = 'auto'
      main.style.overflow = 'auto'
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()
      main.querySelector('span[class*="Textstyled__InlineText"]').innerHTML = content
      main.parentElement.childNodes.forEach((node, i) => {
        if (i > 0) {
          node.remove()
        }
      })
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'DNN'
    }
  },
  'www.swp.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp2.freiepresse.de', button: 'button[title="Alle akzeptieren"]' }),
    examples: [
      {
        url: 'https://www.swp.de/lokales/ulm/mobilitaet-in-ulm-verkehrswende-in-ulm_-es-ist-noch-viel-luft-nach-oben-65149611.html',
        selectors: {
          query: '"Was sich Autofahrer wünschen wurde nicht gefragt Im Gegenteil Es ging um Konzepte der Zukunft bei denen das Auto hoffentlich kaum noch eine Rolle spielt Sprich darum mehr Platz und Angebote für Fußgänger Radfahrer und den ÖPNV zu schaffen Darum ging es bei einer Veranstaltung der Grüne"'
        }
      }
    ],
    start: (root) => {
      const main: HTMLElement = root.querySelector('.paywall')
      main.classList.remove('paywall')
    },
    selectors: {
      query: 'article div.mb-3.text',
      headline: 'article h2',
      paywall: '#paywall-container',
      main: 'article .article-text'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SWP'
    }
  },
  'www.ruhrnachrichten.de': {
    testSetup: getCmpBoxConsent(),
    selectors: {
      query: makeQueryFunc('.entry__content > p'),
      headline: 'h1.entry__title',
      date: 'time',
      paywall: '.PremiumContent',
      main: '.entry__content'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'RN'
    }
  },
  'www.businessinsider.de': {
    testSetup: getConsentCdnSetup({ pageChanges: false, framePart: 'cdn.privacy-mgmt.com', button: 'sp_choice_type_11' }),
    selectors: {
      query: makeQueryFunc('.piano-article__content > p'),
      headline: 'h2.entry-title',
      date: 'time',
      paywall: '.piano-article__paywall',
      main: '.piano-article__content'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'BUIN'
    }
  },
  'www.badische-zeitung.de': {
    selectors: {
      query: makeQueryFunc('.freemium__preview'),
      headline: 'h1',
      date: 'p.article__header__info-area__txt a[href*="/archiv"]',
      paywall: '#regWalli',
      main: '.freemium__preview'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'BADZ'
    }
  },
  'www.stern.de': {
    selectors: {
      query: makeQueryFunc('.article__body p'),
      headline: 'h2 .title__headline',
      date: 'time',
      paywall: 'html:not(.has-paid-access):not(.has-full-access) .title__logo--str_plus',
      main: '.article__body'
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()
      let textClass
      main.querySelectorAll(':scope>p').forEach((p) => {
        textClass = p.className
        p.remove()
      })
      content = content.replace(/<p>/g, `<p class="${textClass}">`)
      main.innerHTML = main.innerHTML + content
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'STER,STGL'
    }
  },
  'www.mittelbayerische.de': {
    selectors: {
      query: makeQueryFunc('.article > p > strong'),
      headline: 'h1',
      date: '.date',
      paywall: '.teaser-plus.article-teaser',
      main: '.article-section'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MIB'
    }
  },
  'www.tagblatt.de': {
    selectors: {
      query: makeQueryFunc('h1'),
      headline: 'h1',
      date: '.artikelhead > span',
      main: '.StoryShowBody',
      paywall: '.Paywall'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'STT'
    }
  },
  'www.mz.de': {
    selectors: {
      query: makeQueryFunc('article .fp-paragraph'),
      headline: 'article .fp-article-heading__title',
      date: 'article .fp-article-heading__date',
      main: 'article .fp-article-body',
      paywall: 'article .fp-paywall'
    },
    mimic: (content) => {
      return content.replace(/<p>/g, '<p class="fp-paragraph">')
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MZ'
    }
  },
  'www.capital.de': {
    selectors: {
      query: makeQueryFunc('.article__body p.text-element'),
      headline: '.title__headline',
      date: 'time',
      main: '.article__body',
      paywall: 'html:not(.has-paid-access):not(.has-full-access) .title__logo--capital_plus'
    },
    dateRange: [10, 1],
    paragraphStyle: {
      selector: 'p.text-element'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'CAPI'
    }
  },
  'www.geo.de': {
    selectors: {
      query: makeQueryFunc('.article__body p.text-element'),
      headline: '.title__headline',
      date: 'time',
      main: '.article__body',
      paywall: 'html:not(.has-paid-access):not(.has-full-access) .title__logo--geo_plus'
    },
    dateRange: [10, 1],
    paragraphStyle: {
      selector: 'p.text-element'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'GEO,GEOS,GEOW,GESP,GEOE'
    }
  },
  'www.iz.de': {
    selectors: {
      query: makeQueryFunc('.ArticleCopy'),
      headline: '.ArticleHeader_headline',
      date: '.PublishDate_date',
      main: '.ArticleCopy',
      paywall: '.Paywall'
    },
    dateRange: [10, 1],
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'IMMO'
    }
  },
  'www.shz.de': {
    selectors: {
      query: makeQueryFunc('h1 span:nth-child(2)'),
      headline: 'h1 span:nth-child(2)',
      date: '.meta-box__meta',
      main: '.content--group__article section p',
      paywall: '.paywall'
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'ELNA,PBTB,QBTB,SHTB,UENR,WETB,BSZG,WIZE,SYR,STTB,SCHN,SCHB,OHAN,NRU,NFTB,SHL,IB,HN,HCOU,GF,FTB,ECTB'
    }
  },
  'www.aerztezeitung.de': {
    selectors: {
      query: makeQueryFunc('.StoryShowBox p'),
      date: () => document.querySelector("meta[name='date']").attributes.getNamedItem('content').value,
      headline: '.article-heading',
      main: '.StoryShowBox',
      paywall: '.AZLoginModule'
    },
    waitOnLoad: true,
    dateRange: [25, 1],
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'AEZT'
    }
  },
  'www.nzz.ch': {
    selectors: {
      query: makeQueryFunc('.articlecomponent.text'),
      date: 'time',
      headline: '.headline__title',
      main: '.articlecomponent.text',
      paywall: '.dynamic-regwall'
    },
    waitOnLoad: 1500,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'NZZ,NZZS'
    }
  }
}

export default sites
