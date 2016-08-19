var electronInstaller = require('electron-winstaller');

console.log('Starting installer build...');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './dist/win-unpacked/',
    exe: 'Translation Core.exe',
    outputDirectory: './dist/installerWin',
    loadingGif: './images/TC_ANIMATED_Logo.gif',
    setupIcon: './build/icon.ico',
    setupExe: 'TranslationCoreSetup-0.1.0.exe'
  });

  resultPromise.then(() => console.log("Installer build succesful"), (e) => console.log(`Installer build failed: ${e.message}`));
