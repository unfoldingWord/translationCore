#!/usr/bin/env bash

set -xe

npm --version
nvm --version

npm run ci-test
./node_modules/.bin/codecov
