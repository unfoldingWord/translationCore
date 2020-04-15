const {BrowserWindow} = require('electron');
const path = require('path');

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// global reference to windows (necessary to prevent windows from being garbage collected)
const windows = [];

/**
 * Returns the window with the id
 * @param {string} windowId
 * @returns {Electron.BrowserWindow}
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
        `--window-id=${windowId}`]
    }
  };
  const window = new BrowserWindow(windowOptions);

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

    // install some developer tools
    try {
      const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS
      } = require('electron-devtools-installer');

      installExtension(REACT_DEVELOPER_TOOLS).catch(e => {
        console.error('Could not install React developer tools', e);
      });
    } catch (e) {
      console.error('Could not install developer extensions', e);
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
  closeAllWindows
};
