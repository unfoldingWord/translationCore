cd node_modules/electron-packager
npm i rcedit@0.5.0
cd ../..
cp ./scripts/builds/index.js ./src/js/pages/index.js
babel src --out-dir src
babel tC_apps --out-dir tC_apps
node scripts/builds/build-win.js
node scripts/builds/build-win-installer.js
