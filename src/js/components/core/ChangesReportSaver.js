const fs = require(window.__base + 'node_modules/fs-extra');
const ManifestGenerator = require('./ProjectManifest');
const path = require('path');
var SaveReport = {
  saveChecks: function(report, checkName) {
    //array of file path to dynammically create folder
    var x = "report for " + checkName + " is " + report;
    var filepath = window.__base + 'myproject/check_modules/' + checkName + '/checkdata.json';
    //var data = JSON.stringify(report);
    //creates folder path for only folders that need to be created
    fs.outputJson(filepath, report, function (err) {
      if (err){
        console.log(err) // => null
      }
    });
  },
  saveManifest: function(saveLocation, data, tsManifest) {
    var manifestLocation = path.join(saveLocation, 'manifest.json');
    fs.outputJson(manifestLocation, ManifestGenerator(data, tsManifest), function() {
      if (err) {
        console.log(err);
      }
    });
  }
};
module.exports = SaveReport;
