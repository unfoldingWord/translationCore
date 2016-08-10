const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const ipc = require('electron').ipcMain;
const fs = require('fs');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let reportWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({icon: 'images/TC_Icon.png', useContentSize: true, show: false});
  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)
	
  //Doesn't display until ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}
// currently sent from ReportGenerator.js
ipc.on('open-report', (event, path) => {
  if (reportWindow) {
    reportWindow.focus();
    return;
  }
  reportWindow = new BrowserWindow({autoHideMenuBar: true, show: false, width: 600, height: 600, title: "Check Report", icon: 'images/TC_Icon.png'});
  reportWindow.loadURL("file:///" + path);
    //Doesn't display until ready
  reportWindow.once('ready-to-show', () => {
    reportWindow.show()
  });
  reportWindow.on('closed', () => {
    reportWindow = undefined;
    // send event to the mainWindow if its open still
    if (mainWindow) {
      mainWindow.webContents.send("report-closed", path);
    }
    // delete the rendered report.html if it exists
    // I would prefer that this be done in the renderer thread,
    // but unless this was in the main thread, the main window could
    // be closed before the report window, and the report file would not
    // get deleted
    fs.stat(path, (err, stats) => {
      if (!err) {
        fs.unlink(path, err => {
          if (err) console.log(err);
        });
      }
      else {
        console.log(err);
      }
    });

  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
