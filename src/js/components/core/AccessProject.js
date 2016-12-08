var React = require('react');
var remote = require('electron').remote;
var fs = require(window.__base + 'node_modules/fs-extra');
var {dialog} = remote;
var Path = require('path');
var CheckStore = require('../../stores/CheckStore');
var CoreActions = require('../../actions/CoreActions');
var api = window.ModuleApi;
var Recent = require('./RecentProjects.js');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled');
const CheckDataGrabber = require('./create_project/CheckDataGrabber.js');

const extensionRegex = new RegExp('(\\.\\w+)', 'i');
var checkList = [];

var Access = {
  /**
   * @description - This finds the checkdata folder within a translationStudio project. This
   * project should contain a tcManifest folder and a checkData folder
   * @param {string} folderpath - Path that points to the folder where the translationStudio
   * project lives
   * @param {function} callback - A fucntion that gets called after relevant data is in checkstore
   */
  loadFromFilePath: function (folderpath, callback) {
    if(!folderpath) {
      if (callback) {
        callback('Must specify location')
        return;
      } else {
        return 'Must specify location';
      }
    }
    var _this = this;
    var fileObj = {};
    var manifestLocation = Path.join(folderpath, 'tc-manifest.json');
    try {
      Recent.add(folderpath);
      fs.readdir(folderpath, function (err, files) {
        if (err) {
          if (callback) {
            callback(err);
          }
          return;
        }
        for (var file of files) {
          if (file.toLowerCase() == 'checkdata') {
            var filepath = Path.join(folderpath, file);
            _this.loadCheckData(filepath, folderpath, callback);
          }
        }
      });
    } catch (e) {
      localStorage.removeItem('lastProject');
      api.putDataInCommon('saveLocation', null);
      _this.loadingProjectError(e.message);
      if (callback) {
        callback(e);
      }
    }
  },

  /**
   * @description - This loads in the check data from the given path to the checkdata folder
   * @param {string} checkDataFolderPath - path that points to the check data folder
   * @param {function} callback - Callback that is called whenever all of the check data within
   * the checkData folder is loaded
   */
  loadCheckData: function (checkDataFolderPath, folderpath, callback) {
    if (!checkDataFolderPath || !folderpath) {
      if (callback) {
        callback('No checkdata or save path specified');
        return;
      } else {
        return 'No checkdata or save path specified';
      }
    }
    var _this = this;
    fs.readdir(checkDataFolderPath, (error, checkDataFiles) => {
      if (!error) {
        _this.getArrayOfChecks(Path.join(checkDataFolderPath, "common.tc"), (arrayOfChecks) => {
          _this.putModulesInCheckstore(arrayOfChecks, checkDataFolderPath, () => {
            api.putDataInCommon('saveLocation', folderpath);
            api.setSettings('showTutorial', false);
            localStorage.setItem('lastProject', folderpath);
            if (callback) {
              callback();
            }
          });
        });
      } else {
        if (callback) {
          callback(error)
        }
      }
    });
  },


  putModulesInCheckstore: function (arrayOfChecks, path, callback) {
    try {
      var files = fs.readdirSync(path);
      var index = 0;
      for (var el in files) {
        if (files[el] == 'common.tc' || !files[el].includes(".tc")) continue;
        var data = fs.readJsonSync(Path.join(path, files[el]));
        var name = Path.basename(files[el]).replace(extensionRegex, '');
        CheckStore.storeData[name] = data;
        index++;
      }
      if (callback) {
        callback();
      }
    } catch (e) {
      console.error(e);
    }
  },


  /**
 * @description - This gets the arrayOfChecks from the common.tc
 * @param {string} pathToCommon - path that points to common.tc
 * @param {function} callback - Callback that is called whenever all of the check data within
 * the checkData folder is loaded
 */
  getArrayOfChecks(pathToCommon, callback) {
    const _this = this;
    fs.readJson(pathToCommon, (err, common) => {
      for (var element in common) {
        if (element == 'saveLocation') continue;
        CheckStore.storeData.common[element] = common[element];
      }
      if (callback) {
        callback(common.arrayOfChecks);
      }
    });
  },

  loadingProjectError: function (content) {
    const alert = {
      title: 'Open TC Project Error',
      content: content,
      leftButtonText: 'Ok'
    }
    api.createAlert(alert);
  }
};

module.exports = Access;
