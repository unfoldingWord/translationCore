#!/usr/bin/env bash

set -xe

npm --version

npm run ci-test
./node_modules/.bin/codecov
