const {
  app, dialog, ipcMain, BrowserWindow, Menu,
} = require('electronite');
require('@electron/remote/main').initialize();
const path = require('path-extra');
const { download } = require('@neutrinog/electron-dl');
const p = require('../package.json');
const { isGitInstalled, showElectronGitSetup } = require('../src/js/helpers/InstallationHelpers');
const DownloadManager = require('../src/js/DownloadManager');
const { BUILD } = require('./build.json');
const { config } = require('./cfg.json');
const {
  createWindow,
  defineWindow,
  getWindow,
} = require('./electronWindows');
const MenuTemplate = require('./MenuTemplate').template;
const DCS_BASE_URL = 'https://git.door43.org'; //TODO: this is also defined in constants.js, in future need to move definition to common place
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const MAIN_WINDOW_ID = 'main';
process.env.tcVersion = p.version;
process.env.BUILD = BUILD || config.BUILD;
process.env.TC_HELP_DESK_TOKEN = config.TC_HELP_DESK_TOKEN;
process.env.TC_HELP_DESK_EMAIL = config.TC_HELP_DESK_EMAIL;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow;
let helperWindow;
let splashScreen;

const downloadManager = new DownloadManager();

/**
 * Creates a window for the main application.
 * @returns {Window}
 */
function createMainWindow() {
  console.log('createMainWindow() - creating');
  const windowOptions = {
    icon: './TC_Icon.png',
    title: 'translationCore',
    autoHideMenuBar: true,
    minWidth: 1200,
    minHeight: 689,
    show: false,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  };

  mainWindow = createWindow(MAIN_WINDOW_ID, windowOptions);

  if (process.env.DEVELOPER_MODE === 'true' || process.env.developer_mode === 'true') {
    mainWindow.webContents.openDevTools();
  }

  isGitInstalled().then(installed => {
    if (installed) {
      console.log('createMainWindow() - Git is installed.');
    } else {
      console.warn('createMainWindow() - Git is not installed. Prompting user.');
      splashScreen.hide();
      return showElectronGitSetup(dialog).then(() => {
        app.quit();
      }).catch(() => {
        app.quit();
      });
    }
  });

  // Doesn't display until ready
  mainWindow.once('ready-to-show', () => {
    console.log('createMainWindow() - mainWindow ready-to-show');
    setTimeout(() => {
      splashScreen.close();
      mainWindow.show();
      mainWindow.maximize();
    }, 300);
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Creates a window for the splash screen.
 * This uses a dedicated webpack entry point so it loads fast.
 * @returns {Electron.BrowserWindow}
 */
function createSplashWindow() {
  console.log(`process.env.BUILD=${process.env.BUILD}`);
  const windowOptions = {
    width: 600,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preloadSplash.js'),
    },
    frame: false,
    show: true,
    center: true,
  };

  splashScreen = defineWindow('splash', windowOptions);

  if (IS_DEVELOPMENT) {
    splashScreen.loadURL(`file://${path.join(__dirname, '../public/splash.html')}`);
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

// build menu
const menu = Menu.buildFromTemplate(MenuTemplate);
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
  if (mainWindow === null) {
    createMainWindow();
  }
});

// create main BrowserWindow with a splash screen when electron is ready
app.on('ready', () => {
  console.log('ready - creating splash screen');
  createSplashWindow();
  setTimeout(function () {
    splashScreen.show();
    createMainWindow();
  }, 500);
});

ipcMain.on('save-as', function (event, arg) {
  const input = dialog.showSaveDialogSync(mainWindow, arg.options);
  event.returnValue = input || false;
});

ipcMain.on('download-cancel', function (event, args) {
  const item = downloadManager.get(args.id);

  if (item) {
    item.cancel();
  }
});

ipcMain.on('download', function (event, args) {
  const options = {
    saveAs: true,
    filename: args.name,
    openFolderWhenDone: true,
    showBadge: true,
    unregisterWhenDone: true,
    onProgress: (progress) => event.sender.send('download-progress', progress),
    onStarted: (item) => {
      const id = downloadManager.add(item);
      event.sender.send('download-started', id);
    },
  };

  download(BrowserWindow.getFocusedWindow(), args.url, options)
    .then((dl) => {
      event.sender.send('download-success', dl.getSavePath());
    }).catch(error => {
      event.sender.send('download-error', error);
    });
});

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
