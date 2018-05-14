'use strict';
import path from 'path-extra';
const fsActual = require.requireActual('fs-extra'); // for copying test files into mock
const fs = jest.genMockFromModule('fs-extra');
let mockFS = Object.create(null);


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
  return mockFS[directoryPath] || [];
}

function writeFileSync(filePath, data) {
  addFileToParentDirectory(filePath);
  mockFS[filePath] = data;
}

function readFileSync(filePath) {
  if (typeof filePath !== 'string') throw 'fail';
  return mockFS[filePath];
}

function outputFileSync(filePath, data) {
  addFileToParentDirectory(filePath);
  mockFS[filePath] = data;
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
  mockFS[filePath] = data;
}

function readJsonSync(filePath) {
  if(!existsSync(filePath)) {
    throw "File could not be read: " + filePath;
  }
  const data = mockFS[filePath];
  // clone data so changes to object do not affect object in file system
  const clonedData = JSON.parse(typeof data === 'string' ? data : JSON.stringify(data));
  return clonedData;
}

function existsSync(path) {
  return mockFS[path] !== '' ? !!mockFS[path] : true;
}

function removeSync(path) {
  Object.keys(mockFS).forEach((element) => {
    element.includes(path) ? delete mockFS[element] : null;
  });
}

function renameSync(oldPath, newPath) {
  writeFileSync(newPath, readFileSync(oldPath));
  removeSync(oldPath);
}

function copySync(srcPath, destinationPath) {
  mockFS[destinationPath] = mockFS[srcPath];
  addFileToParentDirectory(destinationPath);
  const isDir = statSync(srcPath).isDirectory();
  if (isDir) {
    const files = readdirSync(srcPath);
    for (let f of files) {
      copySync(path.join(srcPath,f), path.join(destinationPath,f));
    }
  }
}

function ensureDirSync(path) {
  if (!mockFS[path]) mockFS[path] = [];
  addFileToParentDirectory(path);
}

function Stats(path, exists, isDir) {
  this.path = path;
  this.exists = exists;
  this.isDir = isDir;
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
 * only minimal implementation of fs.Stats: isDirectory() and isFile()
 * @param path
 */
function statSync(path) {
  const exists = existsSync(path);
  const isDir = (exists && Array.isArray(mockFS[path]));
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
 * @param {string} sourceFolder - source folder fo files to copy (in linux format)
 * @param {string} mockDestinationFolder - destination folder for copied files {string} in mock File system
 */
function __loadFilesIntoMockFs(copyFiles, sourceFolder, mockDestinationFolder) {
  const mockDestinationFolder_ =  __correctSeparatorsFromLinux(mockDestinationFolder);
  const sourceFolder_ = __correctSeparatorsFromLinux(sourceFolder );
  for (let copyFile of copyFiles) {
    const filePath2 = path.join(sourceFolder_, __correctSeparatorsFromLinux(copyFile));
    let fileData = null;
    const isDir = fsActual.statSync(filePath2).isDirectory();
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
 * @param {string} sourceFolder - source folder fo files to copy (in linux format)
 * @param {string} mockDestinationFolder - destination folder for copied files {string} in mock File system
 */
function __loadDirIntoMockFs(sourceFolder, mockDestinationFolder) {
  const mockDestinationFolder_ =  __correctSeparatorsFromLinux(mockDestinationFolder);
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

fs.__files = () => {
  return mockFS;
};
fs.__setMockDirectories = __setMockDirectories;
fs.__setMockFS = __setMockFS;
fs.__resetMockFS = __resetMockFS;
fs.__actual = fsActual; // to access actual file system
fs.__loadFilesIntoMockFs = __loadFilesIntoMockFs;
fs.__correctSeparatorsFromLinux = __correctSeparatorsFromLinux;
fs.__loadDirIntoMockFs = __loadDirIntoMockFs;
fs.readdirSync = readdirSync;
fs.writeFileSync = writeFileSync;
fs.readFileSync = readFileSync;
fs.outputJsonSync = outputJsonSync;
fs.readJsonSync = readJsonSync;
fs.readJSONSync = readJsonSync;
fs.existsSync = existsSync;
fs.pathExistsSync = existsSync;
fs.outputFileSync = outputFileSync;
fs.removeSync = removeSync;
fs.copySync = copySync;
fs.renameSync = renameSync;
fs.ensureDirSync = ensureDirSync;
fs.statSync = statSync;
fs.fstatSync = statSync;
fs.lstatSync = statSync;
fs.moveSync = moveSync;

module.exports = fs;
