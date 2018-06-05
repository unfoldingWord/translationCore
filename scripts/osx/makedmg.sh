#!/usr/bin/env bash

if [[ "$#" -ne 3 ]]; then
    echo "Usage: makedmg.sh name src dest"
    exit 1
fi

SCRIPT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
NAME=$1 # name of the application
SRC=$2 # directory containing the .app dir
DEST=$3 # the output file path

prep_src_dir () {
  # clean up loose files
  rm $SRC/LICENSE || true
  rm $SRC/LICENSES.chromium.html || true
  rm $SRC/version || true
  if [ -d "$SRC/Applications" ]; then
    rm $SRC/Applications
  fi

  # add .DS_Store
  cp $SCRIPT_PATH/release_DS_Store $SRC/.DS_Store

  # add Applications folder link
  cd $SRC
  ln -s /Applications Applications
  cd -
}


if [ "$(uname -s)" == "Darwin" ]; then
  echo -e "Running on OSX"
  prep_src_dir

  echo -e "Generating DMG"
  hdiutil create -volname $NAME -srcfolder $SRC -ov -format UDZO -fs HFS+ "$DEST"
  echo -e "Adding checksums"
  asr -imagescan "$DEST"
elif [ "$(uname -s)" == "Linux" ]; then
  echo -e "Running on Linux"

  if ! [ -x "$(command -v genisoimage)" ]; then
    echo "Installing dependencies"
    sudo apt-get update -d
    sudo apt-get install -y -q genisoimage
  fi

  prep_src_dir

  echo -e "Generating DMG (un-compressed)"
  genisoimage -V $NAME -D -R -apple -no-pad -o $DEST $SRC
else
  echo -e "Only Linux and OSX can generate DMG's"
fi
