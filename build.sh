#!/bin/sh
mkdir -p build
rm -f build/voebbot.zip
zip -r -FS build/voebbot.zip * --exclude '*.git*' --exclude '*/.DS_Store' --exclude 'build/*' --exclude '*.sh'  --exclude '.github/*' --exclude 'screenshots/*'
