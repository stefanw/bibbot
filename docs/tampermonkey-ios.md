# BibBot with Tampermonkey on iOS

BibBot can run in Safari on iOS and iPadOS as a Tampermonkey userscript. This
target does not need an individually signed BibBot app, so it does not expire
after seven days.

The userscript currently supports the VÖBB library provider and every publisher
site in BibBot whose source is `genios.de`. Publisher selectors, query
generation, source parameters, GENIOS actions and the ASTEC/VÖBB login
definition are shared with the browser extension. The userscript only adds the
Tampermonkey-specific tab coordination, storage adapter and settings UI.

## Install on iPhone or iPad

1. Install Tampermonkey from the App Store.
2. Enable Tampermonkey under **Settings > Apps > Safari > Extensions**.
3. Allow the extension on the publisher sites you want to use and on
   `bib-voebb.genios.de` and `www.voebb.de`.
4. Open the `bibbot.user.js` asset from the latest BibBot release in Safari and
   confirm the installation in Tampermonkey.
5. Open Tampermonkey's menu on a supported publisher site and select
   **BibBot einrichten**.
6. Enter your own VÖBB user name and password and save them.

The release download URL used by the userscript is:

```text
https://github.com/stefanw/bibbot/releases/latest/download/bibbot.user.js
```

This asset becomes available once the iOS target is included in an upstream
release. For local development, build and import `dist/bibbot.user.js` instead.

## How it works

On a supported paywalled article, BibBot extracts the existing site metadata
and creates one short-lived job in Tampermonkey storage. It then opens the
VÖBB/GENIOS site in a helper tab, signs in if necessary, runs BibBot's existing
GENIOS search steps and returns the extracted article HTML to the original
tab.

The job is correlated with random origin and worker tokens. It survives normal
Safari suspension and navigation through value-change signals, tab markers,
page lifecycle events and polling. Once the article is inserted, BibBot
acknowledges the result and closes the helper tab when Tampermonkey permits it.

Only one article job runs at a time. If Safari discarded or navigated away from
the original article tab, a later article automatically removes the orphaned
job. If the original tab still exists, BibBot shows the originating domain,
age and status and offers an explicit takeover button.

## Permissions and privacy

The generated metadata contains exact HTTPS `@match` entries for:

- publisher hosts derived from `src/sites.ts` whose source is `genios.de`;
- `https://bib-voebb.genios.de/*`;
- `https://www.voebb.de/oidcp/authorize*`.

It deliberately does not request `@connect`, `GM_xmlhttpRequest`, wildcard
GENIOS hosts, cookies or WebExtension APIs.

Credentials are stored as dedicated Tampermonkey values. They are read only in
the helper tab and are not copied into the article job, status messages, error
details, result HTML or URLs. **Alle Zugangsdaten löschen** removes all BibBot
credential keys and verifies the deletion.

Users must use their own authorized library account. The userscript does not
provide, share or transmit a library account.

## Current scope and device coverage

The host list is generated from the existing BibBot GENIOS site definitions,
so publisher support does not need to be maintained twice. A build-time test
checks that the userscript and the shared site list stay in sync.

The complete flow has been exercised on a physical iPhone with current
Tampermonkey versions for:

- ZEIT;
- DER SPIEGEL;
- Tagesspiegel.

The remaining GENIOS-backed publisher definitions are shared with the desktop
extension but have not all been individually exercised on iOS. Mobile page
layout changes can still affect paywall or article selectors.

## Troubleshooting

### “Bibliothekszugangsdaten fehlen”

Open **BibBot einrichten** from Tampermonkey and save the VÖBB credentials
again. Reinstalling the userscript may clear Tampermonkey values, depending on
how it was imported.

### VÖBB asks for confirmation before GENIOS

Confirm the redirect in the helper tab. BibBot resumes when the VÖBB
authorization page or GENIOS page becomes active.

### “BibBot arbeitet bereits”

If the original article tab still exists, return to it or use **Alten Vorgang
abbrechen und hier fortfahren**. Jobs whose original tab no longer exists are
removed automatically, and all unfinished jobs expire after 15 minutes.

### The helper tab remains open

Safari may refuse scripted tab closure in some lifecycle states. Closing the
tab manually is safe; article delivery has already completed.

### A publisher page does nothing

Verify that Tampermonkey has Safari website access for that publisher and that
the page contains a paywall recognized by the shared BibBot site definition.

## Development

Install dependencies and build the userscript:

```bash
npm ci
npm run build:userscript
```

Run the complete userscript verification:

```bash
npm run check-types
npm run lint
npm run build
npm run test:userscript
```

`npm run test:userscript` builds the installable file, runs the userscript
runtime tests and verifies metadata, exact host coverage, grants, syntax and
the absence of disallowed transport APIs. The userscript version is taken from
`package.json`; it can be overridden for a local device build with
`BIBBOT_USERSCRIPT_VERSION`.

The generated file is `dist/bibbot.user.js`.
