//FetchData.js//

const api = window.ModuleApi;
const path = require('path');
var parser = require('./usfm-parse.js');

function fetchData(params, progress, callback) {
var targetLanguage = api.getDataFromCommon('targetLanguage');

  if (!targetLanguage) {
    if (!params.targetLanguagePath) {
      console.error('TPane requires a filepath');
    }
    else {
      dispatcher.schedule(function(subCallback) {sendToReader(params.targetLanguagePath, subCallback)});
    }
  }


  class Dispatcher {
    constructor(){
      this.jobs = [];
    }
    schedule(job) {
      this.jobs.push(job);
    }
    run(callback) {
      var _this = this;
      var doneJobs = 0;
      for (var job of this.jobs){
        job(function() {
          doneJobs++;
        if (doneJobs >= _this.jobs.length) {
          callback();
        }});
      }
    }
  }

  const dispatcher = new Dispatcher();
