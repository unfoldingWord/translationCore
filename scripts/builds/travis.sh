mono --version
cd node_modules/electron-packager
npm i rcedit@0.5.0
cd ../..
cp ./scripts/builds/index.js ./src/js/pages/index.js
babel src --out-dir src
node scripts/builds/build-win.js
echo Extracting app.asar
asar extract ./dist/translationCore-win32-ia32/resources/app.asar ./temp/app
echo Copying .bin folder
mkdir ./temp/app/node_modules/.bin/
cp -r ./scripts/builds/.bin ./temp/app/node_modules/.bin/
echo Repacking app.asar
asar pack ./temp/app ./dist/translationCore-win32-ia32/resources/app.asar
node scripts/builds/build-win-installer.js
echo Deleting temp
rm -rf temp
