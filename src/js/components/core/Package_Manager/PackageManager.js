/**
 *@author: Ian Hoegen
 *@description: This is the central manager of all packages for translationCore.
 ******************************************************************************/
const path = require('path-extra');
const fs = require(window.__base + 'node_modules/fs-extra');
const git = require('../GitApi.js');
const api = window.ModuleApi;
const babel = require('babel-core');
var installQueue = [];

const PARENT = path.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = path.join(PARENT, 'packages-compiled')
const CENTRAL_REPO = "https://raw.githubusercontent.com/translationCoreApps/translationCore-apps/master/directory.json";

/**
 * @description - This downloads the specified package to the packages folder.
 * @param {String} packageName - The name of the package to be installed.
 * @param {function} callback - To be called upon completion
 ******************************************************************************/
function downloadPackage(packageName, version, callback) {
  if (!callback) {
    return 'No callback specified';
  }
  getPackageList(function(obj){
    if (!obj[packageName]) {
      callback('Package does not exist', null);
      return;
    }
    var packageLocation = obj[packageName].repo;
    fs.ensureDirSync(PACKAGE_COMPILE_LOCATION);
    var destination = path.join(PACKAGE_COMPILE_LOCATION, packageName);
    fs.emptyDirSync(destination);
    fs.removeSync(destination);
    git(PACKAGE_COMPILE_LOCATION).mirror(packageLocation, destination, function(err) {
      git(destination).checkout(version, function(err, data) {
        npmInstall(destination, [], (error, data) => {
          if (error) {
            uninstall(packageName);
            console.error(error);
            callback(error, null);
            return;
          }
          installDependencies(packageName);
          if (installQueue.length > 0) {
            compilePackage(destination, packageName);
            var currentPack = installQueue.shift();
            if (Array.isArray(currentPack)) {
              downloadPackage(currentPack[0], currentPack[1], callback);
            } else {
              downloadPackage(currentPack, null, callback);
            }
          } else {
            compilePackage(destination, packageName, callback)
          }
        });
      });
    });
  });
}
/**
 * @description - This compiles the specified package to the folder it resides in.
 * @param {String} destination - The location of the package, in packages-compiled.
 * @param {String} packageName - The name of the package
 * @param {function} callback - To be called upon completion
 ******************************************************************************/
function compilePackage(destination, packageName, callback) {
  fs.ensureDirSync(destination);
  var filesInPackage = fs.readdirSync(destination);
  if (!filesInPackage.includes('.babelrc')) {
    if (callback) {
      callback(null, 'Installation Successful');
    }
    return;
  }
  var babelrc = fs.readJsonSync(path.join(destination, '.babelrc'));
  recursiveDirRead(destination, function(err, data) {
    if (err) {
      console.error(err);
      callback(err, null);
      return;
    }
    var completedTransformCounter = 0;
    var codeTree = {};
    for (var i = 0; i < data.length; i++) {
      var result = babel.transformFileSync(data[i], babelrc);
      codeTree[data[i]] = result.code;
      completedTransformCounter++;
    }
    for (var j in codeTree) {
      fs.outputFileSync(j, codeTree[j]);
    }
    if (callback) {
      callback(null, 'Installation Successful')
    }
    api.Toast.success("Installation Successful", packageName + 'Was Successfully Installed', 3);
  });
}
/**
 * @description - This get's the list of packages available to download.
 * @param {function} callback - To be called upon completion
 ******************************************************************************/
function getPackageList(callback) {
  if (!callback) {
    return "No callback specified"
  }
  var request = new XMLHttpRequest();
  request.onload = function() {
    var obj;
    try {
      obj = JSON.parse(this.response);
    } catch(error) {
      obj = error;
      console.error('Parse Error');
    } finally {
      callback(obj);
    }
  }
  request.onerror = function() {
    console.error('Connection Error');
  }

  request.open('GET', CENTRAL_REPO);
  request.send();
}
/**
 * @description - This checks for updates on installed packags.
 * @param {function} callback - To be called upon completion
 ******************************************************************************/
function checkForUpdates(callback) {
  getPackageList(function(obj){
    var needToUpdate = [];
    var installedPackages = getLocalList();
    for (var packages in installedPackages) {
      var currentPackage = installedPackages[packages]
      var localVersion = require(path.join(PACKAGE_COMPILE_LOCATION, currentPackage, 'package.json')).version;
      var remoteVersion = obj[currentPackage].version;
      if (remoteVersion > localVersion) needToUpdate.push(currentPackage);
    }
    callback(needToUpdate);
  });
}
/**
 * @description - This updates a package to the newest version.
 * @param {String} packageName - The name of the package to be installed.
 * @param {function} callback - To be called upon completion
 ******************************************************************************/
function update(packageName, version, callback) {
  downloadPackage(packageName, version, callback);
}
/**
 * @description - This returns a list of installed packages.
 * @return {array} installedPackages - An array of installed packages.
 ******************************************************************************/
function getLocalList() {
  fs.ensureDirSync(PACKAGE_COMPILE_LOCATION);
  var installedPackages = fs.readdirSync(PACKAGE_COMPILE_LOCATION);
  var index = array.indexOf('.DS_Store');
  if (index > -1) {
    array.splice(index, 1);
  }
  return installedPackages;

}
/**
 * @description - This returns a list of installed packages.
 * @param {String} packageName - The name of the package to look for.
 * @return {boolean} isExists - Whether the packae exists locally.
 ******************************************************************************/
function isInstalled(packageName) {
  if(!packageName) {
    return false;
  }
  fs.ensureDirSync(PACKAGE_COMPILE_LOCATION);
  var manifestLocation = path.join(PACKAGE_COMPILE_LOCATION, packageName, 'package.json');
  try {
    var manifest = require(manifestLocation);
  } catch(err) {
    return false;
  }
  var dependencies = manifest.include;
  var dependenciesInstalled = true;
  var compiledPackages = getLocalList();
  if (!Array.isArray(dependencies)) {
    dependencies = Object.keys(dependencies);
  }
  for (var i in dependencies) {
    if (!compiledPackages.includes(dependencies[i])) {
      dependenciesInstalled = false;
    }
  }
  return compiledPackages.includes(packageName) && dependenciesInstalled;
}
/**
 * @description - This get's the version number of the package.
 * @param {String} packageName - The name of the package.
 * @return {String} version - The version of the package.
 ******************************************************************************/
function getVersion(packageName) {
  var manifestLocation = path.join(PACKAGE_COMPILE_LOCATION, packageName, 'package.json');
  try {
    var manifest = require(manifestLocation);
  } catch(err) {
    return null;
  }
  var version = manifest.version;
  return version;
}
/**
 * @description - This get's the version number of the package.
 * @param {String} query - The package to search for.
 * @param {String} callback - Function to be called on complete.
 ******************************************************************************/
function search(query, callback) {
  if (!callback) {
    return 'No callback specified';
  }
  getPackageList((data) => {
    var packageNames = Object.getOwnPropertyNames(data);
    var results = [];
    for (var i in packageNames) {
      if (~packageNames[i].indexOf(query)) {
        results.push(data[packageNames[i]]);
      }
    }
    callback(results);
  });
}
/**
 * @description Uninstalls a package.
 * @param {String} packageName - The name of the package to uninstall.
 ******************************************************************************/
function uninstall(packageName) {
  var compiledLocation = path.join(PACKAGE_COMPILE_LOCATION, packageName);
  fs.emptyDirSync(compiledLocation);
  fs.removeSync(compiledLocation);
  api.Toast.success("Uninstallation Successful", packageName + 'Was Successfully Uninstalled', 3);
}
/**
 * @description Installs a packages dependencies.
 * @param The package to install dependencies for.
 ******************************************************************************/
function installDependencies(packageName) {
  var manifestLocation = path.join(PACKAGE_COMPILE_LOCATION, packageName, 'package.json');
  try {
    var manifest = require(manifestLocation);
  } catch(err) {
    console.error(err);
    return;
  }
  var dependencies = manifest.include;
  if (Array.isArray(dependencies)) {
    for (var i in dependencies) {
      if (!installQueue.includes(dependencies[i]) && !isInstalled(dependencies[i])) {
        installQueue.push(dependencies[i]);
      }
    }
  } else {
    for (var i in dependencies) {
      if (!installQueue.includes(i) && !isInstalled(i)) {
        installQueue.push([i, dependencies[i]]);
      }
    }
  }
}

function npmInstall(location, args, callback) {
  var oldConsolelog = console.log;
  console.log = function() {}
  console.log('log is kill');
  var npm = require('npm');
  npm.load({}, function() {
    var installer = require('npm/lib/install.js');
    installer(location, args || [], function(err, data) {
      callback(err, data)
      console.log = oldConsolelog;
    });
  });
}

function recursiveDirRead(dir, callback) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return callback(err);
    var pending = list.length;
    if (!pending) return callback(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory() && !~file.indexOf('node_modules') && !~file.indexOf('.DS_Store') && !~file.indexOf('.git')) {
          recursiveDirRead(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) callback(null, results);
          });
        } else {
          if (path.extname(file) === '.js') {
            results.push(file);
          }
          if (!--pending) callback(null, results);
        }
      });
    });
  });
}
exports.download = downloadPackage;
exports.list = getPackageList;
exports.compile = compilePackage;
exports.checkForUpdates = checkForUpdates;
exports.update = update;
exports.getLocalList = getLocalList;
exports.isInstalled = isInstalled;
exports.search = search;
exports.getVersion = getVersion;
exports.uninstall = uninstall;
