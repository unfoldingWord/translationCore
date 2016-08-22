var electronInstaller = require('electron-winstaller');

console.log('Starting installer build...');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './dist/win-unpacked/',
    exe: 'translationCore.exe',
    outputDirectory: './dist/installerWin',
    loadingGif: './images/TC_ANIMATED_Logo.gif',
    setupIcon: './build/icon.ico',
    setupExe: 'translationCoreSetup.exe'
  });

  resultPromise.then(() => console.log("Installer build succesful"), (e) => console.log(`Installer build failed: ${e.message}`));
