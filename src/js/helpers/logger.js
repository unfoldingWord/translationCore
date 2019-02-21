import fs from "fs-extra";
import path from "path-extra";

/**
 * Injects file logging into the default console logger.
 * console logging will continue to function as normal.
 * @param {string} [logDir=''] - directory where logs will be stored
 */
export function injectFileLogging(logDir = "") {
  fs.ensureDirSync(logDir);

  const logPath = path.join(logDir, new Date().toDateString() + ".log");
  const levels = [
    "error",
    "warn",
    "debug",
    "info",
    "log",
    "groupCollapsed",
    "group",
    "groupEnd",
    "trace"];
  const originalLevels = [];

  for (const level of levels) {
    originalLevels[level] = console[level];
    global.console[level] = (...data) => {
      // write to file
      writeLogSync(logPath, level, data);
      // pass to console
      originalLevels[level](...data);
    };
  }
}

/**
 * Writes log arguments to the file
 * @param {string} path - file path where logs will be appended
 * @param {string} level - the logging level
 * @param {array} args - arguments to the logger
 */
function writeLogSync(path, level, args) {
  // stringify args if applicable
  const stringableLevels = ['info', 'warn', 'error'];
  let data = args;
  if(stringableLevels.indexOf(level) > -1) {
    data = stringifyArgs(args);
  }

  // record log to file
  fs.appendFileSync(path,
    `${new Date().toTimeString()} ${level.toUpperCase()}: ${data} \n`,
    { encoding: "utf-8" });
}

/**
 * Converts arguments to strings as necessary
 * @param {array} args arguments to the logger
 */
function stringifyArgs(args) {
  const stringArgs = [];
  for (const arg of args) {
    if (typeof arg !== "string") {
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
