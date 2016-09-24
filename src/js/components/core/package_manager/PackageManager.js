const pathex = require('path-extra');
const fs = require(window.__base + 'node_modules/fs-extra');
const git = require('../GitApi.js');
const npm = pathex.join(window.__base, 'node_modules', '.bin', 'npm');
const babelCli = pathex.join(window.__base, 'node_modules', '.bin', 'babel');
const exec = require('child_process').exec;

const PARENT = pathex.datadir('translationCore')
const PACKAGE_SAVE_LOCATION = pathex.join(PARENT, 'packages');
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')
const CENTRAL_REPO = "http://127.0.0.1:8080/manifest.json"; //TODO Create central repo to store file

/**
 * @description - This downloads the specified package to the packages folder.
 * @param {String} packageName - The name of the package to be installed.
 * @param {function} callback - To be called upon completion
 ******************************************************************************/
function downloadPackage(packageName, callback) {
  getPackageList(function(obj){
    var packageLocation = obj[packageName].location;
    fs.ensureDirSync(PACKAGE_SAVE_LOCATION);
    fs.ensureDirSync(PACKAGE_COMPILE_LOCATION);
    var source = pathex.join(PACKAGE_SAVE_LOCATION, packageName);
    git(PACKAGE_SAVE_LOCATION).mirror(packageLocation, source, function() {
      var destination = pathex.join(PACKAGE_COMPILE_LOCATION, packageName);
      var command = npm + ' install';
      exec(command, {cwd: source}, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        fs.copy(source, destination, function (err) {
          compilePackage(destination, callback)
        });
      });
    });
  });
}
/**
 * @description - This compiles the specified package to the folder it resides in.
 * @param {String} destination - The location of the package, in packages-compiled. 
 * @param {function} callback - To be called upon completion
 ******************************************************************************/
function compilePackage(destination, callback) {
  var command = babelCli + ' ' + destination + ' --ignore node_modules,.git --out-dir ' + destination;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    callback('Installation Successful')
  });
}
/**
 * @description - This get's the list of packages available to download.
 * @param {function} callback - To be called upon completion
 ******************************************************************************/
function getPackageList(callback) {
  var request = new XMLHttpRequest();
  request.onload = function() {
    var obj;
    try {
      obj = JSON.parse(httpRequest.response);
    } catch(error) {
      obj = error;
      console.error(error);
    } finally {
      callback(obj);
    }
  }

  request.onerror = function() {
    console.error(this);
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
      var localVersion = require(pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'manifest.json')).version;
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
function update(packageName, callback) {
  var packageLocation = pathex.join(PACKAGE_SAVE_LOCATION, packageName);
  var compiledLocation = pathex.join(PACKAGE_COMPILE_LOCATION, packageName);
  fs.emptyDirSync(packageLocation);
  fs.emptyDirSync(compiledLocation);
  downloadPackage(packageName, callback);
}
/**
 * @description - This returns a list of installed packages.
 * @return {array} installedPackages - An array of installed packages.
 ******************************************************************************/
function getLocalList() {
  var installedPackages = fs.readdirSync(PACKAGE_SAVE_LOCATION);
  return installedPackages;
}

exports.download = downloadPackage;
exports.list = getPackageList;
exports.compile = compilePackage;
exports.checkForUpdates = checkForUpdates;
exports.update = update;
exports.getLocalList = getLocalList;
