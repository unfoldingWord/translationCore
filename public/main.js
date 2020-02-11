const fs = require('fs');
const path = require('path');
const {app, Menu} = require('electron');
const {
  createWindow,
  defineWindow,
  getWindow,
  closeAllWindows
} = require('./electronWindows');

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const MAIN_WINDOW_ID = 'main';

/**
 * Creates a window for the main application.
 * @returns {Window}
 */
function createMainWindow() {
  const windowOptions = {
    width: 980,
    minWidth: 425,
    height: 580,
    minHeight: 425,
    show: false,
    center: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    },
    title: app.getName()
  };
  return createWindow(MAIN_WINDOW_ID, windowOptions);
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
  const window = defineWindow('splash', windowOptions);

  if (IS_DEVELOPMENT) {
    window.loadURL('http://localhost:3000/splash.html');
  } else {
    window.loadURL(`file://${path.join(__dirname, '/splash.html')}`);
  }

  return window;
}

// attach process logger

process.on('uncaughtException', (err) => {
  console.error(err);
  closeAllWindows();
});

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
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
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
  const splashWindow = createSplashWindow();
  const mainWindow = createMainWindow();
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splashWindow.close();
      mainWindow.show();
    }, 300);
  });
});

// receive log events from the render thread
app.on('log-event', args => {
  try {
    const logPath = path.normalize(`console.log`);
    const payload = `\n${new Date().toTimeString()} ${args.level}: ${args.args}`;
    let writer = fs.appendFileSync;
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size / 1000000.0 > 1) {
      // overwrite entire file if missing or lager than 1mb
      writer = fs.writeFileSync;
    }
    writer(logPath, payload, {encoding: 'utf-8'});
  } catch (e) {
    console.error('Failed to handle log', e, args);
  }
});
