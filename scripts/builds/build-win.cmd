xcopy .\scripts\builds\index.js .\src\js\pages\index.js /Y
babel src --out-dir src ^
& node scripts/builds/build-win.js ^
& node scripts/builds/build-win-installer.js ^
