import {
  consentShadowRoot,
  getCmpBoxConsent,
  getConsentCdnSetup,
} from './test_utils.js'

import { PartialSite, Sites } from './types.js'

const QUOTES = /["„].*["„]/
const START_SLICE = 2
const END_SLICE = 15

const extractQuery = (
  node: HTMLElement,
  quoted = true,
  startSlice = START_SLICE,
  endSlice = END_SLICE,
) => createQuery(node.innerText, quoted, startSlice, endSlice)
const createQuery = (
  text: string,
  quoted = true,
  startSlice = START_SLICE,
  endSlice = END_SLICE,
) => {
  let query = text
    .split(' ')
    .slice(startSlice, endSlice)
    .join(' ')
    .replace(/"/g, '')
  // remove some special chars
  query = query
    .replace(/[!:?;'/()]/g, ' ')
    .replace(/(((?<!\d)[,.])|([,.](?!\d)))/g, ' ')
    .replace(/ {1,}/g, ' ')
  // remove non-leading/trailing quotes
  let queryParts = query
    .split(QUOTES)
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length > 1)

  // Quote the whole query
  if (quoted) {
    queryParts = queryParts.map((s) => `"${s}"`)
  }
  return queryParts.join(' ')
}
const makeQueryFunc = (
  selector: string | string[],
  quoted = true,
  startSlice = START_SLICE,
  endSlice = END_SLICE,
) => {
  if (!Array.isArray(selector)) {
    selector = [selector]
  }
  return (node) => {
    for (const sel of selector) {
      const el = node.querySelector(sel)
      if (el) {
        return extractQuery(el, quoted, startSlice, endSlice)
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

const RND: PartialSite = {
  selectors: {
    query: makeQueryFunc('article h2', false),
    headline: '#article header h2',
    date: 'time',
    paywall: '[data-testid="piano-container"]',
    main: 'div[class*="ArticleHeadstyled__ArticleTeaserContainer"]',
  },
  waitOnLoad: 2000,
  start: (root) => {
    const main: HTMLElement = root.querySelector(
      'div[class*="ArticleHeadstyled__ArticleTeaserContainer"]',
    )
    main.style.height = 'auto'
    main.style.overflow = 'auto'
  },
  mimic: (content) => {
    const pClassName = document.querySelector(
      'div[class*="ArticleHeadstyled__ArticleTeaserContainer"] p',
    ).className
    return content.replace(/<p>/g, `<p class="${pClassName}">`)
  },
  source: 'genios.de',
}

const GA: PartialSite = {
  selectors: {
    query: makeQueryFunc('[data-cy="article_content"] p'),
    date: 'time',
    paywall: '.paid-content ',
    main: '[data-cy="article_content"] > div',
  },
  paragraphStyle: {
    selector: '[data-cy="article_content"] > div p',
  },
  source: 'genios.de',
  waitOnLoad: 300,
}

const KSTA: PartialSite = {
  selectors: {
    query: makeQueryFunc('.dm-article__intro'),
    date: 'time',
    paywall: '.dm-paywall-wrapper',
    main: '.dm-article-content-width',
  },
  waitOnLoad: 500,
  source: 'genios.de',
}

const sites: Sites = {
  'www.spiegel.de': {
    testSetup: getConsentCdnSetup({
      framePart: 'sp-spiegel-de',
      button: '.primary-button',
    }),
    examples: [
      {
        url: 'https://www.spiegel.de/politik/deutschland/klara-geywitz-ueber-sanierungspflicht-von-immobilien-neuen-wohnraum-und-fluechtlinge-a-6aeb319e-fc25-4efa-a0cf-66e10ed49969',
        selectors: {
          query:
            'nicht ohne Ordnungsrecht gehen wenn wir die Klimaziele erreichen wollen«',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc(
        [
          '.leading-tight span:not(:first-child), .leading-none .leading-normal, h2 span:not(:first-child) span:not(:first-child)',
          '.leading-loose',
        ],
        false,
      ),
      date: 'time',
      main: 'article section.relative',
      paywall:
        "div[data-component='Paywall'], div[data-target-id='paywall'], div[data-area='paywall']",
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
    waitOnLoad: 1500,
    sourceParams: {
      dbShortcut: 'SPPL,SPII,KULS,SPIE,SSPE,UNIS,LISP,SPBE',
      sourceNames: [
        'SPIEGEL Plus',
        'kulturSPIEGEL',
        'DER SPIEGEL',
        'SPIEGEL special',
        'uniSPIEGEL',
        'LiteraturSPIEGEL',
        'SPIEGEL Bestseller',
      ],
    },
  },
  'www.manager-magazin.de': {
    selectors: {
      query: makeQueryFunc('header h2~div:nth-of-type(1)'),
      date: 'time',
      headline: 'h2 span.align-middle',
      paywall: '[data-area="paywall"]',
      main: '[data-area="body"]',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MM,MMAG',
    },
    mimic: (content) => {
     return content.replace(/<p>/g, '<p style="margin-block: revert !important;">')
    },
  },
  'www.tagesspiegel.de': {
    examples: [
      {
        url: 'https://www.tagesspiegel.de/kultur/comics/im-sumpf-der-verschworungsideologien-es-wurde-immer-schwieriger-mit-meinem-vater-ein-gesprach-zu-fuhren-11626376.html',
        selectors: {
          query:
            'kommt diesmal beim Einräumen der Spülmaschine „Wach endlich auf “ ruft der Vater seiner',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('#story-elements p', false),
      main: '#story-elements',
      paywall: '#paywall',
      date: 'time',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'TSP,TPCP,TSPO',
      sourceNames: [
        'Der Tagesspiegel',
        'Tagesspiegel CHECKPOINT',
        'tagesspiegel.de',
      ],
    },
  },
  'www.zeit.de': {
    testSetup: getConsentCdnSetup({}),
    examples: [
      {
        url: 'https://www.zeit.de/2021/11/soziale-ungleichheit-identitaetspolitik-diskriminierung-armut-bildung',
        selectors: {
          query:
            '"eine gesellschaftliche Gruppe ihre Anliegen vorbringt ihren Schmerz ausspricht wird davor gewarnt dies"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc([
        '.article__item .paragraph:nth-child(2)',
        '.article__item .paragraph',
        '.article__item .summary',
      ]),
      edition: '.metadata__source',
      date: '.metadata__source.encoded-date, time',
      paywall: '.article-page:not([hidden]) #paywall, .gate',
      main: '.article-page',
    },
    start: (root, paywall) => {
      paywall.style.display = 'none'
      try {
        root
          .querySelector('.paragraph--faded')
          ?.classList.remove('paragraph--faded')
      } catch {
        console.error('Could not unfade article')
      }
    },
    mimic: (content) => {
      return content.replace(/<p>/g, '<p class="paragraph article__item">')
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'ZEIT,ZEIO,ZTCS,ZTGS,ZTWI,CUW',
      sourceNames: [
        'DIE ZEIT',
        'DIE ZEIT online',
        'ZEIT Campus',
        'ZEIT Geschichte',
        'ZEIT Wissen',
        'Christ und Welt',
      ],
    },
  },
  'www.welt.de': {
    selectors: {
      query: makeQueryFunc('.c-summary__intro'),
      headline: 'h2.c-headline',
      date: 'time',
      paywall: '.contains_walled_content',
      main: '.o-text.c-summary ',
    },
    waitOnLoad: 500,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'WEPL,WAMS,WELT,WEON',
      sourceNames: ['WELTplus', 'WELT am SONNTAG', 'DIE WELT', 'WELT ONLINE'],
    },
  },
  'www.sueddeutsche.de': {
    testSetup: getConsentCdnSetup({}),
    examples: [
      {
        url: 'https://www.sueddeutsche.de/kultur/milch-ernaehrung-klimawandel-1.5521054?reduced=true',
        selectors: {
          query:
            'Zeit um die Mitte der Sechziger hörte die Jugend des Westens einen Song',
        },
      },
      {
        url: 'https://www.sueddeutsche.de/projekte/artikel/politik/lkw-unfaelle-beim-abbiegen-im-toten-winkel-e744638/?reduced=true',
        selectors: {
          query:
            'Lastwagen in die Konstanzer Straße biegt obwohl er doch eigentlich anhalten müsste hat',
        },
      },
    ],
    selectors: {
      // query: "article > header > h2 > span:last-child",
      query: (root) => {
        const normalArticle: HTMLElement = root.querySelector(
          '[itemprop="articleBody"] > p',
        )
        if (normalArticle) {
          return extractQuery(normalArticle, false)
        }
        const reportage: HTMLElement = root.querySelector(
          '.module-text .text p',
        )
        if (reportage) {
          return extractQuery(reportage, false)
        }
      },
      date: 'time',
      paywall: '#sz-paywall',
      main: (root) => {
        const normalMain: HTMLElement = root.querySelector(
          "div[itemprop='articleBody']",
        )
        if (normalMain) {
          return normalMain
        }
        return root.querySelector('.module-text .text')
      },
    },
    start: (root) => {
      const p: HTMLElement = root.querySelector(
        '.sz-article-body__paragraph--reduced',
      )
      if (p) {
        p.className = 'sz-article-body__paragraph'
      }
      const offer: HTMLElement = root.querySelector('#sz-paywall')
      if (offer) {
        offer.style.display = 'none'
      }
    },
    mimic: '.sz-article-body__paragraph',
    paragraphStyle: {
      style: 'margin-bottom: 1rem',
    },
    waitOnLoad: 500,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SZ,SZDE,SZPT,SZPW,SZRE,SZW,SZMA,SZMO',
      sourceNames: [
        'Süddeutsche Zeitung (SZ)',
        'sueddeutsche.de',
        'Süddeutsche Zeitung PRIMETIME',
        'Süddeutsche Zeitung Plan W',
        'Süddeutsche Zeitung - Regionalteile',
        'Süddeutsche Zeitung WISSEN',
        'Süddeutsche Zeitung Magazin',
        'Süddeutsche Zeitung Magazin Online',
      ],
    },
  },
  'sz-magazin.sueddeutsche.de': {
    selectors: {
      query: makeQueryFunc('.articlemain__content'),
      date: 'time',
      paywall: '.offerpage-container',
      main: '.articlemain__content',
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
      dbShortcut: 'SZMA,SZMO',
      sourceNames: [
        'Süddeutsche Zeitung Magazin',
        'Süddeutsche Zeitung Magazin Online',
      ],
    },
  },
  'www.handelsblatt.com': {
    selectors: {
      query: makeQueryFunc(
        'app-storyline-element app-storyline-paragraph app-rich-text p',
        true,
        4,
      ),
      date: 'app-story-date',
      paywall: 'app-paywall, hb-paywall-hplus',
      main: 'app-storyline-elements',
    },
    // start: (root) => {
    //   Array.from(root.querySelectorAll('.c-paywall')).forEach((el: HTMLElement) => {
    //     el.style.display = 'none'
    //   })
    // },
    dateRange: [40, 5],
    waitOnLoad: 4000,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'HBLATE,HBONLATE,HBGM,HBLI,HBMA,HBMBLATE,HBZ',
      sourceNames: [
        'Handelsblatt',
        'Handelsblatt online',
        'Handelsblatt Global Magazin',
        'Handelsblatt Live',
        'Handelsblatt Magazin',
        'Handelsblatt Morning Briefing',
        'Handelsblatt10',
      ],
    },
  },
  'www.berliner-zeitung.de': {
    examples: [
      {
        url: 'https://www.berliner-zeitung.de/mensch-metropole/unterwegs-mit-der-mutter-des-satans-der-sprengstoff-mann-vom-bahnhof-neukoelln-li.2326828',
        selectors: {
          query:
            '"Geldautomaten aufgesprengt haben und der Komplize des lange gesuchten „Bomben-Mannes“ vom S-Bahnhof Neukölln"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc(['#articleBody']),
      main: '#articleBody',
      paywall: 'div[class*="soft-paywall"]',
    },
    waitOnLoad: 500,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'BEZE',
      sourceNames: ['Berliner Zeitung'],
    },
  },
  'www.morgenpost.de': {
    testSetup: getCmpBoxConsent(),
    examples: [
      {
        url: 'https://www.morgenpost.de/bezirke/pankow/article234644603/Hindernisstrecke-Schoenhauser-Allee.html',
        selectors: {
          query:
            '"Schönhauser Allee in Prenzlauer Berg gilt als Unfallschwerpunkt für Radfahrer Eine Tour auf"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.article-body'),
      // query: (root) => {
      //   return root.querySelector('.article__header__intro__text').innerText.split(' ').slice(0, 8).join(' ')
      // },
      main: '.article-body',
      paywall: '#paywall-container',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'BMP,BMPO',
      sourceNames: ['Berliner Morgenpost', 'Berliner Morgenpost online'],
    },
  },
  'www.moz.de': {
    selectors: {
      query: (root) => {
        return root.querySelector('title').innerText.split('|')[0].trim()
      },
      main: '.article-content .article-text',
      paywall: '.article-content.paywall .justify-content-center',
    },
    start: (root) => {
      const p = root.querySelector('.article-content')
      if (p) {
        p.classList.remove('paywall')
      }
    },

    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MOZ',
      sourceNames: ['Märkische Oderzeitung'],
    },
  },
  'www.maz-online.de': {
    ...RND,
    sourceParams: {
      dbShortcut: 'MAER',
      sourceNames: ['Märkische Allgemeine'],
    },
  },
  'www.lr-online.de': {
    selectors: {
      query: makeQueryFunc('.article-text .text'),
      paywall: '#paywall-container',
      date: 'time',
      main: '.article-text',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'LR',
      sourceNames: ['Lausitzer Rundschau - Elbe-Elster-Rundschau'],
    },
  },

  'www.nordkurier.de': {
    selectors: {
      query: 'article h1',
      main: '.article-content',
      paywall: '.nk-plus-subscription-options-breaker',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'NKU',
      sourceNames: ['Nordkurier'],
    },
  },
  'www.noz.de': {
    testSetup: getConsentCdnSetup({ pageChanges: false }),
    examples: [
      {
        url: 'https://www.noz.de/lokales/hasbergen/artikel/im-angesicht-des-kriegs-ausstellung-am-augustaschacht-hasbergen-23451387',
        selectors: {
          query:
            '"angemessen in der Gedenkstätte Augustaschacht in Hasbergen eine Ausstellung zur Erinnerung an die"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('p.w-600'),
      main: '.content--group__section:last-child',
      date: '[itemprop="datePublished"]',
      paywall: '.paywall',
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
      dbShortcut: 'NOZ',
      sourceNames: ['Neue Osnabrücker Zeitung'],
    },
  },
  'www.abendblatt.de': {
    selectors: {
      query: makeQueryFunc('.article-body p, .article-body li'),
      main: '.article-body',
      date: 'time',
      paywall: '#paywall-container',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'HA,HABO,BEZG',
      sourceNames: [
        'Hamburger Abendblatt',
        'Hamburger Abendblatt online',
        'Bergedorfer Zeitung',
      ],
    },
  },
  'www.waz.de': {
    selectors: {
      query: 'h2',
      date: 'time',
      paywall: '#paywall-container',
      main: '.article__header__intro',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'WAZ',
      sourceNames: ['Westdeutsche Allgemeine Zeitung'],
    },
  },
  'www.wiwo.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp-sp' }),
    examples: [
      {
        url: 'https://www.wiwo.de/my/unternehmen/industrie/mischkonzern-zeppelin-ein-ausschluss-russlands-aus-swift-wuerde-eine-weltwirtschaftskrise-ausloesen/28091946.html',
        selectors: {
          query:
            'Mischkonzern Zeppelin vertreibt unter anderem US-amerikanische Baumaschinen in Russland und der Ukraine Ein',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('app-header-content-lead-text', false),
      main: 'app-story-detail-page article app-blind-text',
      paywall: 'app-paywall',
      date: 'app-story-date',
    },
    start: (root) => {
      const blindText = root.querySelector('app-blind-text')
      blindText.classList.remove('blurry-text')
      blindText.querySelector('app-storyline-elements')?.remove()
      const paywall: HTMLElement = root.querySelector('app-paywall')
      if (paywall) {
        paywall.style.display = 'none'
      }
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()
      main.innerHTML += content
    },
    dateRange: [8, 1], // search from roughly week before
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'WWLATE,WWONLATE,WWBW,WWGR',
      sourceNames: [
        'WirtschaftsWoche',
        'WirtschaftsWoche online',
        'WirtschaftsWoche Green',
      ],
    },
    waitOnLoad: 2000,
  },
  'www.heise.de': {
    examples: [
      {
        url: 'https://www.heise.de/select/ct/2024/2/2332712400232749829',
        selectors: {
          query:
            '"auf die meistbesuchten Sites eine Übersicht der wichtigsten News eine To-do-Liste der Kalender"',
        },
      },
      {
        url: 'https://www.heise.de/select/mac-and-i/2024/7/2409908264603741326',
        selectors: {
          query:
            '"Intelligenz ahmt menschliche Intelligenz nach um etwa beim Erstellen von Texten und Bildern"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc([
        '.article-layout__content p:not(:first-child)',
        'article.xp__article p.xp__paragraph',
      ]),
      date: 'time',
      paywall:
        '.js-upscore-article-content-for-paywall,a-paid-content-teaser, #purchase, .accordion__wrapper',
      main: '.article-layout__content .article-content, article.xp__article',
      // select p before paywall element
      loader:
        '.article-layout__content p:has( + a-gift, a-paid-content-teaser, #purchase)',
    },
    dateRange: [8, 1], // search from 7 days before to one day after given date
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'HEON,MACI,TERE,CT,CTFO,IX,MAKE',
      sourceNames: [
        'Heise online',
        "c't - magazin für computertechnik (CT)",
        "c't Digitale Fotografie",
        'Mac & I',
        'iX - Magazin für professionelle Informationstechnik',
      ],
    },
    waitOnLoad: 2000,
  },
  'www.nachrichten.at': {
    examples: [
      {
        url: 'https://www.nachrichten.at/meinung/kommentare/eine-mahnung;art210749,3586439',
        selectors: {
          query:
            '"nicht schnell eine Lösung für unser Energiesystem finden dann werden Finanzminister Brunner bzw"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.articleDetail__content'),
      date: '.articleDetail .text-teaser.text-darkgrey',
      paywall: '.oonplusOverlay',
      main: '#artikeldetailText',
    },
    start: (root) => {
      if (typeof window.oonObj === 'undefined') {
        root.querySelector('.oonplusOverlay')?.remove()
      } else {
        window.oonObj.isGaa = function () {
          return true
        }
      }
      const p = root.querySelector('#artikeldetailText')
      if (p) {
        p.classList.remove('plusTextFadeout')
      }
    },
    paragraphStyle: {
      className: 'ArtikelText',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'OOEN',
      sourceNames: ['Oberösterreichische Nachrichten'],
    },
  },
  'ga.de': {
    ...GA,
    sourceParams: {
      dbShortcut: 'GAZ',
      sourceNames: ['Bonner General-Anzeiger'],
    },
  },
  'www.ksta.de': {
    ...KSTA,
    sourceParams: {
      dbShortcut: 'KSTA',
      sourceNames: ['Kölner Stadt-Anzeiger'],
    },
  },
  'www.rundschau-online.de': {
    ...KSTA,
    sourceParams: {
      dbShortcut: 'KR',
      sourceNames: ['Kölnische Rundschau'],
    },
  },
  'rp-online.de': {
    ...GA,
    sourceParams: {
      dbShortcut: 'RP',
      sourceNames: ['Rheinische Post'],
    },
  },
  'www.tagesanzeiger.ch': {
    selectors: {
      query: 'article > p span',
      date: 'time',
      paywall: '#piano-premium',
      main: 'article',
    },
    mimic: (content, main) => {
      const className = main.parentNode.querySelector('article > p').className
      return content.replace(/<p>/g, `<p class="${className}">`)
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()
      const paras = main.parentNode.querySelectorAll(
        'article figure + p, article p + p',
      )
      Array.from(paras).forEach((p) => p.remove())
      main.innerHTML += content
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'TAG,TAS',
      sourceNames: ['Tages-Anzeiger', 'Tages-Anzeiger SonntagsZeitung'],
    },
  },
  'www.falter.at': {
    testSetup: async (page) => {
      await page.locator('#didomi-notice-disagree-button').click()
    },
    examples: [
      {
        url: 'https://www.falter.at/zeitung/20220223/sie-reden-vom-krieg/_27de9dfaf4',
        selectors: {
          query:
            '"Staatsflaggen und wuchtigen Festnetztelefonen sitzt Russlands Präsident Wladimir Putin am Montagabend als er"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('article > p'),
      date: 'time',
      paywall:
        'main article section.not-prose:has(a[href*="https://mein.falter.at/falter/sales-funnel-frontend"])',
      main: 'article > p',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'FALT',
      sourceNames: ['Falter (APA)'],
    },
  },
  'www.stuttgarter-zeitung.de': {
    testSetup: getConsentCdnSetup({ pageChanges: false }),
    examples: [
      {
        url: 'https://www.stuttgarter-zeitung.de/inhalt.probleme-bei-der-abrechnung-warum-ein-stuttgarter-impfarzt-schlaflose-naechte-hatte.98bea27d-f195-4bda-899b-8221d3d7f901.html?reduced=true',
        selectors: {
          query:
            '"Schlaflose Nächte hat Christian Schweninger hinter sich die vergangenen zweieinhalb Monate seien „heftig“"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.article-body > p'),
      date: 'span[itemprop="datePublished"]',
      paywall: '.mod-paywall',
      main: '.article-body > p',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'STZ',
      sourceNames: ['Stuttgarter Zeitung'],
    },
  },
  'www.stuttgarter-nachrichten.de': {
    testSetup: getConsentCdnSetup({ pageChanges: false }),
    examples: [
      {
        url: 'https://www.stuttgarter-nachrichten.de/inhalt.e-mobilitaet-in-stuttgart-zahl-privater-e-ladestellen-waechst-deutlich.a3a5609d-b274-4ac3-a2b1-2558da9a1d69.html?reduced=true',
        selectors: {
          query:
            '"8400 E-Autos sind in Stuttgart zugelassen Dazu kommen noch mehr als 22 000 Plug-in-Hybride"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.article-body > p'),
      date: 'span[itemprop="datePublished"]',
      paywall: '.mod-paywall',
      main: '.article-body > p',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'STN',
      sourceNames: ['Stuttgarter Nachrichten'],
    },
  },
  'www.ostsee-zeitung.de': {
    testSetup: getConsentCdnSetup({ pageChanges: false, framePart: 'cmp-sp' }),
    examples: [
      {
        url: 'https://www.ostsee-zeitung.de/Mecklenburg/Rostock/Zu-gefaehrlich-fuer-Radfahrer-Kommt-Tempo-30-fuer-die-Rostocker-Dethardingstrasse',
        selectors: {
          query:
            '"gerne eine Radfahrer-Stadt Doch für diesen Anspruch gibt es noch zu viele heikle"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.paywalledContent > p'),
      date: 'time',
      paywall: '#piano-lightbox-article-oz',
      main: 'header .paywalledContent',
    },
    waitOnLoad: true,
    start: (root) => {
      const main: HTMLElement = root.querySelector(
        'header div[class*="ArticleHeadstyled__ArticleTeaserContainer"]',
      )
      main.style.height = 'auto'
      main.style.overflow = 'auto'
      //   const obj = JSON.parse(document.evaluate('//script[@type="application/ld+json" and contains(./text(), "mainEntityOfPage")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent)
      //   paywall.textContent = obj.articleBody
      //   return true
    },
    mimic: '*[class*="Textstyled__InlineText"]',
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'OSZ',
      sourceNames: ['Ostsee-Zeitung'],
    },
  },
  'www.stimme.de': {
    testSetup: async (page) => {
      await page.locator('#cmpwrapper').evaluate((node) => {
        const el: HTMLAnchorElement =
          node.shadowRoot.querySelector('#cmpwelcomebtnyes')
        el.click()
      })
    },
    examples: [
      {
        url: 'https://www.stimme.de/regional/region/informationsfreiheit-wenn-in-akten-blaettern-10000-euro-kostet-art-4598515',
        selectors: {
          query:
            '"was eine Behörde tut ist irgendwo verzeichnet in Aktenordnern oder digital"',
        },
      },
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
      main: '.art-text p',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'HST',
      sourceNames: ['Heilbronner Stimme'],
    },
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
            const switchedArticle =
              mutations.find(
                (m) =>
                  [...m.addedNodes.values()].find(
                    (n: HTMLElement) =>
                      n.nodeName === 'ARTICLECOMP' &&
                      n.className === 'ng-star-inserted',
                  ) !== undefined,
              ) !== undefined
            if (switchedArticle) {
              sitebot.start()
            }
          })
          window.bibbotObserver.observe(root, {
            subtree: true,
            childList: true,
          })
        }
        return root.querySelector(paywall)
      },
      main: '.article-paragraphs paragraph:first-of-type .paragraph',
    },
    start: (root, paywall) => {
      const div = root.querySelector('.article-paragraphs')
      if (div) {
        div
          .querySelectorAll('.article-paragraphs > .ng-star-inserted')
          .forEach((e) => {
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
      dbShortcut: 'KUR',
      sourceNames: ['Kurier (APA)'],
    },
    waitOnLoad: true,
  },
  'freizeit.at': {
    examples: [
      {
        url: 'https://freizeit.at/zeitgeist/will-smith-als-tennisvater-koeniginnen-des-tenniscourts/401915917',
        selectors: {
          query:
            '"sie Venus und Serena Williams sind moderne Amazonen athletisch ehrgeizig kämpferisch Weltklasse-Tennisspielerinnen die"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.article-main .paragraph p:nth-of-type(2)'),
      date: '.headerComp-author-date',
      paywall: '#cfs-paywall-container',
      main: '.article-main .paragraph',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'KUR',
      sourceNames: ['Kurier (APA)'],
    },
  },
  'www.diepresse.com': {
    examples: [
      {
        url: 'https://www.diepresse.com/6103269/das-home-office-gesetz-laesst-vieles-im-dunkeln',
        selectors: {
          query:
            '"praxistauglich ist das Home-Office-Gesetz Schon vor einem Jahr wurde darüber heftig diskutiert Anlass"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('#article-body p:not(.lead)'),
      date: '.meta__date',
      paywall: '.vued--premium-content',
      main: '#article-body',
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()

      const div = document.createElement('div')
      div.innerHTML = content
      div.querySelector('p:first-of-type').classList.add('lead')
      const contentArray = Array.from(div.childNodes)

      main.querySelectorAll('#article-body > p').forEach((p) => p.remove())
      main.prepend(...contentArray)
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'PRE',
      sourceNames: ['Die Presse - Österreichische Tageszeitung'],
    },
  },
  'www.sn.at': {
    // FIXME: page never finishes loading...
    // testSetup: async (page) => {
    //   await page.getByRole('button', { name: 'Akzeptieren' }).click()
    // },
    // examples: [
    //   {
    //     url: 'https://www.sn.at/salzburg/chronik/nach-toedlichem-unfall-mit-polizeibus-im-lungau-verfahren-gegen-lenker-eingestellt-117530491',
    //     selectors: {
    //       query:
    //         '"nach dem Unfalldrama im Lungau bei dem ein 15-jähriger Mopedlenker getötet wurde ist"',
    //     },
    //   },
    // ],
    selectors: {
      query: makeQueryFunc('.article-body-text'),
      date: '.article-publication-date',
      paywall: '.article-sections__paywall',
      main: '.article-body-text',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SN',
      sourceNames: ['Salzburger Nachrichten (APA)'],
    },
  },
  'www.kleinezeitung.at': {
    testSetup: getConsentCdnSetup({
      framePart: 'cmp-consent-tool.privacymanager',
      button: '#save',
    }),
    examples: [
      {
        url: 'https://www.kleinezeitung.at/steiermark/weiz/6100137/Gefaehrlicher-Trend_Uebelkeit-Herzrasen_Nikotinbeutel-machen-bei',
        selectors: {
          query:
            '"Skruf Faro Lyft und Velo riechen nach Menthol oder Minze und erinnern in"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.article-body p'),
      date: 'time',
      paywall: '#pianoPaywall',
      main: '.article-body div',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'KLEI',
      sourceNames: ['Kleine Zeitung (APA)'],
    },
  },
  'www.thueringer-allgemeine.de': {
    testSetup: getCmpBoxConsent(),
    examples: [
      {
        url: 'https://www.thueringer-allgemeine.de/sport/kommentar-von-wegen-sportstadt-erfurt-id234487935.html',
        selectors: {
          query: 'Von wegen Sportstadt Erfurt',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('article h2', false),
      date: 'time',
      paywall: '#paywall-container',
      main: '.article-body',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'TA',
      sourceNames: ['Thüringer Allgemeine'],
    },
  },
  'www.mopo.de': {
    testSetup: consentShadowRoot({}),
    examples: [
      {
        url: 'https://www.mopo.de/hamburg/vor-29-jahren-stillgelegt-das-wird-jetzt-aus-dem-schellfischtunnel/?reduced=true',
        selectors: {
          query:
            '"und knarzt als Ines Hinrichs vom Landesbetrieb Straßen Brücken und Gewässer LSBG das"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.elementor-widget-theme-post-content'),
      date: '.elementor-post-info__item--type-date',
      paywall: '#paywall',
      main: '.elementor-widget-theme-post-content > .elementor-widget-container > div > div',
    },
    start: (root) => {
      const p = root.querySelector('.paywall-fade')
      if (p) {
        p.classList.remove('paywall-fade')
      }
      const paywall: HTMLElement = root.querySelector(
        '.elementor-widget-theme-post-content > .elementor-widget-container > div > div[data-elementor-type="section"]',
      )
      if (paywall) {
        paywall.style.display = 'none'
      }
    },
    waitOnLoad: 1000,
    source: 'genios.de',
    dateRange: [14, 1],
    sourceParams: {
      dbShortcut: 'MOPO',
      sourceNames: ['Hamburger Morgenpost'],
    },
  },
  'www.saechsische.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp-sp' }),
    examples: [
      {
        url: 'https://www.saechsische.de/lokales/dresden/ocg-sekte-dresdner-lehrerin-gehoert-zum-fuehrungskreis-W6O37RLLZLV4K3G7WI3DPTAV3E.html',
        selectors: {
          query:
            '"in einer Sekte war teils bekannt Jetzt kommt heraus Die Lehrerin aus Dresden"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.paywalledContent', true),
      headline: 'h2',
      paywall: 'div[data-testid="piano-container"]',
      main: 'div[data-testid="article-teaser-content"]',
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
      dbShortcut: 'SZO,SSDE',
      sourceNames: ['Sächsische Zeitung', 'sächsische.de'],
    },
  },
  'www.freiepresse.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp2.freiepresse.de' }),
    examples: [
      {
        url: 'https://www.freiepresse.de/chemnitz/einwohnerversammlungen-in-chemnitz-kuenftig-wieder-vor-ort-artikel13507031',
        selectors: {
          query:
            'wird es künftig wieder Einwohnerversammlungen in den Stadtteilen geben Das hat der neu',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.article__shorttext', false),
      headline: '.article__headline',
      paywall: '.upscore-paywall-placeholder',
      date: '.article__etag div',
      main: '#artikel-content',
    },
    waitOnLoad: true,
    dateRange: [8, 5], // search from roughly week before
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'FEPR',
      sourceNames: ['Freie Presse'],
    },
  },
  'www.haz.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp-sp.haz.de' }),
    examples: [
      {
        url: 'https://www.haz.de/der-norden/tour-mit-9-euro-ticket-auf-dem-sofa-bei-hitzacker-ueber-die-elbe-schippern-UO2T7PN7TB73CND54EVFCMYVA4.html',
        selectors: {
          query:
            'dem 9-Euro-Ticket Bei Hitzacker auf dem Sofa über die Elbe schippern',
        },
      },
    ],
    ...RND,
    sourceParams: {
      dbShortcut: 'HAZ',
      sourceNames: ['Hannoversche Allgemeine Zeitung'],
    },
  },
  'www.lvz.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp-sp.lvz.de' }),
    examples: [
      {
        url: 'https://www.lvz.de/lokales/leipzig/lvb-letzte-xl-strassenbahn-ist-da-tatras-verabschieden-sich-aus-leipzig-KJTZK5LMTYO7SABWWZTM2CT37A.html',
        selectors: {
          query:
            '"LVB-Zentrum Heiterblick ist am Dienstag die letzte XL-Straßenbahn aus Polen angekommen Damit ist"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.paywalledContent > p'),
      date: 'time',
      paywall: '#piano-lightbox-article-lvz',
      main: 'header .paywalledContent',
    },
    waitOnLoad: true,
    start: (root) => {
      const main: HTMLElement = root.querySelector(
        'div[class*="ArticleHeadstyled__ArticleTeaserContainer"]',
      )
      main.style.height = 'auto'
      main.style.overflow = 'auto'
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()
      main.querySelector('span[class*="Textstyled__InlineText"]').innerHTML =
        content
      main.parentElement.childNodes.forEach((node, i) => {
        if (i > 0) {
          node.remove()
        }
      })
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'LVZ',
      sourceNames: ['Leipziger Volkszeitung'],
    },
  },
  'www.dnn.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cmp-sp.dnn.de' }),
    examples: [
      {
        url: 'https://www.dnn.de/lokales/dresden/laesst-dresden-800-wartehaeuschen-schreddern-FCEJWIVOHYVCWZ7OYHCO42YBVE.html',
        selectors: {
          query:
            '"800 Wartehäuschen bieten in Dresden den Fahrgästen von Bussen und Straßenbahnen Schutz vor"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.paywalledContent > p'),
      date: 'time',
      paywall: '#piano-lightbox-article-dnn',
      main: 'header .paywalledContent',
    },
    waitOnLoad: true,
    start: (root) => {
      const main: HTMLElement = root.querySelector(
        'div[class*="ArticleHeadstyled__ArticleTeaserContainer"]',
      )
      main.style.height = 'auto'
      main.style.overflow = 'auto'
    },
    insertContent: (siteBot, main, content) => {
      siteBot.hideBot()
      main.querySelector('span[class*="Textstyled__InlineText"]').innerHTML =
        content
      main.parentElement.childNodes.forEach((node, i) => {
        if (i > 0) {
          node.remove()
        }
      })
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'DNN',
      sourceNames: ['Dresdner Neueste Nachrichten'],
    },
  },
  'www.swp.de': {
    testSetup: getConsentCdnSetup({ framePart: 'cdn.privacy-mgmt.com' }),
    examples: [
      {
        url: 'https://www.swp.de/lokales/ulm/mobilitaet-in-ulm-verkehrswende-in-ulm_-es-ist-noch-viel-luft-nach-oben-65149611.html',
        selectors: {
          query: 'Verkehrswende in Ulm Es ist noch viel Luft nach oben',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc(
        'article h1 span.u-article-header__headline',
        false,
        0,
      ),
      headline: 'article h1 span.u-article-header__headline',
      paywall: '.u-paywall',
      main: 'article figure',
    },
    insertAfterMain: true,
    waitOnLoad: 1000,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SWP',
      sourceNames: ['SÜDWEST PRESSE'],
    },
  },
  'www.ruhrnachrichten.de': {
    testSetup: getCmpBoxConsent(),
    selectors: {
      query: makeQueryFunc('.entry__content > p'),
      headline: 'h1.entry__title',
      date: 'time',
      paywall: '.PremiumContent',
      main: '.entry__content',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'RN',
      sourceNames: ['Ruhr Nachrichten'],
    },
  },
  'www.businessinsider.de': {
    testSetup: getConsentCdnSetup({
      pageChanges: false,
      framePart: 'cdn.privacy-mgmt.com',
      button: 'sp_choice_type_11',
    }),
    selectors: {
      query: makeQueryFunc('.piano-article__content > p'),
      headline: 'h2.entry-title',
      date: 'time',
      paywall: '.piano-article__paywall',
      main: '.piano-article__content',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'BUIN',
      sourceNames: ['BUSINESS INSIDER DEUTSCHLAND'],
    },
  },
  'www.badische-zeitung.de': {
    selectors: {
      query: makeQueryFunc('.artikelPreview'),
      headline: 'h1',
      date: 'p.article__header__info-area__txt a[href*="/archiv"]',
      paywall: '#regWalli',
      main: '.artikelPreview',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'BADZ',
      sourceNames: ['Badische Zeitung'],
    },
  },
  'www.stern.de': {
    testSetup: consentShadowRoot({}),
    examples: [
      {
        url: 'https://www.stern.de/hochzeitsplanung--was-ich-gerne-gewusst-haette--bevor-ich-heirate-35439596.html',
        selectors: {
          query:
            '"mich schon lange vor dem Antrag auf die Hochzeit gefreut Dann fing ich"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc([
        '.article__body p.is-initial',
        '.intro.u-richtext',
      ]),
      headline: 'h2 .title__headline',
      date: 'time',
      paywall: '.article__body .paid-barrier',
      main: '.article__body',
    },
    dateRange: [50, 2],
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'STER,STGL,GEO,GEOS,GEOW,GESP,GEOE,CAPI',
      sourceNames: [
        'Stern',
        'STERN Gesund leben',
        'GEO',
        'GEO Saison',
        'GEO Wissen',
        'GEO Special',
        'GEO SAISON Extra',
        'Capital',
      ],
    },
  },
  'www.mittelbayerische.de': {
    testSetup: consentShadowRoot({}),
    examples: [
      {
        url: 'https://www.mittelbayerische.de/lokales/stadt-regensburg/geister-parkhaus-am-regensburger-tech-campus-die-nutzungsquote-steigt-14904402',
        selectors: {
          query:
            '"„vollkommen lächerlichen“ Nutzungsquote machte im Sommer das neue Parkhaus am Regensburger Tech-Campus Schlagzeilen"',
        },
      },
    ],
    selectors: {
      query: makeQueryFunc('.article-detail-entry-content'),
      headline: '.article-detail-headline',
      date: '.date-published',
      paywall: '.paywall-layer',
      main: '.article-detail-entry-content',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MIB',
      sourceNames: ['Mittelbayerische Zeitung'],
    },
  },
  'www.tagblatt.de': {
    selectors: {
      query: makeQueryFunc('h1'),
      headline: 'h1',
      date: '.artikelhead > span',
      main: '.StoryShowBody',
      paywall: '.Paywall',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'STT',
      sourceNames: ['Schwäbisches Tagblatt'],
    },
  },
  'www.mz.de': {
    selectors: {
      query: makeQueryFunc('article .fp-paragraph'),
      headline: 'article .fp-article-heading__title',
      date: 'article .fp-article-heading__date',
      main: 'article .fp-article-body',
      paywall: 'article .fp-paywall',
    },
    mimic: (content) => {
      return content.replace(/<p>/g, '<p class="fp-paragraph">')
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'MZ',
      sourceNames: ['Mitteldeutsche Zeitung'],
    },
  },
  'www.capital.de': {
    selectors: {
      query: makeQueryFunc('.article__body p.text-element'),
      headline: '.title__headline',
      date: 'time',
      main: '.article__body',
      paywall:
        'html:not(.has-paid-access):not(.has-full-access) .title__logo--capital_plus',
    },
    dateRange: [10, 1],
    paragraphStyle: {
      selector: 'p.text-element',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'CAPI',
      sourceNames: ['Capital'],
    },
  },
  'www.geo.de': {
    selectors: {
      query: makeQueryFunc('.article__body p.text-element'),
      headline: '.title__headline',
      date: 'time',
      main: '.article__body',
      paywall:
        'html:not(.has-paid-access):not(.has-full-access) .title__logo--geo_plus',
    },
    dateRange: [10, 1],
    paragraphStyle: {
      selector: 'p.text-element',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'GEO,GEOS,GEOW,GESP,GEOE',
      sourceNames: [
        'GEO',
        'GEO Saison',
        'GEO Wissen',
        'GEO Special',
        'GEO SAISON Extra',
      ],
    },
  },
  'www.iz.de': {
    selectors: {
      query: makeQueryFunc('.ArticleCopy'),
      headline: '.ArticleHeader_headline',
      date: '.PublishDate_date',
      main: '.ArticleCopy',
      paywall: '.Paywall',
    },
    dateRange: [10, 1],
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'IMMO',
      sourceNames: ['Immobilien Zeitung'],
    },
  },
  'www.shz.de': {
    selectors: {
      query: makeQueryFunc('h1 span:nth-child(2)'),
      headline: 'h1 span:nth-child(2)',
      date: '.meta-box__meta',
      main: '.content--group__article section p',
      paywall: '.paywall',
    },
    source: 'genios.de',
    sourceParams: {
      dbShortcut:
        'ELNA,PBTB,QBTB,SHTB,UENR,WETB,BSZG,WIZE,SYR,STTB,SCHN,SCHB,OHAN,NRU,NFTB,SHL,IB,HN,HCOU,GF,FTB,ECTB',
      sourceNames: [
        'Elmshorner Nachrichten',
        'Pinneberger Tageblatt',
        'Quickborner Tageblatt',
        'Schenefelder Tageblatt',
        'Uetersener Nachrichten',
        'Wedel-Schulauer Tageblatt',
        'Barmstedter Zeitung',
        'Wilstersche Zeitung',
        'Sylter Rundschau',
        'Stormarner Tageblatt',
        'Schleswiger Nachrichten',
        'Schlei-Bote',
        'Ostholsteiner Anzeiger',
        'Norddeutsche Rundschau',
        'Nordfriesland Tageblatt',
        'Schleswig-Holsteinische Landeszeitung',
        'Der Insel-Bote',
        'Husumer Nachrichten',
        'Holsteinischer Courier',
        'Glückstädter Fortuna',
        'Flensburger Tageblatt',
        'Eckernförder Zeitung',
      ],
    },
  },
  'www.aerztezeitung.de': {
    selectors: {
      query: makeQueryFunc('.StoryShowBox p'),
      date: () =>
        document
          .querySelector("meta[name='date']")
          .attributes.getNamedItem('content').value,
      headline: '.article-heading',
      main: '.StoryShowBox',
      paywall: '.AZLoginModule',
    },
    waitOnLoad: true,
    dateRange: [25, 1],
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'AEZT',
      sourceNames: ['Ärzte Zeitung'],
    },
  },
  'www.nzz.ch': {
    selectors: {
      query: makeQueryFunc('.articlecomponent.text'),
      date: 'time',
      headline: '.headline__title',
      main: '.articlecomponent.text',
      paywall: '.dynamic-regwall',
    },
    waitOnLoad: 1500,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'NZZ,NZZS',
      sourceNames: ['Neue Zürcher Zeitung (NZZ)', 'NZZ am Sonntag'],
    },
  },
  'www.nwzonline.de': {
    examples: [
      {
        url: 'https://www.nwzonline.de/oldenburg/kauf-uebernahme-und-erwartungen_a_4,0,3585174512.html',
        selectors: {
          query: 'Die Übernahme – und der Standort Oldenburg',
        },
      },
    ],
    selectors: {
      query: () =>
        document
          .querySelector('meta[property="cleverpush:description"]')
          .attributes.getNamedItem('content').value,
      date: 'time',
      main: '.article-body',
      paywall: '.piano.piano-target',
    },
    waitOnLoad: true,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'NOW',
      sourceNames: ['Nordwest-Zeitung'],
    },
  },
  'www.saarbruecker-zeitung.de': {
    selectors: {
      query: makeQueryFunc('div[data-cy="article-content-text"]'),
      date: 'time',
      main: 'div[data-cy="article-content-text"]',
      paywall: '.park-article-reduced-overlay',
    },
    mimic: 'div[data-cy="article-content-text"] p',
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'SAAR',
      sourceNames: ['Saarbrücker Zeitung'],
    },
  },
  'www.idowa.de': {
    selectors: {
      query: (root) => {
        const article: HTMLElement = root.querySelector('.copy.paywal')
        return extractQuery(article)
      },
      date: 'time',
      paywall: '.paywall-call-to-action-box',
      main: '.copy.paywal',
    },
    start: (root) => {
      const paywall: HTMLElement = root.querySelector(
        '.paywall-call-to-action-box',
      )
      paywall.style.display = 'none'
    },
    mimic: (content) => {
      return content
    },
    waitOnLoad: true,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'LAZ,REGZ,STAG',
      sourceNames: [
        'Landshuter Zeitung',
        'Regensburger Zeitung',
        'Straubinger Tagblatt',
      ],
    },
  },
  'www.aachener-zeitung.de': {
    selectors: {
      query: makeQueryFunc('article h1', false),
      date: 'article time',
      paywall: 'div[data-testid="paywall-container"]',
      main: 'main article section',
    },
    start: (root) => {
      root.classList.remove('noscroll')
      document.documentElement.classList.remove('noscroll')
      const paywall: HTMLElement = root.querySelector(
        'div[data-testid="paywall-container"]',
      )
      paywall.style.display = 'none'
      root
        .querySelector('main .paywalled-article')
        ?.classList.remove('paywalled-article')
    },
    waitOnLoad: true,
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'AAZ',
      sourceNames: ['Aachener Zeitung'],
    },
  },
  'www.nn.de': {
    selectors: {
      query: makeQueryFunc('.headline.headline--h2', false),
      date: '.article__release',
      paywall: '.paywall',
      main: '.article__richtext > div > div',
    },
    waitOnLoad: false,
    dateRange: [30, 5],
    source: 'genios.de',
    sourceParams: {
      dbShortcut: 'NN',
      sourceNames: ['Nürnberger Nachrichten'],
    },
  },
}

export default sites
