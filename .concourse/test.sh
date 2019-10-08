#!/usr/bin/env bash

npm install -g npm@6.4.1
npm --version

set -xe

npm run ci-test
./node_modules/.bin/codecov
