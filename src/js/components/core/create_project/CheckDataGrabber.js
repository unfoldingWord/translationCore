const CoreStore = require('../../.././stores/CoreStore');
const CoreActions = require('../../.././actions/CoreActions');
const CheckStore = require('../../.././stores/CheckStore');
const fs = require(window.__base + 'node_modules/fs-extra');
const api = window.ModuleApi;
const Books = require('../booksOfBible');
const path = require('path');
const ManifestGenerator = require('../ProjectManifest');

var indexOfModule = 0;
var CheckDataGrabber = {
  doneModules: 0,
  totalModules: 0,
  reportViews: [],

  saveNextModule: function(array, params) {
    var checkArray = [];
    for (var moduleInfo of array) {
      var path = moduleInfo[1];
      checkArray.push({name: moduleInfo[0], location: moduleInfo[1]});
      if (path) {
        this.getDataFromCheck(path, params);
      }
      else {
        return;
      }
    }
    api.putDataInCommon('arrayOfChecks', checkArray);
  },
  saveManifest: function(saveLocation, data, tsManifest) {
    try {
      var manifestLocation = path.join(saveLocation, 'manifest.json');
      fs.outputJson(manifestLocation, ManifestGenerator(data, tsManifest), function(err) {
        if (err) {
          console.log(err);
        }
      });
    }
    catch(e) {
      console.error(e);
    }
  },

  // sendFetchData: function() {
  //   // console.log('This is being run');
  //   if (CoreStore.getDataFromProject() && (CoreStore.getShowProjectModal() != "")) {
  //     gotFetch = CoreStore.getDataFromProject();
  //     this.saveNextModule();
  //   }
  // },

  getFetchData: function(array, params) {
    CoreStore.updateNumberOfFetchDatas(array.length);
    this.totalModules = array.length;
    this.saveNextModule(array, params);
  },
  saveCheckStoreToDisk: function() {
    var namespaces = CheckStore.getNameSpaces();
    for (var element of namespaces) {
      CheckStore.saveDataToDisk(element, window.__base + '/myprojects/' + element);
    }
  },

  onComplete: function(err, data) {
    this.doneModules++;
    if (!err) {
      if (this.doneModules >= this.totalModules) {
        //update stuff
        CoreActions.doneLoadingFetchData(this.reportViews);
      }
    }
    else {
      console.error(err);
    }
  },

  Progress: function(name, data) {
    CoreActions.sendProgressForKey({progress: data, key: name});
  },

  isModule:function(filepath) {
    try {
      var stats = fs.lstatSync(filepath);
      if (!stats.isDirectory()) {
        return false;
      }
      try {
        fs.accessSync(filepath + '/ReportView.js');
        return true;
      } catch (e) {
        return false;
      }
    }
    catch (e) {
      return false;
    }
  },

  getDataFromCheck: function(path, params) {
    var DataFetcher = require(path + '/FetchData');
    let viewObj = require(path + '/View');
    api.saveModule(viewObj.name, viewObj.view);
    if (this.isModule(path)) {
      this.reportViews.push(viewObj);
    }
    var _this = this;
    DataFetcher(params, function(data) {
      _this.Progress(viewObj.name, data);}, this.onComplete.bind(this));
    }
  };

  module.exports = CheckDataGrabber;
