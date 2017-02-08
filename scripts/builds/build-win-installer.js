var electronInstaller = require('electron-winstaller');

function buildInstaller(packageLocation) {
  console.log('Starting installer build...');
  resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: packageLocation,
    exe: 'translationCore.exe',
    outputDirectory: packageLocation + '/installer',
    loadingGif: './images/TC_ANIMATED_Logo.gif',
    skipUpdateIcon: true, 
    setupExe: 'translationCoreSetup.exe'
  });
  resultPromise.then(() => console.log("Installer build succesful"), (e) => console.log(`Installer build failed: ${e.message}`));
}

buildInstaller('dist/translationCore-win32-ia32');
