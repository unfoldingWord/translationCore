var React = require('react');
var remote = window.electron.remote;
var fs = require(window.__base + 'node_modules/fs-extra');
var {dialog} = remote;
var path = require('path');
var CheckDataGrabber = require('./create_project/CheckDataGrabber.js');
var CoreStore = require('../../stores/CoreStore');
var CheckStore = require('../../stores/CheckStore');
var CoreActions = require('../../actions/CoreActions');
const api = window.ModuleApi;
var reportViews = [];

var Access = {
  loadFromFilePath: function(filepath) {
    _this = this;
    var fileObj = {};
    //iterratively goes through file system and
    //loads the data into the project
    try {
      fs.readdir(filepath, function(err, items){
        for (var i=0; i<items.length; i++) {
          fileObj[items[i]] = path.join(filepath, items[i]);
          //fileObj = {{checkdata: Users/username/Desktop/project_name/checkdata}...}
        }
        _this.loadCheckData(fileObj);
        //loads into project with object of file paths
      });
    } catch (e) {
      dialog.showErrorBox('Open TC project error', e.message);
    }
  },

  loadCheckData: function(fileObj) {
    for (var item in fileObj) {
      if (item == "checkdata") {
        //if it is the checkdata folder
        var checkDataFolderPath = fileObj[item];
        _this.readDisk(checkDataFolderPath, (checkDataFiles) => {
          //open the file path and read in the files
          var listOfChecks = null;
          for (var file of checkDataFiles){
            listOfChecks = _this.putDataInFileProject(file, checkDataFolderPath);
            //calls other functions that puts data in stores
          }
          if (listOfChecks) {
            _this.saveModuleInAPI(listOfChecks);
          }
        });
      }
    }
  },

  putDataInFileProject: function(file, checkDataFolderPath, callback = () => {} ){
    var listOfChecks = null;
    if (_this.containsTC(file)) {
      var tcFilePath = path.join(checkDataFolderPath, file);
      //tcFilePath = Users/username/Desktop/project_name/common.tc
      fileWithoutTC = _this.removeTC(file);
      _this.readTheJSON(tcFilePath, (json) => {
        if (fileWithoutTC == "common") {
          //puts common in api common
          listOfChecks = _this.makeCommon(json);
        }
        else {
          //saving module data (checks) in CheckStore
          _this.makeModuleCheckData(json, fileWithoutTC);
        }
        callback();
      });
    }
    return listOfChecks;
  },

  readTheJSON: function(path, callback) {
    try {
      var obj = fs.readJsonSync(path);
    } catch(e) {
      obj = [];
      console.error(e);
    }
    callback(obj);
  },

  readDisk: function(path, callback) {
    fs.readdir(path, function(err, folder) {
      callback(folder);
    });
  },

  removeTC: function(string) {
    var index = string.length - 3;
    string = string.slice(0, index);
    return string;
  },

  containsTC: function(data){
    var tc = data.includes(".tc");
    return tc;
  },

  makeCommon: function(data) {
    CheckStore.storeData.common = data;
    return data.arrayOfChecks;
  },

  makeModuleCheckData: function(moduleData, moduleName){
    CheckStore.storeData[moduleName] = moduleData;
  },

  isModule: function(filepath){
    //checks for /ReportView && FetchData in folder structure
    try {
      var stats = fs.lstatSync(filepath);
      if (!stats.isDirectory()) {
        return false;
      }
      try {
        fs.accessSync(filepath + '/ReportView.js');
        fs.accessSync(filepath + '/FetchData.js');
        return true;
      } catch (e) {
      }
    }
    catch (e) {
      console.error(e);
      return false;
    }
  },

  saveModuleInAPI: function(listOfChecks) {
      //gets paths from loaded path
    if (listOfChecks != undefined) {
      for (var element of listOfChecks){
        var path = element.location;
        _this.reportViewPush(path);
      }
      CoreActions.doneLoadingFetchData(reportViews);
    }
  },

  reportViewPush: function(path) {
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
    catch(e) {
      if (e.code != "MODULE_NOT_FOUND") {
        console.error(e);
      }
    }

    //stores module in api
    if (_this.isModule(path)) {
      reportViews.push(viewObj);
    }
  },

  clearOldData: function(){
    CheckStore.WIPE_ALL_DATA();
    //clears relevant data from store
    api.modules = {};
  }
};

module.exports = Access;