/**
 *@author: Ian Hoegen
 *@description: The JSON outlines a template for the menu, and menu items can
 *              be added from here.
 ******************************************************************************/
const CoreActions = require('../../actions/CoreActions.js');
const CoreStore = require('../../stores/CoreStore.js');
const git = require('./GitApi.js');


var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Toggle Tutorial',
        click: function() {
          if (localStorage.getItem('showTutorial') == 'true') {
            localStorage.setItem('showTutorial', false);
          } else {
            localStorage.setItem('showTutorial', true);
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
            alert('Save location is not defined');
          }
        },
        accelerator: 'CmdOrCtrl+S'
      },
      {
        label: "Update with Door43",
        click: function() {
          const api = window.ModuleApi;
          const path = api.getDataFromCommon('saveLocation');
          var user = CoreStore.getLoggedInUser();
          if (user) {
            git(path).save('Updating with Door43', path, function() {
                var manifest = api.getDataFromCommon('tcManifest');
                if (manifest.repo) {
                  var urlArray = manifest.repo.split('.');
                  urlArray.pop();
                  var finalPath = urlArray.pop().split('/');
                  var repoPath = finalPath[1] + '/' + finalPath[2];
                  var remote = 'https://' + user.token + '@git.door43.org/' + repoPath + '.git';
                  git(path).update(remote, 'master', false);
                } else {
                  alert('There is no associated repository with this project');
                }
            });
          } else {
            alert('Login then try again');
            CoreActions.updateLoginModal(true);
          }
        }
      },
      {
        label: "Open Project",
        click: function() {
          CoreActions.showOpenModal(true);
        }
      },
      {
        label: 'Create Project',
        click() {
          CoreActions.showCreateProject("Languages");
        }
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
      {
        label: 'Delete',
        role: 'delete'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
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
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
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
          window.electron.shell.openExternal('https://github.com/WycliffeAssociates/8woc/');
        }
      }
    ]
  }
];

module.exports = {template: template};
