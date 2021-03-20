#!/bin/sh
set -ex

mkdir -p dist
rm -f dist/voebbot.zip
npm run build
zip -r -FS dist/voebbot.zip * --exclude '*.git*' \
  --exclude '*/.DS_Store' \
  --exclude '.*' \
  --exclude 'node_modules/*' \
  --exclude 'dist/*' \
  --exclude 'src/*' \
  --exclude '*.sh' \
  --exclude '*.config.js' \
  --exclude 'package*.json' \
  --exclude 'screenshots/*' \
  --exclude '_site/*' \
  --exclude 'updates.json' \
  --exclude 'index.html' \
  --exclude 'web-ext-artifacts/*'

rm -rf dist/voebbot
unzip dist/voebbot.zip -d dist/voebbot
