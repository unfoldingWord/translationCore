#!/usr/bin/env bash

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  eslint ./src || exit 1;
  jest --coverage || exit 1;
#  codecov;
  if [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    gulp build || exit 1;
    gulp release || exit 1;
  fi
elif [[ "$TRAVIS_OS_NAME" == "osx" ]] && [[ "$TRAVIS_BRANCH" =~ ^release-.*$ ]] && [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
  gulp build --osx || exit 1;
  gulp release --osx || exit 1;
fi
