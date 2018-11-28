const electron = require('electron');
const p = require('../package.json');
const {download} = require('@neutrinog/electron-dl');
const DownloadManager = require('./js/DownloadManager');

const ipcMain = electron.ipcMain;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow;
let helperWindow;
let splashScreen;

const downloadManager = new DownloadManager();

/**
 * Creates the main browser window
 */
function createMainWindow () {
  mainWindow = new BrowserWindow({icon: './images/TC_Icon.png', autoHideMenuBar: true, minWidth: 1200, minHeight: 650, center: true, useContentSize: true, show: false});

  if('developer_mode' in p && p.developer_mode) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  //Doesn't display until ready
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

  if (process.env.NODE_ENV === 'development') {
    // Install React Dev Tools
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

    installExtension(REACT_DEVELOPER_TOOLS).then((name) => {
        console.log(`Added Extension: ${name}`);
    })
    .catch((err) => {
        console.log('An error occurred: ', err);
    });
  }
}

function createMainSplash() {
  splashScreen = new BrowserWindow({
    width: 600,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    icon: './images/TC_Icon.png',
    frame: false,
    center: true,
    show: false
  });

  //splashScreen.webContents.openDevTools();

  splashScreen.loadURL(`file://${__dirname}/html/splash.html`);

  splashScreen.on('closed', function() {
    splashScreen = null;
  });
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
    frame: true
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createMainSplash();
  setTimeout(function () {
    splashScreen.show();
    createMainWindow();
  }, 500);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
    app.quit();
  // }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

ipcMain.on('save-as', function (event, arg) {
  const input = dialog.showSaveDialog(mainWindow, arg.options);
  event.returnValue = input || false;
});

ipcMain.on('download-cancel', function(event, args) {
  const item = downloadManager.get(args.id);
  if(item) {
    item.cancel();
  }
});

ipcMain.on('download', function(event, args) {
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
    }
  };
  download(BrowserWindow.getFocusedWindow(), args.url, options)
    .then((dl) => {
      event.sender.send('download-success', dl.getSavePath());
    }).catch(error => {
      event.sender.send('download-error', error);
  });
});

ipcMain.on('load-local', function (event, arg) {
  const input = dialog.showOpenDialog(mainWindow, arg.options);
  event.returnValue = input || false;
});

ipcMain.on('open-helper', (event, url = "http://git.door43.org/") => {
    if (helperWindow) {
        helperWindow.show();
        helperWindow.loadURL(url);
    } else {
        createHelperWindow(url);
    }
});
