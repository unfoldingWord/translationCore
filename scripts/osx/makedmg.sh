#!/usr/bin/env bash

if [[ "$#" -ne 3 ]]; then
    echo "Usage: makedmg.sh name src dest"
    exit 1
fi

echo "Generating DMG"

NAME=$1 # name of the application
SRC=$2 # directory containing the .app dir
DEST=$3 # the output file path

# clean up loose files
rm $SRC/LICENSE
rm $SRC/LICENSES.chromium.html
rm $SRC/version

# add .DS_Store
cp release_DS_Store $SRC/.DS_Store

# add Applications folder link
cd $SRC
ln -s /Applications Applications
cd -

# make DMG
genisoimage -V $NAME -D -R -apple -no-pad -o $DEST $SRC
