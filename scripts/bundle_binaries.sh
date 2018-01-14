#!/usr/bin/env bash

# This script recursively finds all of the releasable binaries within the release dir
# and copies them into the bundled dir
# This allows the tagged releases to be deployed to github.

if [[ "$#" -ne 2 ]]; then
    echo "Usage: bundle_binaries.sh release_dir/ bundled_dir/"
    exit 1
fi

SRC=$1 # directory containing the .app dir
DEST=$2 # the output file path

echo "Consolidating releases to $DEST";
RELEASE_PKG_FILES=$(ls $SRC/*/* | egrep '\.zip$|\.exe$|\.dmg$');
mkdir -p $DEST;
cp $RELEASE_PKG_FILES $DEST/;
ls $DEST/;
