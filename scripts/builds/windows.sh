cd node_modules/electron-packager
npm i rcedit@0.5.0
cd ../..
cp ./scripts/builds/index.js ./src/js/pages/index.js
cp ./scripts/builds/index.html ./index.html
babel src --out-dir src
babel tC_apps --out-dir tC_apps
node scripts/builds/build-win.js
iscc .\scripts\builds\windows.iss /DVersion=${TRAVIS_TAG || TRAVIS_BRANCH}