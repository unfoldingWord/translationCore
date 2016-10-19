var React = require('react');
var remote = require('electron').remote;
var fs = require(window.__base + 'node_modules/fs-extra');
var {dialog} = remote;
var Path = require('path');
var CheckStore = require('../../stores/CheckStore');
var CoreActions = require('../../actions/CoreActions');
var api = window.ModuleApi;
var Recent = require('./RecentProjects.js');

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
    var _this = this;
    var fileObj = {};
    var manifestLocation = Path.join(folderpath, 'tc-manifest.json');
    try {
      Recent.add(folderpath);
      fs.readdir(folderpath, function (err, files) {
        for (var file of files) {
          if (file.toLowerCase() == 'checkdata') {
            var filepath = Path.join(folderpath, file);
            _this.loadCheckData(filepath, callback);
          }
        }
        //api.putDataInCommon('saveLocation', folderpath);
        api.setSettings('showTutorial', false);
        localStorage.setItem('lastProject', folderpath);
      });
    } catch (e) {
      localStorage.removeItem('lastProject');
      api.putDataInCommon('saveLocation', null);
      _this.loadingProjectError(e.message);
      console.error(e);
    }
  },

  /**
   * @description - This loads in the check data from the given path to the checkdata folder
   * @param {string} checkDataFolderPath - path that points to the check data folder
   * @param {function} callback - Callback that is called whenever all of the check data within
   * the checkData folder is loaded
   */
  loadCheckData: function (checkDataFolderPath, callback) {
    var _this = this;
    var index = 0;
    fs.readdir(checkDataFolderPath, (error, checkDataFiles) => {
      if (!error) {
        _this.getArrayOfChecks(Path.join(checkDataFolderPath, "common.tc"), (arrayOfChecks) => {
          for (var file of checkDataFiles) {
            if (file == 'common.tc') continue;
            if (!file.includes(".tc")) continue;
            var data = fs.readJsonSync(Path.join(checkDataFolderPath, file));
            var nameArray = arrayOfChecks[index].location.split("/");
            var name = nameArray[nameArray.length - 1];
            CheckStore.storeData[name] = data;
            index++;
          }
          callback();
        });
      }
    });
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
        CheckStore.storeData.common[element] = common[element];
      }
      callback(common.arrayOfChecks);
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
