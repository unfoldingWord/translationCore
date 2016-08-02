const remote = window.electron.remote;
const {dialog} = remote;

const path = require('path');
const pathex = require('path-extra');

const fs = require(window.__base + 'node_modules/fs-extra');
const git = require('./GitApi.js');

const api = window.ModuleApi;

const FileModule = require('./FileModule');
const Access = require('./AccessProject');

const CoreActions = require('../../actions/CoreActions.js');

module.exports = (function() {
  /**
  * @description This function takes a url and opens it from a remote source.
  * @param {string} url - The url that the project is found at
  ******************************************************************************/
  function openManifest(url, callback){
    var splitUrl = url.split('.');
    if (splitUrl.pop() !== 'git') {
      dialog.showErrorBox('Import Error', 'Please make sure that this ' +
      'is a valid project.');
      return;
    }
    var projectPath = splitUrl.pop().split('/');
    var projectName = projectPath.pop();
    const savePath = path.join(pathex.homedir(), 'Translation Core', projectName);
    fs.readdir(savePath, function (err, contents){
      if (!err) {
        CoreActions.showCreateProject("");
      } else {
        fs.ensureDir(savePath, function() {
          runGitCommand(savePath, url, callback);
        });
      }
    });
  }

  function runGitCommand(savePath, url, callback) {
    git(savePath).mirror(url, savePath, function(err){
      if (err) {
        return;
      }
      try {
        fs.readFileSync(path.join(savePath,  'manifest.json'));
        callback(savePath, url);
      } catch(error) {
        // dialog.showErrorBox('Import Error', error);
        console.error(error);
        return;
      }
    });
  }

  return openManifest;
})();
