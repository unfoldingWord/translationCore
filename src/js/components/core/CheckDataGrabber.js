const CoreStore = require('../.././stores/CoreStore');
const CoreActions = require('../.././actions/CoreActions');
const fs = require(window.__base + 'node_modules/fs-extra');
const Report = require('./ChangesReportSaver');
const path = require('path');
const book = 'mat';

var currentCheckName;
var gotFetch;
var indexOfModule = 0;

var CheckDataGrabber = {
  addListner: function() {
    CoreStore.addChangeListener(this.sendFetchData.bind(this));
  },
  saveNextModule: function() {
    if (indexOfModule < Object.keys(gotFetch).length) {
      currentCheckName = Object.keys(gotFetch)[indexOfModule]
      var path = gotFetch[currentCheckName]
      if (path){
      this.getDataFromCheck(path)
      indexOfModule++
    } else {
      return;
    }
    }
    else {
      gotFetch = null;
    }
  },
  sendFetchData: function() {
    gotFetch = CoreStore.getDataFromProject();
    if (gotFetch) {
      this.saveNextModule();
    }
  },
  onComplete: function(err, data) {
    if (data) {
      Report.saveChecks(data, currentCheckName)
      this.saveNextModule()
    } else {
      return;
    }
  },
  Progress: function(data) {
  },
  getDataFromCheck: function(path) {
    var DataFetcher = require(path + '/FetchData');
    var checkDataJSON = DataFetcher(book, this.Progress.bind(this), this.onComplete.bind(this));
  }
};
module.exports = CheckDataGrabber;
