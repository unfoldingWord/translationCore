require("@babel/register");
const {app, dialog, ipcMain, BrowserWindow, Menu} = require('electron');
const path = require('path-extra');
const {
  createWindow,
  defineWindow,
  getWindow,
  closeAllWindows
} = require('./electronWindows');

// TODO: electronite: restore later
// const { isGitInstalled, showElectronGitSetup} = require('./src/helpers/InstallationHelpers');
// const { injectFileLogging } = require('./js/helpers/logger');
// const DownloadManager = require('./js/DownloadManager');
const { DCS_BASE_URL } = require('./js/common/constants');
// const DCS_BASE_URL = 'https://git.door43.org';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const MAIN_WINDOW_ID = 'main';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow;
let helperWindow;
let splashScreen;

console.log ('Starting Public Main');

// const downloadManager = new DownloadManager();

/**
 * Creates a window for the main application.
 * @returns {Window}
 */
function createMainWindow() {
  const windowOptions = {
    icon: './TC_Icon.png',
    title: 'translationCore',
    autoHideMenuBar: true,
    minWidth: 1200,
    minHeight: 689,
    show: false,
    center: true,
    // useContentSize: true, // TODO: investigate if needed
    webPreferences: {
      nodeIntegration: true
    },
  };
  mainWindow = createWindow(MAIN_WINDOW_ID, windowOptions);

  // TODO: electronite: restore later
  // if ('developer_mode' in p && p.developer_mode) {
  //   mainWindow.webContents.openDevTools();
  // }

  // TODO: electronite: restore later
  // isGitInstalled().then(installed => {
  //   if (installed) {
  //     console.log('createMainWindow() - Git is installed.');
  //     mainWindow.loadURL(`file://${__dirname}/index.html`);
  //   } else {
  //     console.warn('createMainWindow() - Git is not installed. Prompting user.');
  //     splashScreen.hide();
  //     return showElectronGitSetup(dialog).then(() => {
  //       app.quit();
  //     }).catch(() => {
  //       app.quit();
  //     });
  //   }
  // });

  // Doesn't display until ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
    splashScreen.close();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // TODO: electronite: restore later
  // if (process.env.NODE_ENV === 'development') {
  //   // Install React Dev Tools
  //   try {
  //     const { default: installExtension, REACT_DEVELOPER_TOOLS } = require(
  //       'electron-devtools-installer');
  //
  //     installExtension(REACT_DEVELOPER_TOOLS).then((name) => {
  //       console.log(`createMainWindow() - Added Extension: ${name}`);
  //     }).catch((err) => {
  //       console.warn('createMainWindow() - An error occurred: ', err);
  //     });
  //   } catch (e) {
  //     console.error('createMainWindow() - Failed to load electron developer tools', e);
  //   }
  // }

  return mainWindow;
}

/**
 * Creates a window for the splash screen.
 * This uses a dedicated webpack entry point so it loads fast.
 * @returns {Electron.BrowserWindow}
 */
function createSplashWindow() {
  const windowOptions = {
    width: 400,
    height: 200,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false
    },
    frame: false,
    show: true,
    center: true,
    title: app.name
  };
  splashScreen = defineWindow('splash', windowOptions);

  if (IS_DEVELOPMENT) {
    splashScreen.loadURL('http://localhost:3000/splash.html');
  } else {
    splashScreen.loadURL(`file://${path.join(__dirname, '/splash.html')}`);
  }

  splashScreen.on('closed', function () {
    splashScreen = null;
  });

  return splashScreen;
}

function createHelperWindow(url) {
  helperWindow = new BrowserWindow({
    width: 950,
    height: 660,
    minWidth: 950,
    minHeight: 580,
    useContentSize: true,
    center: true,
    autoHideMenuBar: true,
    show: true,
    frame: true,
  });

  helperWindow.loadURL(url);

  helperWindow.on('closed', () => {
    helperWindow = null;
  });

  helperWindow.on('maximize', () => {
    helperWindow.webContents.send('maximize');
  });

  helperWindow.on('unmaximize', () => {
    helperWindow.webContents.send('unmaximize');
  });
}

// TODO: electronite disabling this since it makes it a pain to debug things if the app just shuts down
// process.on('uncaughtException', (err) => {
//   console.error(`uncaugtException`, err);
//   closeAllWindows();
// });

// build menu

const menuTemplate = [
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
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator:
          process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.toggleDevTools();
          }
        }
      }
    ]
  }
];
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

// prevent multiple instances of the main window

app.requestSingleInstanceLock();

app.on('second-instance', () => {
  const window = getWindow(MAIN_WINDOW_ID);
  if (window) {
    if (window.isMinimized()) {
      window.restore();
    }
    window.focus();
  }
});

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // // on macOS it is common for applications to stay open until the user explicitly quits
  // if (process.platform !== 'darwin') {
    app.quit();
  // }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  const window = getWindow(MAIN_WINDOW_ID);
  if (window === null) {
    createMainWindow();
  }
});

// create main BrowserWindow with a splash screen when electron is ready
app.on('ready', () => {
  createSplashWindow();
  const mainWindow = createMainWindow();
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      mainWindow.show();
    }, 300);
  });
});

ipcMain.on('save-as', function (event, arg) {
  const input = dialog.showSaveDialogSync(mainWindow, arg.options);
  event.returnValue = input || false;
});

// TODO: electronite: restore later
// ipcMain.on('download-cancel', function (event, args) {
//   const item = downloadManager.get(args.id);
//
//   if (item) {
//     item.cancel();
//   }
// });

// ipcMain.on('download', function (event, args) {
//   const options = {
//     saveAs: true,
//     filename: args.name,
//     openFolderWhenDone: true,
//     showBadge: true,
//     unregisterWhenDone: true,
//     onProgress: (progress) => event.sender.send('download-progress', progress),
//     onStarted: (item) => {
//       const id = downloadManager.add(item);
//       event.sender.send('download-started', id);
//     },
//   };
//
//   download(BrowserWindow.getFocusedWindow(), args.url, options)
//     .then((dl) => {
//       event.sender.send('download-success', dl.getSavePath());
//     }).catch(error => {
//     event.sender.send('download-error', error);
//   });
// });

ipcMain.on('load-local', function (event, arg) {
  const input = dialog.showOpenDialogSync(mainWindow, arg.options);
  event.returnValue = input || false;
});

ipcMain.on('open-helper', (event, url = DCS_BASE_URL + '/') => {
  if (helperWindow) {
    helperWindow.show();
    helperWindow.loadURL(url);
  } else {
    createHelperWindow(url);
  }
});

