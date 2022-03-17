#!/bin/sh
set -ex

mkdir -p dist
rm -f dist/bibbot.zip
npm run build
zip -r -FS dist/bibbot.zip * --exclude '*.git*' \
  --exclude '*/.DS_Store' \
  --exclude '.*' \
  --exclude 'node_modules/*' \
  --exclude 'dist/*' \
  --exclude 'src/*' \
  --exclude 'test_build/*' \
  --exclude 'tests/*' \
  --exclude '*.sh' \
  --exclude '*.config.js' \
  --exclude 'package*.json' \
  --exclude 'screenshots/*' \
  --exclude '_site/*' \
  --exclude 'updates.json' \
  --exclude 'index.html' \
  --exclude 'web-ext-artifacts/*'

rm -rf dist/bibbot
unzip dist/bibbot.zip -d dist/bibbot
