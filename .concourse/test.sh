#!/usr/bin/env bash

set -xe

npm test
./node_modules/.bin/codecov
