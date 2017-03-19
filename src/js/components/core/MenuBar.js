/**
 *@author: Ian Hoegen
 *@description: The JSON outlines a template for the menu, and menu items can
 *              be added from here.
 ******************************************************************************/
const api = window.ModuleApi;
import CoreActions from '../../actions/CoreActions.js'
import CoreActionsRedux from '../../actions/CoreActionsRedux.js'
import CoreStore from '../../stores/CoreStore.js'
import git from './GitApi.js'
import sync from './SideBar/GitSync.js'
import exportUsfm from './Usfm/ExportUSFM'
import Upload from './UploadMethods'
import Path from 'path'
import SettingsActions from '../../actions/SettingsActions.js'
import { showNotification } from '../../actions/NotificationActions.js'
import { dispatch } from "../../pages/root"
const fs = require(window.__base + 'node_modules/fs-extra');

var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Close Project',
        click: function () {
          Upload.clearPreviousData();
          CoreStore.currentCheckNamespace = ' ';
          CoreActionsRedux.killLoading();
          api.emitEvent('changeCheckType', { currentCheckNamespace: ' ' });
        },
        accelerator: 'CmdOrCtrl+W'
      },
      {
        label: 'Toggle Tutorial',
        click: function() {
          dispatch(SettingsActions.toggleSettings('showTutorial'));
        },
        accelerator: 'CmdOrCtrl+T'
      },
      {
        label: 'Save',
        click: function () {
          const api = window.ModuleApi;
          const path = api.getDataFromCommon('saveLocation');
          if (path) {
            git(path).save('Manual Save', path);
          } else {
            dispatch(showNotification('Save location is not defined: Load a project first', 5));
          }
        },
        accelerator: 'CmdOrCtrl+S'
      },
      {
        label: "Export as USFM",
        click: function () {
          exportUsfm.exportAll();
        }
      },
      {
        label: "Update with Door43",
        click: function () {
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
            } catch (e) {
              ;
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
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
        click: function (item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator:
        process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click: function (item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.webContents.toggleDevTools();
        }
      },
      {
        label: 'Settings',
        click: function () {
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
        click: function () {
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
module.exports = { template };
