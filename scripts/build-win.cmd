xcopy .\scripts\index.js .\src\js\pages\index.js /Y
babel src --out-dir src ^
& node scripts/build-win.js ^
& echo Extracting app.asar ^
& asar extract ./dist/translationCore-win32-ia32/resources/app.asar ./temp/app ^
& echo Copying .bin folder ^
& xcopy .\node_modules\.bin .\temp\app\node_modules\.bin\ /Y ^
& echo Repacking app.asar ^
& asar pack ./temp/app ./dist/translationCore-win32-ia32/resources/app.asar ^
& node scripts/build-win-installer.js ^
& echo Deleting temp ^
& rmdir /S /Q temp
