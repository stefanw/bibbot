# VOEBBot

[Official website](https://stefanw.github.io/voebbot/)

## Development

This uses rollup to build the extension files. Install and run like this:

```
npm install
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


## Release

1. Update version number in `package.json` and `manifest.json` and commit.
2. `git tag vX.Y.Z`
3. `git push --tags origin main`
4. GitHub release Action will build, create release, sign Firefox extension, submit to Chrome Web Store and update website.
