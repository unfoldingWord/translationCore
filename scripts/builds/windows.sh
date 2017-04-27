cp ./scripts/builds/index.js ./src/js/pages/index.js
cp ./scripts/builds/index.html ./index.html
babel src --out-dir src
babel tC_apps --out-dir tC_apps
node scripts/builds/build-win.js
sudo iscc .\scripts\builds\windows.iss /DVersion=${TRAVIS_TAG || TRAVIS_BRANCH}