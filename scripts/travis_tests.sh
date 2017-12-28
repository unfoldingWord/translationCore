#!/usr/bin/env bash

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  eslint ./src || exit 1;
  jest --coverage || exit 1;
  codecov;
  gulp build || exit 1;
  gulp release;
elif [[ "$TRAVIS_OS_NAME" == "osx" ]] && [[ "$TRAVIS_BRANCH" =~ ^release-.*$ ]]; then
  gulp build --osx;
  gulp release --osx;
fi
