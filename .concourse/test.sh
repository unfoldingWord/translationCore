#!/usr/bin/env bash

set -xe

npm run ci-test
./node_modules/.bin/codecov
