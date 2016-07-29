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
        _this.loadCheckData(fileObj, function() {
          api.putDataInCommon('saveLocation', filepath);
        });
        //loads into project with object of file paths
      });
    } catch (e) {
      dialog.showErrorBox('Open TC project error', e.message);
    }
  },

  loadCheckData: function(fileObj, callback) {
    for (var item in fileObj) {
      if (item == "checkdata") {
        //if it is the checkdata folder
        var checkDataFolderPath = fileObj[item];
        _this.readDisk(checkDataFolderPath, (checkDataFiles) => {
          //open the file path and read in the files
          for (var file of checkDataFiles){
            _this.putDataInFileProject(file, checkDataFolderPath, callback);
            //calls other functions that puts data in stores
          }
        });
      }
    }
  },

putDataInFileProject: function(file, checkDataFolderPath, callback = () => {} ){
  if (_this.containsTC(file)) {
    var tcFilePath = path.join(checkDataFolderPath, file);
    //tcFilePath = Users/username/Desktop/project_name/common.tc
    fileWithoutTC = _this.removeTC(file);
      _this.readTheJSON(tcFilePath, (json) => {
        if (fileWithoutTC == "common") {
          _this.makeCommon(json);
          //puts common in api common
          _this.saveModuleInAPI(json);
          //saving module in api
        }
        else {
          _this.makeModuleCheckData(json, fileWithoutTC);
          //saving module data (checks) in CheckStore
        }
        callback();
    });
  }
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
  saveModuleInAPI: function(json) {
    //gets paths from loaded path
  if (json.arrayOfChecks != undefined) {
    for (var element of json.arrayOfChecks){
      var path = element.location;
      _this.reportViewPush(path);
    }
    CoreActions.doneLoadingFetchData(reportViews);
  }
},

  reportViewPush: function(path) {
    let viewObj = require(window.__base + path + '/View');
    api.saveModule(viewObj.name, viewObj.view);

    try {
      api.saveMenu(viewObj.name, require(window.__base + path + '/MenuView.js'));
    }
    catch (e) {
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
