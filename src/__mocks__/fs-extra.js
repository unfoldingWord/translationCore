/* eslint-disable no-throw-literal */
/* eslint-disable no-unused-expressions */

import path from 'path-extra';
import _ from 'lodash';
const fsActual = require.requireActual('fs-extra'); // for copying test files into mock
const fs = jest.genMockFromModule('fs-extra');
let mockFS = Object.create(null);

/** @deprecated */
function __setMockFS(newMockFS) {
  mockFS = newMockFS;
}

function __resetMockFS() {
  mockFS = Object.create(null);
}

/**
 * This is a custom function that our tests can use during setup to specify
 * what the files on the "mock" filesystem should look like when any of the
 * `fs` APIs are used.
 * @param {Array} newMockFiles
 */
function __setMockDirectories(newMockFiles) {
  mockFS = Object.create(null);

  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFS[dir]) {
      mockFS[dir] = [];
    }
    mockFS[dir].push(path.basename(file));
  }
}

/**
 * A custom version of `readdirSync` that reads from the special mocked out
 * file list set via __setMockDirectories
 * @param {String} directoryPath
 */
function readdirSync(directoryPath) {
  if (statSync(directoryPath).isDirectory()) {
    return mockFS[directoryPath];
  }
  return [];
}

function readdir(directoryPath) {
  return Promise.resolve(readdirSync(directoryPath));
}

function writeFileSync(filePath, data) {
  addFileToParentDirectory(filePath);
  mockFS[filePath] = data;
}

function readFileSync(filePath) {
  if (!existsSync(filePath)) {
    throw 'File could not be read: ' + filePath;
  }

  if (typeof filePath !== 'string') {
    throw 'fail';
  }

  const data = mockFS[filePath];

  // TRICKY: readFileSync should always return a string
  if (typeof data === 'object' && data !== null) {
    return JSON.stringify(data);
  } else {
    return data;
  }
}

function readFile(filePath) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(readFileSync(filePath));
    } catch (e) {
      reject(e);
    }
  });
}

function outputFileSync(filePath, data) {
  addFileToParentDirectory(filePath);
  mockFS[filePath] = data;
}

function outputFile(filePath, data) {
  return new Promise(function (resolve) {
    outputFileSync(filePath, data);
    resolve();
  });
}

function __dumpMockFS() {
  const fsList = JSON.stringify(mockFS, null, 2);
  console.log('mock FS:\n' + fsList);
}

/**
 * create subdirs and add file name to them
 * @param filePath
 */
function addFileToParentDirectory(filePath) {
  const dir = path.dirname(filePath);
  const filename = path.basename(filePath);

  if (filename) {
    if (!mockFS[dir]) {
      mockFS[dir] = [];
      addFileToParentDirectory(dir);
    }

    if (mockFS[dir].indexOf(filename) < 0) {
      mockFS[dir].push(filename);
    }
  }
}

function outputJsonSync(filePath, data) {
  addFileToParentDirectory(filePath);
  mockFS[filePath] = _.cloneDeep(data);
}

function outputJson(filePath, data) {
  return new Promise(function (resolve) {
    outputJsonSync(filePath, data);
    resolve();
  });
}

function readJsonSync(filePath) {
  if (!existsSync(filePath)) {
    throw 'File could not be read: ' + filePath;
  }

  const data = mockFS[filePath];
  // clone data so changes to object do not affect object in file system
  const clonedData = JSON.parse(typeof data === 'string' ? data : JSON.stringify(data));
  return clonedData;
}

function readJson(filePath) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(readJsonSync(filePath));
    } catch (e) {
      reject(e);
    }
  });
}

function existsSync(path) {
  const exists = mockFS[path] !== '' ? !!mockFS[path] : true;
  return exists;
}

function exists(path) {
  return Promise.resolve(existsSync(path));
}

function removeSync(path) {
  Object.keys(mockFS).forEach((element) => {
    element.includes(path) ? delete mockFS[element] : null;
  });
}

function remove(path) {
  return new Promise(function (resolve) {
    removeSync(path);
    resolve();
  });
}

function renameSync(oldPath, newPath) {
  writeFileSync(newPath, readFileSync(oldPath));
  removeSync(oldPath);
}

function rename(oldPath, newPath) {
  return new Promise(function (resolve) {
    renameSync(oldPath, newPath);
    resolve();
  });
}

function copySync(srcPath, destinationPath) {
  const isDir = statSync(srcPath).isDirectory();

  if (isDir) {
    ensureDirSync(destinationPath);
    const files = readdirSync(srcPath);

    for (let f of files) {
      copySync(path.join(srcPath,f), path.join(destinationPath,f));
    }
  } else { // not directory
    addFileToParentDirectory(destinationPath);
    mockFS[destinationPath] = _.cloneDeep(mockFS[srcPath]);
  }
}

function ensureDirSync(path) {
  if (!mockFS[path]) {
    mockFS[path] = [];
  }
  addFileToParentDirectory(path);
}

function Stats(path, exists, isDir) {
  this.path = path;
  this.exists = exists;
  this.isDir = isDir;
  this.atime = 'Not-a-real-date';
  this.isDirectory = () => {
    const isDir = this.exists && this.isDir;
    return isDir;
  };
  this.isFile = () => {
    const isFile = this.exists && !this.isDir;
    return isFile;
  };
}

/**
 * ensure this actually contains an array of file names (strings)
 * @param path
 * @return {boolean}
 */
function isValidDirectory(path) {
  const dir = mockFS[path];
  let isDir = Array.isArray(dir);

  if (isDir) { // make sure it's an array of paths (strings) and not objects (such as json object stored)
    const failedItem = dir.findIndex((item) => (typeof item !== 'string'));
    isDir = (failedItem < 0); // valid if failed item not found
  }
  return isDir;
}

/**
 * only minimal implementation of fs.Stats: isDirectory() and isFile()
 * @param path
 */
function statSync(path) {
  const exists = existsSync(path);
  const isDir = (exists && isValidDirectory(path));
  return new Stats(path, exists, isDir);
}

/**
 * @description convertes linux style separators to OS specific separators
 * @param {string} filePath
 * @return {string} converted path
 */
function __correctSeparatorsFromLinux(filePath) {
  const result = filePath.split('/').join(path.sep);
  return result;
}

/**
 * @description - copies list of files from local file system into mock File system
 * @param {array} copyFiles - array of paths (in linux format) relative to source path
 * @param {string} sourceFolder - source folder of files to copy (in linux format)
 * @param {string} mockDestinationFolder - destination folder for copied files {string} in mock File system
 */
function __loadFilesIntoMockFs(copyFiles, sourceFolder, mockDestinationFolder) {
  const mockDestinationFolder_ = __correctSeparatorsFromLinux(mockDestinationFolder);
  const sourceFolder_ = __correctSeparatorsFromLinux(sourceFolder );

  for (let copyFile of copyFiles) {
    const filePath2 = path.join(sourceFolder_, __correctSeparatorsFromLinux(copyFile));
    let fileData = null;
    let isDir = false;

    try {
      if (fsActual.existsSync(filePath2)) {
        isDir = fsActual.statSync(filePath2).isDirectory();
      } else {
        console.log(`__loadFilesIntoMockFs() - does not exist: ${filePath2}`);
        continue;
      }
    } catch (e) {
      console.error(`__loadFilesIntoMockFs() - could not test: ${filePath2}`);
      continue;
    }

    if (!isDir) {
      fileData = fsActual.readFileSync(filePath2).toString();
    }

    let dirPath = mockDestinationFolder_;
    fs.ensureDirSync(dirPath);
    const parts = copyFile.split('/');
    const endCount = parts.length - 1;

    for (let i = 0; i < endCount; i++) {
      const part = parts[i];
      dirPath = path.join(dirPath, part);
      fs.ensureDirSync(dirPath);
    }

    if (!isDir) {
      const filePath = path.join(mockDestinationFolder_, parts.join(path.sep));
      // console.log("Copying File: " + filePath);
      fs.writeFileSync(filePath, fileData);
    } else {
      __loadDirIntoMockFs(filePath2, path.join(mockDestinationFolder, copyFile));
    }
  }
}

/**
 * @description - recursively copies folder from local file system into mock File system
 * @param {string} sourceFolder - source folder of files to copy (in linux format)
 * @param {string} mockDestinationFolder - destination folder for copied files {string} in mock File system
 */
function __loadDirIntoMockFs(sourceFolder, mockDestinationFolder) {
  const mockDestinationFolder_ = __correctSeparatorsFromLinux(mockDestinationFolder);
  fs.ensureDirSync(mockDestinationFolder_);
  const sourceFolder_ = __correctSeparatorsFromLinux(sourceFolder);
  // console.log("Copying Directory: " + sourceFolder_);
  const files = fsActual.readdirSync(sourceFolder_);

  for (let file of files) {
    const sourceFilePath = path.join(sourceFolder, file);
    const mockFilePath = path.join(mockDestinationFolder_, file);
    const isDir = fsActual.statSync(sourceFilePath).isDirectory();

    if (!isDir) {
      const fileData = fsActual.readFileSync(sourceFilePath).toString();
      // console.log("Copying Subfile: " + mockFilePath);
      fs.writeFileSync(mockFilePath, fileData);
    } else {
      // console.log("Entering Subdir: " + mockFilePath);
      __loadDirIntoMockFs( sourceFilePath, mockFilePath);
    }
  }
}

function moveSync(source, destination) {
  copySync(source, destination);
  removeSync(source);
}

fs.__files = () => mockFS;
fs.__dumpMockFS = __dumpMockFS;
fs.__setMockDirectories = __setMockDirectories;
fs.__setMockFS = __setMockFS;
fs.__resetMockFS = __resetMockFS;
fs.__actual = fsActual; // to access actual file system
fs.__loadFilesIntoMockFs = __loadFilesIntoMockFs;
fs.__correctSeparatorsFromLinux = __correctSeparatorsFromLinux;
fs.__loadDirIntoMockFs = __loadDirIntoMockFs;
fs.readdirSync = jest.fn(readdirSync);
fs.readdir = readdir;
fs.writeFileSync = writeFileSync;
fs.readFileSync = jest.fn(readFileSync);
fs.readFile = readFile;
fs.writeJSONSync = outputJsonSync;
fs.outputJsonSync = jest.fn(outputJsonSync);
fs.outputJSONSync = jest.fn(outputJsonSync);
fs.outputJson = outputJson;
fs.outputJSON = outputJson;
fs.readJsonSync = jest.fn(readJsonSync);
fs.readJSONSync = readJsonSync;
fs.readJson = readJson;
fs.readJSON = readJson;
fs.existsSync = jest.fn(existsSync);
fs.exists = exists;
fs.pathExists = exists;
fs.pathExistsSync = jest.fn(existsSync);
fs.outputFileSync = outputFileSync;
fs.outputFile = outputFile;
fs.removeSync = removeSync;
fs.remove = remove;
fs.copySync = jest.fn(copySync);
fs.renameSync = renameSync;
fs.rename = rename;
fs.ensureDirSync = ensureDirSync;
fs.statSync = statSync;
fs.fstatSync = statSync;
fs.lstatSync = jest.fn(statSync);
fs.moveSync = moveSync;

module.exports = fs;
