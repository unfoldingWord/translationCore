var packager = require('electron-packager');
/*
 * Steps to an automated build:
 * 1. Replace the index.js file with one that does not include babel-register.
 * 2. Package the app using build-win.js
 * 3. Unzip the asar file app.asar.
 * 4. Copy the .bin folder from node_modules to the asar files node_modules.
 * 5. Repackage the unpacked asar file as app.asar, and replace the old.
 * 6. Create an installer using build-win-installer.js
 *
 * Plan of action:
 * 1. Have a spare index.js file to replace the old one when builds are to be made. Use system to copy.
 * 2. Run build-win.js
 * 3. Use the asar node_module/command line tool to unpack the asar file. Use system to do this.
 * 4. Use system to copy the .bin folder to the unpacked asar.
 * 5. Use the asar command line tool to repack the app.asar.
 * 6. Run build-win-installer.js
 */
packager({
  arch: 'ia32',
  dir: './',
  platform: 'win32',
  asar: true,
  'build-version': '0.1.6',
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
