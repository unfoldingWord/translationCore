#!/bin/bash

set -xe

FILE=translationCore-linux-x64-$VERSION-$HASH.zip

gulp build --linux || exit 1;
gulp release-linux --out=../build/$FILE || exit 1;

echo "[Linux build $HASH (v$VERSION)]($BASE_URL/$FILE) is ready for download." >> ../build_meta/comment.md
echo "<$BASE_URL/$FILE|Linux build $HASH (v$VERSION)> is ready for download." >> ../build_meta/notification.txt
