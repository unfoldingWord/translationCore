const path = require('path');
const { BrowserWindow } = require('electronite');
const remoteMain = require('@electron/remote/main');

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// global reference to windows (necessary to prevent windows from being garbage collected)
const windows = [];

/**
 * Returns the window with the id
 * @param {string} windowId
 * @returns {Electronite.BrowserWindow}
 */
function getWindow(windowId) {
  return windows[windowId];
}

/**
 * Closes all of the windows
 */
function closeAllWindows() {
  for (const window of windows) {
    window.close();
  }
}

/**
 * Returns the id of the window.
 * This will look at the real html window and check for a window id.
 * @returns {string|null}
 */
function getWindowId() {
  if (window) {
    for (const arg of window.process.argv) {
      if (/--window-id/.test(arg)) {
        return arg.split('=')[1];
      }
    }
  }
  return null;
}

/**
 * Defines a new window.
 * This simply sets up a new window with the provided options and configures
 * basic lifecycle handling so it can be garbage collected properly.
 * @param {string} windowId - the unique window id. This determines which `.js` file will be loaded
 * @param {object} [options={}] - the electron window options
 * @returns {Electron.BrowserWindow}
 */
function defineWindow(windowId, options = {}) {
  if (!options.webPreferences) {
    options.webPreferences = {};
  }

  if (!options.webPreferences.additionalArguments) {
    options.webPreferences.additionalArguments = [];
  }

  const windowOptions = {
    ...options,
    webPreferences: {
      ...options.webPreferences,
      additionalArguments: [
        ...options.webPreferences.additionalArguments,
        `--window-id=${windowId}`],
    },
  };
  const window = new BrowserWindow(windowOptions);

  // enable remote
  remoteMain.enable(window.webContents);
  console.log('window',window);

  window.on('closed', () => {
    windows[windowId] = null;
  });

  // register window
  windows[windowId] = window;

  // attach crash listener
  window.webContents.on('crashed', (event, killed) => {
    console.error(
      `Window ${windowId} ${killed ? 'was killed' : 'has crashed'}.`, event);
    windows[windowId] = null;
  });

  return window;
}

/**
 * Generates a new standard window that is wired up to HMR.
 * This window will route through the main entry point and pick up it's
 * primary `.js` file based on the `windowId`.
 * @param {string} windowId - the unique window id. This determines which `.js` file will be loaded
 * @param {object} [options={}] - the electron window options
 */
function createWindow(windowId, options = {}) {
  const window = defineWindow(windowId, options);

  if (IS_DEVELOPMENT) {
    window.loadURL('http://localhost:3000');

    // Install Dev Tools
    try {
      const {
        default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS,
      } = require(
        'electron-devtools-installer');

      [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS].forEach(extension => {
        installExtension(extension)
          .then((name) => console.log(`createMainWindow() - Added Extension: ${name}`))
          .catch((err) => console.warn('createMainWindow() - An error occurred: ', err));
      });
    } catch (e) {
      console.error('createMainWindow() - Failed to load electron developer tools', e);
    }
  } else {
    window.loadURL(`file://${path.join(__dirname, '/index.html')}`);
  }

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}

module.exports = {
  getWindow,
  getWindowId,
  defineWindow,
  createWindow,
  closeAllWindows,
};
