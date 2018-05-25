#!/bin/bash

#
# Expects $PLATFORM to be set by concourse
#

set -xe

cd code-base/

node --version
npm --version

HASH=$(git rev-parse HEAD | cut -c1-7)
# echo $HASH > ../build_meta/commit.txt
VERSION=$(node -p -e "require('./package.json').version")
# echo $VERSION > ../build_meta/version.txt

npm install
npm install -g gulp@4.0.0
npm run load-apps

../code-base/.concourse/scripts/run-build-$PLATFORM.sh
