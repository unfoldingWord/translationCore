const remote = window.electron.remote;
const {dialog} = remote;

const FileModule = require('./FileModule');
const CoreActions = require('../../actions/CoreActions.js');
const parser = require('./usfm-parse.js');

const path = require('path');
const nodegit = require("nodegit");
const fse = require(window.__base + 'node_modules/fs-extra');

module.exports = (function() {
  //makes a directory to store all of the files from the
  //repo being inputted
  var newPath = path.join('temp');
  function downloadRepo(url){
    fse.remove(path).then(function() {
      nodegit.Clone(
        url,
        newPath,
        {
          fetchOpts: {
            callbacks: {
              certificateCheck: function() {
                // github will fail cert check on some OSX machines
                // this overrides that check
                return 1;
              }
            }
          }
        });
      });
    }
  return downloadRepo;
})();
