#!/bin/bash

set -xe

FILE64=translationCore-win-x64-$VERSION-$HASH.setup.exe
FILE32=translationCore-win-x32-$VERSION-$HASH.setup.exe

gulp build --win || exit 1;
gulp release-win64 --out=../build/$FILE64 || exit 1;
gulp release-win32 --out=../build/$FILE32 || exit 1;

# x64
echo "[Windows build $HASH (v$VERSION)]($BASE_URL/$FILE64) is ready for download." >> ../build_meta/comment.md
echo "<$BASE_URL/$FILE64|Windows x64 build $HASH (v$VERSION)> is ready for download." >> ../build_meta/notification.txt
# x32
echo "[Windows build $HASH (v$VERSION)]($BASE_URL/$FILE32) is ready for download." >> ../build_meta/comment.md
echo "<$BASE_URL/$FILE32|Windows x32 build $HASH (v$VERSION)> is ready for download." >> ../build_meta/notification.txt
