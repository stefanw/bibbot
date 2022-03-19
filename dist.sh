#!/bin/sh
set -ex

mkdir -p dist
rm -f dist/bibbot.zip
npm run build
zip -r -FS dist/bibbot.zip LICENSE README.md assets/* build/* icons/* manifest.json options/* popup/*

rm -rf dist/bibbot
unzip dist/bibbot.zip -d dist/bibbot
