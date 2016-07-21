const CoreStore = require('../.././stores/CoreStore');
const CoreActions = require('../.././actions/CoreActions');
const CheckStore = require('../.././stores/CheckStore');
const fs = require(window.__base + 'node_modules/fs-extra');
const Report = require('./ChangesReportSaver');
const path = require('path');
const book = 'mat';
const api = window.ModuleApi;

var currentCheckName;
var gotFetch;
var indexOfModule = 0;

var CheckDataGrabber = {
  addListner: function() {
    CoreStore.addChangeListener(this.sendFetchData.bind(this));
  },
  saveNextModule: function() {
    if (gotFetch.length > 0) {
      currentCheckName = gotFetch[0][0];
      var path = gotFetch[0][1];
      gotFetch.splice(0, 1);
      if (path){
      this.getDataFromCheck(path);
    } else {
      return;
    }
    }
    else {
      return;
    }
  },
  sendFetchData: function() {
    if (CoreStore.getDataFromProject() && (CoreStore.getShowProjectModal() != "")) {
      gotFetch = CoreStore.getDataFromProject();
      this.saveNextModule();
    }
  },
  saveCheckStoreToDisk: function() {
    var namespaces = CheckStore.getNameSpaces();
    for (var element of namespaces) {
      CheckStore.saveDataToDisk(element, window.__base + '/myprojects/' + element);
    }
  },
  onComplete: function(err, data) {
    if (data) {
      Report.saveChecks(data, currentCheckName);
    }

      if (gotFetch.length == 0) {
        //CoreStore.sendViews(views);
        //var View = require(path + '/View');
        //this.saveCheckStoreToDisk();
        CoreActions.sendProgressForKey(0);
      }
      else {
      CoreActions.sendProgressForKey(0);
        return;
    }
  },
  Progress: function(data) {
    CoreActions.sendProgressForKey([currentCheckName, data]);
  },
  getDataFromCheck: function(path) {
    var DataFetcher = require(path + '/FetchData');
    var viewObj = require(path + '/View');
    api.saveModule(viewObj.name, viewObj.view);
    DataFetcher({bookAbbr: book}, this.Progress.bind(this), this.onComplete.bind(this));
  }
};
module.exports = CheckDataGrabber;
