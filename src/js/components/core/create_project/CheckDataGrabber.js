const CoreStore = require('../../.././stores/CoreStore');
const CoreActions = require('../../.././actions/CoreActions');
const CheckStore = require('../../.././stores/CheckStore');
const fs = require(window.__base + 'node_modules/fs-extra');
const api = window.ModuleApi;
const Books = require('../booksOfBible');

var indexOfModule = 0;
var CheckDataGrabber = {
  doneModules: 0,
  totalModules: 0,

  saveNextModule: function(array, params) {
    for (var moduleInfo of array) {
      var path = moduleInfo[1];
      if (path) {
        this.getDataFromCheck(path, params);
      }
      else {
        return;
      }
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
    console.log('Somebody called on complete');
    this.doneModules++;
    if (!err) {
      if (this.doneModules >= this.totalModules) {
        //update stuff
        console.log("We're done");
      }
    }
    else {
      console.error(err);
    }
  },

  Progress: function(name, data) {
    CoreActions.sendProgressForKey({progress: data, key: name});
  },

  getDataFromCheck: function(path, params) {
    var DataFetcher = require(path + '/FetchData');
    let viewObj = require(path + '/View');
    api.saveModule(viewObj.name, viewObj.view);
    var _this = this;
    DataFetcher(params, function(data) {
      _this.Progress(viewObj.name, data);}, this.onComplete.bind(this));
  }
};

module.exports = CheckDataGrabber;
