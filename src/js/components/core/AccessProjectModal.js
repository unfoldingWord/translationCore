/**
* @description: Modal to have direct access to translation projects
* @param (string) filepath from file dialog
**/
var Modal = require('react-bootstrap/lib/Modal.js');
var CoreActions = require('../../actions/CoreActions.js');
var CoreStore = require('../../stores/CoreStore.js');
var CheckStore = require('../../stores/CheckStore');
var style = require('../../styles/AccessStyle.js');
var Access = require('./AccessProject.js');
var path = require('path');
var remote = window.electron.remote;
var {dialog} = remote;
const api = window.ModuleApi;


var AccessProjectMod = {
  startListener: function(){
    CoreStore.addChangeListener(this.updateShow.bind(this));
  },

  updateShow: function() {
    if (CoreStore.getOpenModal()) {
      this.readDir(this.close.bind(this));
    }
  },

  close: function() {
    CoreActions.showOpenModal(false);
  },

  readDir: function(callback = () => {}) {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        try {
          var file = filename[0];
          api.putDataInCommon('saveLocation', file)
          Access.loadFromFilePath(path.join(file));
          callback();
        } catch (e) {
          dialog.showErrorBox('Read directory error', e);
        }
      }
    });
  }
}

module.exports = AccessProjectMod;
