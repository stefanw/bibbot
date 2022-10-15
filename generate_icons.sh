#!/bin/sh

pushd icons
sed 's/#029d74/#333/g' bibbot_simple.svg > bibbot_monochrome.svg

for height in 16 19 32 38 48 64 96 128 192 256 288 512 1024
do

    rsvg-convert -b "#fff" -h $height bibbot_simple.svg > bibbot-$height.png
    rsvg-convert -h $height bibbot.svg > bibbot-alpha-$height.png
    rsvg-convert -b "#fff" -h $height bibbot_monochrome.svg > bibbot-mono-$height.png

done

popd