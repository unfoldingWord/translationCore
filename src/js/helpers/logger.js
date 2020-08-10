const fs = require('fs-extra');
const path = require('path-extra');

/**
 * get the log file for current date
 * @param logDir
 * @return {*}
 */
export function getLogFilePathForCurrentDate(logDir = '') {
  const logPath = path.join(logDir, new Date().toDateString() + '.log');
  return logPath;
}

/**
 * read the contents of current error log if found
 * @param logDir
 * @return {string}
 */
export function getCurrentLog(logDir = '') {
  let logData = '';
  const logPath = getLogFilePathForCurrentDate(logDir);

  if (fs.existsSync(logPath)) {
    try {
      logData = fs.readFileSync(logPath).toString();
    } catch (e) {
      console.error('FeedbackDialogContainer._submitFeedback() could not read log file: ' + logPath);
    }
  } else {
    console.error('FeedbackDialogContainer._submitFeedback() log file does not exist: ' + logPath);
  }
  return logData;
}

/**
 * Injects file logging into the default console logger.
 * console logging will continue to function as normal.
 * @param {string} [logDir=''] - directory where logs will be stored
 * @param {string} appVersion - the version of the application (commit)
 */
export function injectFileLogging(logDir = '', appVersion='') {
  fs.ensureDirSync(logDir);
  const logPath = getLogFilePathForCurrentDate(logDir);
  const levels = [
    'error',
    'warn',
    'debug',
    'info',
    'log',
    'groupCollapsed',
    'group',
    'groupEnd',
    'trace'];
  const originalLevels = [];

  for (const level of levels) {
    originalLevels[level] = console[level];
    global.console[level] = (...data) => {
      // write to file
      writeLogSync(logPath, level, appVersion, data);
      // pass to console
      originalLevels[level](...data);
    };
  }
}

/**
 * Writes log arguments to the file
 * @param {string} path - file path where logs will be appended
 * @param {string} level - the logging level
 * @param {string} appVersion - the version of the application
 * @param {array} args - arguments to the logger
 */
export function writeLogSync(path, level, appVersion, args) {
  // stringify args if applicable
  const stringableLevels = ['info', 'warn', 'error'];
  let data = args;

  if (stringableLevels.indexOf(level) > -1) {
    data = stringifyArgs(args);
  }

  // record log to file
  fs.appendFileSync(path,
    `${new Date().toTimeString()} ${level.toUpperCase()}: ${appVersion}: ${data} \n`,
    { encoding: 'utf-8' });
}

/**
 * Converts arguments to strings as necessary
 * @param {array} args arguments to the logger
 */
export function stringifyArgs(args) {
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
