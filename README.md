# BibBot

[Official website](https://stefanw.github.io/bibbot/)

## Development

This uses rollup to build the extension files. Install and run like this:

```sh
npm install

# Run this during development
npm start
```

## Extension overview

The extension has four different entry points:

- The content script in `src/content.ts` runs on the news article page, communicates with background script
- the background script in `src/background.ts` which opens new tabs, navigates them around and scrapes the content
- the options page in `src/options.ts` is the options page for the extension
- the popup in `popup/` is opened when the extension icon in the toolbar is clicked

These are the relevant players:

- `src/providers.ts` contains libraries that you authenticate against and that grant access
- `src/sources.ts` contains databases that you can get access to through providers
- `src/sites.ts` contains news sites, how to extract their meta data and which source could provide access

For details on how to construct any of these entities, have a look at `src/types.ts`

Additionally user data like credentials and chosen provider is stored via `browser.storage.sync`.


## Tests

There is a test setup for sites using [Playwright](https://playwright.dev/) that can be run with:

```bash
# install dependencies
npm ci
# Run linting and type checking
npm run lint
npm run check-types
# Always run build before tests, as test uses build files!
npm run build
# Run tests
npm run test
# Run tests with actual browser window for one domain
npm run test -- --headed -g "zeit.de"
```

Add testing data to site objects like this:

```javascript
// ...
  'www.example.com': {
    examples: [
      {
        url: 'http://example.com/article.html',
        selectors: {
          query: 'The string resulting from query selector'
        }
      }
    ],
    // optional setup async function
    testSetup: async (page) => {
        // page is playwright page
        // use this for initial page setup
    },
// ...
```


## Release

1. Run `npm version <major|minor|patch>`
2. `git push --tags origin main`
3. GitHub release Action will build, test, create release, sign Firefox extension, submit to Chrome Web Store and update website.
