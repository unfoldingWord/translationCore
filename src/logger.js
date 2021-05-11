import { app } from '@electron/remote';

/**
 * The console.log levels that will be intercepted.
 * @type {string[]}
 */
const TARGETED_LEVELS = [
  'error',
  'warn',
  'debug',
  'info',
  'log',
  'groupCollapsed',
  'group',
  'groupEnd',
  'trace',
];

/**
 * Holds the original console.log levels so we can still access it.
 * @type {{}}
 */
const globalConsole = {};

/**
 * Holds all of the registered log handlers.
 * @type {Array}
 */
const handlers = [];

/**
 * Holds the handler bound to window.onerror.
 * @type {null}
 */
let windowHandler = null;

/**
 * Attaches a log handler to global.console and window.onerror
 * @param {function} handler - receives log events. Should accept (level, ...args)
 */
export const registerLogHandler = (handler) => {
  if (typeof handler !== 'function') {
    console.error(
      `Invalid log handler. Expected a function but instead received ${typeof handler}`);
    return;
  }
  bindConsole();
  bindWindow();
  handlers.push(handler);
};

/**
 * Creates log handler that emits electron events to the main thread
 * @param eventName - the name of the electron event that will be emitted.
 * @returns {Function}
 */
export const createElectronHandler = eventName => (level, ...args) => {
  app.emit(eventName, {
    level,
    args,
  });
};

/**
 * Binds to window.onerror.
 * This can only happen once. Subsequent calls won't do anything.
 */
function bindWindow() {
  if (windowHandler === null) {
    windowHandler = (msg, url, lineNo, columnNo, error) => {
      hijackLog('error')([
        msg, url, lineNo, columnNo, error,
      ]);
      return false;
    };
    window.onerror = windowHandler;
  }
}

/**
 * Intercepts console logs and sends a copy to the handlers.
 * @param {string} level - the log level
 * @returns {Function}
 */
const hijackLog = level => (...args) => {
  globalConsole[level](...args);

  for (const handler of handlers) {
    handler(...processLog(level, args));
  }
};

/**
 * Hijacks the console log levels.
 * This can only happen once. Subsequent calls won't do anything.
 */
function bindConsole() {
  for (const level of TARGETED_LEVELS) {
    if (!globalConsole[level]) {
      globalConsole[level] = console[level];
      global.console[level] = hijackLog(level);
    }
  }
}

/**
 * Prepares a log for delegation
 * @param {string} level - the logging level
 * @param {array} args - arguments to the logger
 * @param {array} [stringableLevels] - an array of log levels whose arguments will be stringified.
 * @return {array} - {level, timestamp, args}
 */
function processLog(
  level, args, stringableLevels = ['info', 'warn', 'error']) {
  // stringify args if applicable
  let formattedArgs = args;

  if (stringableLevels.indexOf(level) > -1) {
    formattedArgs = stringifyArgs(args);
  }

  return [
    level.toUpperCase(),
    ...formattedArgs,
  ];
}

/**
 * Converts arguments to strings as necessary
 * @param {array} args arguments to the logger
 */
function stringifyArgs(args) {
  const stringArgs = [];

  for (const arg of args) {
    if (typeof arg !== 'string') {
      try {
        stringArgs.push(JSON.stringify(arg));
      } catch (e) {
        stringArgs.push(`[${typeof arg}]`);
      }
    } else {
      stringArgs.push(arg);
    }
  }
  return stringArgs;
}
