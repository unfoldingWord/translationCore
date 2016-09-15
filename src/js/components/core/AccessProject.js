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

var reportViews = [];

var Access = {
  /**
   * @description - This finds the checkdata folder within a translationStudio project. This
   * project should contain a tcManifest folder and a checkData folder
   * @param {string} folderpath - Path that points to the folder where the translationStudio
   * project lives
   */
  loadFromFilePath: function (folderpath, callback) {
    var _this = this;
    var fileObj = {};
    var manifestLocation = Path.join(folderpath, 'tc-manifest.json');
    fs.readJson(manifestLocation, function(err, jsonObject) {
      if (jsonObject) {
        api.putDataInCommon('tcManifest', jsonObject);
      }
      if (callback) {
        callback();
      }
    });
    try {
      Recent.add(folderpath);
      fs.readdir(folderpath, function(err, files){
        try {
        for (var file of files) {
          if (file.toLowerCase() == 'checkdata') {
            var filepath = Path.join(folderpath, file);
            _this.loadCheckData(filepath);
          }
        }
        api.putDataInCommon('saveLocation', folderpath);
        localStorage.setItem('showTutorial', false);
        localStorage.setItem('lastProject', folderpath);
      } catch (err) {
        localStorage.removeItem('lastProject');
        api.putDataInCommon('saveLocation', null);
      }
      });
    } catch (e) {
      console.error(e);
      const alert = {
        title: 'Open TC Project Error',
        content: e.message,
        leftButtonText: 'Ok'
      }
      api.createAlert(alert);
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
    fs.readdir(checkDataFolderPath, (error, checkDataFiles) => {
      if (error) {
        const alert = {
          title: 'Error Opening Project',
          content: error.message,
          leftButtonText: 'Ok'
        }
        api.createAlert(alert);
      }
      else {
        var listOfChecks = null;
        for (var file of checkDataFiles) {
          //calls other functions that puts data in stores
          listOfChecks = _this.putDataInFileProject(Path.join(checkDataFolderPath, file), callback);
        }
        if (listOfChecks) {
          _this.saveModuleInAPI(listOfChecks);
        }
      }
    });
  },

  putDataInFileProject: function (file, callback = () => { }) {
    var _this = this;
    var listOfChecks = null;
    if (this.containsTC(file)) {
      //file = /home/user/.../common.tc
      //fileWithoutTC = common
      var fileWithoutTC = Path.basename(file).replace(extensionRegex, '');
      fs.readJson(file, (err, json) => {
        if (err) {
          console.error(err);
          const alert = {
            title: 'Error Opening Project',
            content: err.message,
            leftButtonText: 'Ok'
          }
          api.createAlert(alert);
        }
        else {
          if (fileWithoutTC == "common") {
            //puts common in api common
            listOfChecks = _this.makeCommon(json);
          }
          else {
            //saving module data (checks) in CheckStore
            _this.makeModuleCheckData(json, fileWithoutTC);
          }
          callback();
        }
      });
    }
    return listOfChecks;
  },

  containsTC: function (data) {
    var tc = data.includes(".tc");
    return tc;
  },

  makeCommon: function (data) {
    for (var key in data) {
      if (!CheckStore.hasData('common', key)) {
        api.putDataInCommon(key, data[key]);
      }
    }
    return data.arrayOfChecks;
  },

  makeModuleCheckData: function (moduleData, moduleName) {
    CheckStore.storeData[moduleName] = moduleData;
  },

  isModule: function (filepath) {
    //checks for /ReportView && FetchData in folder structure
    try {
      var stats = fs.lstatSync(filepath);
      if (!stats.isDirectory()) {
        return false;
      }
      try {
        fs.accessSync(Path.join(filepath, 'ReportView.js'));
        fs.accessSync(Path.join(filepath, 'FetchData.js'));
        return true;
      } catch (e) {
      }
    }
    catch (e) {
      console.error(e);
      return false;
    }
  },

  saveModuleInAPI: function (listOfChecks) {
    //gets paths from loaded path
    if (listOfChecks != undefined) {
      for (var element of listOfChecks) {
        var path = element.location;
        _this.reportViewPush(path);
      }
      CoreActions.doneLoadingFetchData(reportViews);
    }
  },

  //stores moduel view objects into an array for the api
  reportViewPush: function (path) {
    let viewObj = require(path + '/View');
    api.saveModule(viewObj.name, viewObj.view);

    try {
      api.saveMenu(viewObj.name, require(path + '/MenuView.js'));
    }
    catch (e) {
      if (e.code != "MODULE_NOT_FOUND") {
        console.error(e);
      }
    }

    try {
      var loader = require(path + '/Loader.js');
      loader(api.getDataFromCheckStore(viewObj.name));
    }
    catch (e) {
      if (e.code != "MODULE_NOT_FOUND") {
        const alert = {
          title: 'Error Opening Project',
          content: e.message,
          leftButtonText: 'Ok'
        }
        api.createAlert(alert);
      }
    }

    //stores module in api
    if (_this.isModule(path)) {
      reportViews.push(viewObj);
    }
  }
};

module.exports = Access;
