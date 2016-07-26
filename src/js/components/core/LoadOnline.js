const remote = window.electron.remote;
const {dialog} = remote;

const path = require('path');
const fs = require(window.__base + 'node_modules/fs-extra');
const download = require('download');
const zip = require('adm-zip');

const FileModule = require('./FileModule');

const CoreActions = require('../../actions/CoreActions.js');

module.exports = (function() {
  /**
  * @description This function takes a url and opens it from a remote source.
  * @param {string} url - The url that the project is found at
  ******************************************************************************/
  function openManifest(url, callback){
    var archiveUrl = url + '/archive/master.zip';
    var projectName = url.split('/').pop();
    const zipFolder = path.join('tmp', projectName);
    const zipLocation = path.join(zipFolder,'import.zip');

    download(archiveUrl).then(data => {
      fs.outputFile(zipLocation, data, function() {
        var zipFile = new zip(zipLocation);
        zipFile.extractAllTo(zipFolder, true);
        try {
          fs.readFileSync(path.join(zipFolder,  'manifest.json'));
          callback(zipFolder);
        } catch (error) {
          try {
            var possibleLocation = path.join(zipFolder, projectName);
            var manifestLocation = path.join(possibleLocation, 'manifest.json');
            fs.readFileSync(manifestLocation);
            callback(possibleLocation);
          } catch(err) {
            callback(err);
            dialog.showErrorBox('Import Error', 'Please make sure that this ' +
            'is a valid project repository.');
            console.error(err);
          }
        }
      });
    }).catch(function(error) {
      dialog.showErrorBox('Import Error', 'Please make sure that this ' +
      'is a valid project repository.');
      console.error('URL does not exist');
      console.error(error)
      callback(error);
    });
  }
  return openManifest;
})();
