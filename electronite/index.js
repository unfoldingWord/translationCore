const {
  app, dialog, ipcMain, BrowserWindow, Menu,
} = require('electronite');
require('@electron/remote/main').initialize();
const path = require('path-extra');
const fs = require('fs-extra');
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
const {
  getAiApiFromMainProcess,
  getAvailableAiApiModelsFromMainProcess,
  queryAiApiFromMainProcess,
} = require('./queryAiApisFromMainProcess');
const { LlamaServerManager } = require('./llamaServerManager');
const {
  checkForModelUpdates,
  createCancelToken,
  downloadModels,
} = require('./modelUpdater');

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

// bundled llama-server: copied into resources/llama-server by scripts/add-llama-server.js when packaged,
// fetched into vendor/llama-server by scripts/fetch-llama-server.js for development
const llamaServer = new LlamaServerManager({
  serverRoot: app.isPackaged ?
    path.join(process.resourcesPath, 'llama-server') :
    path.join(app.getAppPath(), 'vendor', 'llama-server'),
  // the models llama-server can use: .gguf files (or folders of them) in ~/translationCore/models
  modelsDir: path.join(getHome() || '', 'translationCore', 'models'),
  // records the running server so one left behind by a crash is stopped on the next launch
  pidFile: path.join(app.getPath('userData'), 'llama-server.pid'),
  runningUnderARM64Translation: app.runningUnderARM64Translation,
});

let modelDownloadSignal = null; // cancel token for the model download in progress

function exposeAiApiQueryToMainWindow(window) {
  console.log(`exposeAiApiQueryToMainWindow`);
  ipcMain.removeHandler('ai-apis:query');
  ipcMain.removeHandler('ai-apis:get-available-models');
  ipcMain.removeHandler('ai-apis:get-api');
  ipcMain.removeHandler('ai-apis:local-server-start');
  ipcMain.removeHandler('ai-apis:local-server-stop');
  ipcMain.removeHandler('ai-apis:local-server-status');
  ipcMain.removeHandler('ai-apis:local-server-models');
  ipcMain.removeHandler('ai-apis:models-check-updates');
  ipcMain.removeHandler('ai-apis:models-download');
  ipcMain.removeHandler('ai-apis:models-cancel-download');

  // eslint-disable-next-line require-await
  ipcMain.handle('ai-apis:local-server-models', async (event) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:local-server-models is only available from the main window');
    }

    return llamaServer.getModels();
  });

  // the bundled llama-server - see llamaServerManager.js
  // eslint-disable-next-line require-await
  ipcMain.handle('ai-apis:local-server-start', async (event, options = {}) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:local-server-start is only available from the main window');
    }

    return llamaServer.start(options);
  });

  // eslint-disable-next-line require-await
  ipcMain.handle('ai-apis:local-server-stop', async (event) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:local-server-stop is only available from the main window');
    }

    return llamaServer.stop();
  });

  // eslint-disable-next-line require-await
  ipcMain.handle('ai-apis:local-server-status', async (event) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:local-server-status is only available from the main window');
    }

    return llamaServer.getStatus();
  });

  ipcMain.handle('ai-apis:query', async (event, query, options = {}) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:query is only available from the main window');
    }

    if (options.localServer) { // use the bundled llama-server, starting it if needed
      return queryAiApiFromMainProcess(query, await llamaServer.getClientOptions(options));
    }
    return queryAiApiFromMainProcess(query, options);
  });

  // eslint-disable-next-line require-await
  ipcMain.handle('ai-apis:get-available-models', async (event, options = {}) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:get-available-models is only available from the main window');
    }

    if (options.localServer) { // the models in ~/translationCore/models
      return llamaServer.getModels();
    }
    return getAvailableAiApiModelsFromMainProcess(options);
  });

  // eslint-disable-next-line require-await
  ipcMain.handle('ai-apis:get-api', async (event, options = {}, apiUrlPath) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:get-api is only available from the main window');
    }

    return getAiApiFromMainProcess(options, apiUrlPath);
  });

  // model updates from the GitHub release - see modelUpdater.js
  // eslint-disable-next-line require-await
  ipcMain.handle('ai-apis:models-check-updates', async (event) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:models-check-updates is only available from the main window');
    }

    return checkForModelUpdates({ modelsDir: llamaServer.modelsDir });
  });

  ipcMain.handle('ai-apis:models-download', async (event, models = []) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:models-download is only available from the main window');
    }

    if (modelDownloadSignal) {
      throw new Error('A model download is already in progress');
    }

    const signal = createCancelToken();
    modelDownloadSignal = signal;

    try {
      return await downloadModels(models, {
        modelsDir: llamaServer.modelsDir,
        signal,
        onProgress: (progress) => {
          if (!event.sender.isDestroyed()) {
            event.sender.send('ai-apis:models-download-progress', progress);
          }
        },
        // stop llama-server before replacing a model it may have open - it restarts on the next query
        beforeReplace: () => llamaServer.stop(),
      });
    } finally {
      modelDownloadSignal = null;
    }
  });

  // eslint-disable-next-line require-await
  ipcMain.handle('ai-apis:models-cancel-download', async (event) => {
    if (!window || event.sender !== window.webContents) {
      throw new Error('ai-apis:models-cancel-download is only available from the main window');
    }

    if (modelDownloadSignal) {
      modelDownloadSignal.cancel();
      return true;
    }
    return false;
  });
}

function getHome() {
  let home =app.getPath('home');

  if (home) {
    console.log(`found home path '${home}' from 'app.getPath('home')'`);
  } else {
    home = process.env.HOME;

    if (home) {
      console.log(`found home path '${home}' from 'process.env.HOME'`);
    } else if (process.env.HOMEPATH) {
      home = `${process.env.HOMEDRIVE}${process.env.HOMEPATH}`;
      console.log(`found home path '${home}' from 'process.env.HOMEPATH'`);
    }
  }

  if (!home) {
    console.log(`did not find home path`);
  }

  return home;
}

// check if we are running in QA MODE
const qaFilePath = path.join(getHome() || '', 'translationCore', 'QA_MODE');
let QA_MODE = false;

if (fs.existsSync(qaFilePath)) {
  console.log(`qaFilePath ${qaFilePath} exists!`);

  try {
    const data = fs.readFileSync(qaFilePath, 'utf8');
    console.log(`data read = ${data}`);
    QA_MODE = data && data.trim();
  } catch (e) {
    console.log(`could not read ${qaFilePath}`);
  }

  console.log(`QA_MODE = ${QA_MODE}`);
}

/**
 * Creates a window for the main application.
 * @returns {Window}
 */
function createMainWindow(qaMode = '') {
  console.log('createMainWindow() - creating');
  const additionalArguments = [];

  if (qaMode) {
    additionalArguments.push(`--QA_MODE=${qaMode}`);
  }

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
      preload: path.join(__dirname, 'preloadAiApi.js'),
      additionalArguments,
    },
  };

  mainWindow = createWindow(MAIN_WINDOW_ID, windowOptions);
  exposeAiApiQueryToMainWindow(mainWindow);

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

// don't leave llama-server running (and holding the model in memory) after tC exits
app.on('will-quit', () => {
  llamaServer.stopSync();
});

// also covers app.exit() and other exits that skip will-quit (stopSync does nothing if already stopped)
process.on('exit', () => {
  llamaServer.stopSync();
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    createMainWindow(QA_MODE);
  }
});

// create main BrowserWindow with a splash screen when electron is ready
app.on('ready', () => {
  // stop a llama-server left running if tC crashed or was killed last time
  llamaServer.cleanupOrphan();
  console.log('ready - creating splash screen');
  createSplashWindow();
  setTimeout(function () {
    splashScreen.show();
    createMainWindow(QA_MODE);
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
