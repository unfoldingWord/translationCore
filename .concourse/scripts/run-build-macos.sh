#!/bin/bash

set -xe

FILE=translationCore-macos-x64-$VERSION-$HASH.dmg

gulp build --osx || exit 1;
gulp release-macos --out=../build/$FILE || exit 1;

echo "[macOS build $HASH (v$VERSION)]($BASE_URL/$FILE) is ready for download." >> ../build_meta/comment.md
echo "<$BASE_URL/$FILE|macOS build $HASH (v$VERSION)> is ready for download." >> ../build_meta/notification.txt
