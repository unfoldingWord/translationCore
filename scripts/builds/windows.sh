cp ./scripts/builds/index.js ./src/js/pages/index.js
cp ./scripts/builds/index.html ./index.html
babel src --out-dir src
babel tC_apps --out-dir tC_apps
node scripts/builds/build-win.js
unset DISPLAY
wine "C:\inno\ISCC.exe" ".\scripts\inno\windows.iss" "/Qp" "/DVersion=$TRAVIS_TAG"