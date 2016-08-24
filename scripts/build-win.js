var electronInstaller = require('electron-winstaller');
var packager = require('electron-packager');

packager({
  arch: 'ia32',
  dir: './',
  platform: 'win32',
  asar: true,
  'build-version': '0.1.1',
  icon: './build/icon.ico',
  name: 'translationCore',
  overwrite: 'true',
  'app-copyright': 'Copyright (C) 2016 Wycliffe Associates',
  out: './dist/',
  prune: true,
  'version-string': {
    CompanyName: 'Wycliffe Associates',
    FileDescription: 'translationCore',
    OriginalFilename: 'translationCore.exe',
    ProductName: 'translationCore',
    InternalName: 'translationCore'
  }
}, function (err, appPaths) {
  if (err) {
    console.log('Packaging error: ' + err);
  } else {
    console.log('Packaging succesful');
    for (var path in appPaths) {
      buildInstaller(appPaths[path]);
    }
  }
});

function buildInstaller(packageLocation) {
  console.log('Starting installer build...');
  resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: packageLocation,
    exe: 'translationCore.exe',
    outputDirectory: packageLocation + '/installer',
    loadingGif: './images/TC_ANIMATED_Logo.gif',
    setupIcon: './build/icon.ico',
    setupExe: 'translationCoreSetup.exe'
  });
  resultPromise.then(() => console.log("Installer build succesful"), (e) => console.log(`Installer build failed: ${e.message}`));
}
