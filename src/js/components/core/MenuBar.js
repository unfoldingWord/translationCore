/**
 *@author: Ian Hoegen
 *@description: The JSON outlines a template for the menu, and menu items can
 *              be added from here.
 ******************************************************************************/
const CoreActions = require('../../actions/CoreActions.js');
const CoreStore = require('../../stores/CoreStore.js');
const git = require('./GitApi.js');
const api = window.ModuleApi;
const sync = require('./SideBar/GitSync.js');
const exportUsfm = require('./Usfm/ExportUSFM');
const Upload = require('./UploadMethods');
const Path = require('path');
const fs = require(window.__base + 'node_modules/fs-extra');


var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Close Project',
        click: function() {
          Upload.clearPreviousData();
          CoreStore.currentCheckNamespace = ' ';
          api.emitEvent('changeCheckType', {currentCheckNamespace: ' '})
        }
      },
      {
        label: 'Toggle Tutorial',
        click: function() {
          if (api.getSettings('showTutorial') === true) {
            api.setSettings('showTutorial', false);
          } else {
            api.setSettings('showTutorial', true);
          }
        },
        accelerator: 'CmdOrCtrl+T'
      },
      {
        label: 'Save',
        click: function() {
          const api = window.ModuleApi;
          const path = api.getDataFromCommon('saveLocation');
          if (path) {
            git(path).save('Manual Save', path);
          } else {
            api.Toast.error('Save location is not defined', 'Load a project first', 3)
          }
        },
        accelerator: 'CmdOrCtrl+S'
      },
      {
       label: "Export as USFM",
       click: function() {
         exportUsfm.exportAll();
        }
     },
       {
        label: "Update with Door43",
        click: function() {
          sync();
        }
      },
      {
        label: 'Load',
        click() {

        }
       },
       {
         label: 'Toggle Example Check',
         click: function () {
           var exampleCheckPath = Path.join(window.__base, "modules", "example_check_module");
           if (localStorage.getItem('exampleCheck') == 'true') {
              try {
                //TODO: Do this a different way
             } catch (e) {;
             }
             localStorage.setItem('exampleCheck', false);
           }
           else {
             try {
               //TODO: Do this a different way
             } catch (e) {
             }
             localStorage.setItem('exampleCheck', true);
           }
         },
         accelerator: 'CmdOrCtrl+H'
       },
       {
         label: 'Close',
         accelerator: 'CmdOrCtrl+W',
         role: 'close'
       }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator:
        process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.webContents.toggleDevTools();
        }
      },
      {
        label: 'Settings',
        click: function() {
          CoreActions.updateSettings(true);
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function() {
          require('electron').shell.openExternal('https://github.com/unfoldingWord-dev/translationCore');
        }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: 'translationCore',
    submenu: [
      {
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
      }
    ]
  });
}
module.exports = {template};
