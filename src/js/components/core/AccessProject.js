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
var fileObj = {}; //make own obj of file paths

var Access = {
  loadFromFilePath: function(filepath) {
    _this = this;
    try {
      var API = window.ModuleApi;
      fs.readdir(filepath, function(err, items){
        for (var i=0; i<items.length; i++) {
          fileObj[items[i]] = path.join(filepath, items[i]);
        }
        _this.loadCheckData();
      });
    } catch (e) {
      dialog.showErrorBox('Open TC project error', e.message);
    }
    console.log(CoreStore);
    console.log(CheckStore);
    console.log(api);
  },

  loadCheckData: function() {
    _this = this;
    for (var item in fileObj) {
      if (item == "checkdata") {
        var checkDataFolderPath = fileObj[item];
        _this.readDisk(checkDataFolderPath, (checkDataFiles) => {
          for (var file of checkDataFiles){
            _this.putDataInFileProject(file, checkDataFolderPath);
          }
        });
      }
    }
  },

putDataInFileProject: function(file, checkDataFolderPath, callback = () => {} ){
  if (_this.containsTC(file)) {
    var tcFilePath = path.join(checkDataFolderPath, file);
    fileWithoutTC = _this.removeTC(file);
      _this.readTheJSON(tcFilePath, (json) => {
        if (fileWithoutTC == "common") {
          _this.makeCommon(json);
          _this.saveModuleData(json);
        }
        else {
          _this.makeModuleCheckData(json, fileWithoutTC);
          //CheckStore.putDataInCommon(packageObj);
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
        console.error(e);
      }
    }
    catch (e) {
      console.error(e);
      return false;
    }
  },
  saveModuleData: function(json) {
  if (json.arrayOfChecks != undefined) {
    for (var element of json.arrayOfChecks){
      var path = element.location;
      _this.reportViewPush(path);
    }
    CoreActions.doneLoadingFetchData(reportViews);
  }
},

  reportViewPush: function(path) {
    let viewObj = require(path + '/View');
    api.saveModule(viewObj.name, viewObj.view);
    if (_this.isModule(path)) {
    reportViews.push(viewObj);
  }
  }
};

module.exports = Access;
