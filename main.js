const electron = require('electron')
const ipcMain = electron.ipcMain;
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog;
const fs = require('fs-extra');
const path = require('path-extra');
const exec = require('child_process').exec;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow;
let helperWindow;
let splashScreen;

function createMainWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({icon: 'images/TC_Icon.png', autoHideMenuBar: true, minWidth: 1200, minHeight: 650, center: true, useContentSize: true, show: false});

  //mainWindow.webContents.openDevTools();
  var gitFile = 'GitInstaller-32.exe';
  if (process.env.PROCESSOR_ARCHITECTURE === "AMD64") {
    gitFile = 'GitInstaller-64.exe';
  }
  let installerLocation = path.join(path.datadir('translationCore'), gitFile);
  exec('git', (err, data) => {
    if (!data) {
      if (process.platform == 'win32') {
        dialog.showErrorBox('Startup Failed', 'You must have Git installed and on your path in order to use translationCore. \nClick OK to install Git now.');
        fs.copySync(__dirname + '/installers/' + gitFile, installerLocation);
        exec(gitFile + ' /SILENT /COMPONENTS="assoc"', {cwd: path.datadir('translationCore')}, function(err, data) {
          if (err) {
            console.log(err);
            dialog.showErrorBox('Git Installation Failed', 'The git installation failed.');
            app.quit();
          } else {
            mainWindow.loadURL(`file://${__dirname}/index.html`);
          }
        });
      } else {
        dialog.showErrorBox('Startup Failed', 'You must have git installed and on your path in order to use translationCore.');
        exec('open https://git-scm.com/downloads');
        app.quit();
      }
    } else {
      mainWindow.loadURL(`file://${__dirname}/index.html`);
    }
  })
  // dialog.showErrorBox('Login Failed', 'Incorrect username or password. This could be caused by using an email address instead of a username.');
  // and load the index.html of the app.

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
    mainWindow = null
  })
}

function createMainSplash() {
  splashScreen = new BrowserWindow({
    width: 600,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    icon: 'images/TC_Icon.png',
    frame: false,
    center: true,
    show: false
  });

  //splashScreen.webContents.openDevTools();

  splashScreen.loadURL(`file://${__dirname}/splash.html`);

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
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow()
  }
});

ipcMain.on('save-as', function (event, arg) {
  var input = dialog.showSaveDialog(mainWindow, arg.options);
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
