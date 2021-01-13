#!/bin/sh
rm -f voebbot.zip
zip -r -FS voebbot.zip * --exclude '*.git*' --exclude '*/.DS_Store' --exclude '*.zip' --exclude '*.sh'  --exclude '.github/*'
