#!/bin/sh
set -ex

mkdir -p build
rm -f build/voebbot.zip
zip -r -FS build/voebbot.zip * --exclude '*.git*' \
  --exclude '*/.DS_Store' \
  --exclude 'build/*' \
  --exclude '*.sh' \
  --exclude '.github/*' \
  --exclude 'screenshots/*' \
  --exclude '_site/*' \
  --exclude 'updates.json' \
  --exclude 'index.html' \
  --exclude 'web-ext-artifacts/*'

rm -rf build/voebbot
unzip build/voebbot.zip -d build/voebbot
