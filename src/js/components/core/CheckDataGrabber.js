const CoreStore = require('../.././stores/CoreStore');
const CoreActions = require('../.././actions/CoreActions');
const fs = require(window.__base + 'node_modules/fs-extra');
const Report = require('./ChangesReportSaver');
const path = require('path');
const book = 'mat';
//const api = window.ModuleApi;

var currentCheckName;
var gotFetch;
var indexOfModule = 0;

var CheckDataGrabber = {
  addListner: function() {
    CoreStore.addChangeListener(this.sendFetchData.bind(this));
  },
  saveNextModule: function() {
    if (gotFetch.length > 0) {
      currentCheckName = gotFetch[0][0]
      var path = gotFetch[0][1]
      gotFetch.splice(0, 1);
      if (path){
      this.getDataFromCheck(path)
    } else {
      return;
    }
    }
    else {
      return;
    }
  },
  sendFetchData: function() {
    console.log('This is being run');
    if (CoreStore.getDataFromProject() && (CoreStore.getShowProjectModal() != "")) {
      gotFetch = CoreStore.getDataFromProject();
      this.saveNextModule();
    }
  },
  onComplete: function(err, data) {
    if (data) {
      Report.saveChecks(data, currentCheckName)
      this.saveNextModule();
    } else {
      return;
    }
  },
  Progress: function(data) {
  },
  getDataFromCheck: function(path) {
    var DataFetcher = require(path + '/FetchData');
    //api.saveModule(currentCheckName, path + '/View');
    var checkDataJSON = DataFetcher(book, this.Progress.bind(this), this.onComplete.bind(this));
  }
};
module.exports = CheckDataGrabber;
