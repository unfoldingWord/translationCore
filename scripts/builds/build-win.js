var packager = require('electron-packager');
var path = require('path')
var appVersion = require(path.join(__dirname, '../../package.json')).version;
packager({
  arch: 'ia32',
  dir: './',
  platform: 'win32',
  asar: true,
  'build-version': appVersion,
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
      console.log("Package location: " + appPaths[path]);
    }
  }
});
