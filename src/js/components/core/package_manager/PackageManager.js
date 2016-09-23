const pathex = require('path-extra');
const fs = require(window.__base + 'node_modules/fs-extra');
const git = require('../GitApi.js');
const babelCli = pathex.join(window.__base, 'node_modules', '.bin', 'babel');
const exec = require('child_process').exec;

const PARENT = pathex.datadir('translationCore')
const PACKAGE_SAVE_LOCATION = pathex.join(PARENT, 'packages');
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')
const CENTRAL_REPO = ""; //TODO Create central repo to store file

function downloadPackage(packageName) {
  getPackageList(function(obj){
    var packageLocation = obj[packageName].location;
    fs.ensureDirSync(PACKAGE_SAVE_LOCATION);
    fs.ensureDirSync(PACKAGE_COMPILE_LOCATION);
    var source = pathex.join(PACKAGE_SAVE_LOCATION, packageName);
    git(PACKAGE_SAVE_LOCATION).mirror(packageLocation, source, function() {
      var destination = pathex.join(PACKAGE_COMPILE_LOCATION, packageName);
      fs.copy(source, destination, function (err) {
        compilePackage(destination)
      });
    });
  });
}

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

function getJSONFromData(httpRequest) {
	try {
		return JSON.parse(httpRequest.response);
	} catch(error) {
		console.error(error);
		return null;
	}
}

function getPackageList(callback) {
  var request = new XMLHttpRequest();
  request.onload = function() {
    var obj = getJSONFromData(this);
    if (obj !== null) {
      callback(obj);
     }
   }

  request.onerror = function() {
    console.error(this);
  }

  request.open('GET', CENTRAL_REPO);
  request.send();
}

function checkForUpdates(callback) {
  getPackageList(function(obj){
    var needToUpdate = [];
    var installedPackages = fs.readdirSync(PACKAGE_SAVE_LOCATION);
    for (var packages in installedPackages) {
      var currentPackage = installedPackages[packages]
      var localVersion = require(pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'manifest.json')).version;
      var remoteVersion = obj[currentPackage].version;
      if (remoteVersion > localVersion) needToUpdate.push(currentPackage);
    }
    callback(needToUpdate);
  });
}

function update(packageName) {

}

exports.download = downloadPackage;
exports.list = getPackageList;
exports.compile = compilePackage;
exports.checkForUpdates = checkForUpdates;
exports.update = update;
