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

- The content script in `src/content.js` runs on the news article page, communicates with background script
- the background script in `src/background.js` which opens new tabs, navigates them around and scrapes the content
- the options page in `src/options.js` is the options page for the extension
- the popup in `popup/` is opened when the extension icon in the toolbar is clicked

These are the data pieces inside:

- `src/providers.js` contains entities that you authenticate against and that grant access
- `src/sources.js` contains databases that you can get access to through providers
- `src/sites.js` contains news sites, how to extract their meta data and which source could provide access

Additionally user data like credentials and chosen provider is stored via `browser.storage.sync`.


## Tests

There is a test setup for sites using [Jest](https://jestjs.io/) and [Puppeteer](https://puppeteer.github.io/puppeteer/) that can be run with:

```bash
# install dependencies
npm ci
# Always run build before tests, as test uses build files!
npm run build
# Run tests
npm run test
# Run tests with actual browser window for one domain
HEADLESS=false npm run test -- -t "test www.zeit.de"
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
        // page is pupeteer page
        // use this for initial page setup
    },
// ...
```


## Release

1. Run `npm version <major|minor|patch>`
2. `git push --tags origin main`
3. GitHub release Action will build, create release, sign Firefox extension, submit to Chrome Web Store and update website.
