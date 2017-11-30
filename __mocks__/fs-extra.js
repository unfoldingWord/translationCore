'use strict';
import path from 'path-extra';

const fs = jest.genMockFromModule('fs-extra');
let mockFS = Object.create(null);


function __setMockFS(newMockFS) {
  mockFS = newMockFS;
  console.log(mockFS);
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
  mockFS[filePath] = data;
}

function readFileSync(filePath) {
  return mockFS[filePath];
}

function outputFileSync(filePath, data) {
  mockFS[filePath] = data;
}

function outputJsonSync(filePath, data) {
  mockFS[filePath] = data;
}

function readJsonSync(filePath) {
  return mockFS[filePath];
}

function existsSync(path) {
  return mockFS[path] !== '' ? !!mockFS[path] : true;
}

function removeSync(path) {
  Object.keys(mockFS).forEach((element) => {
    element.includes(path) ? delete mockFS[element] : null;
  });
}

function copySync(srcPath, destinationPath) {
  mockFS[destinationPath] = mockFS[srcPath];
}

fs.__setMockDirectories = __setMockDirectories;
fs.__setMockFS = __setMockFS;
fs.__resetMockFS = __resetMockFS;
fs.readdirSync = readdirSync;
fs.writeFileSync = writeFileSync;
fs.readFileSync = readFileSync;
fs.outputJsonSync = outputJsonSync;
fs.readJsonSync = readJsonSync;
fs.existsSync = existsSync;
fs.outputFileSync = outputFileSync;
fs.removeSync = removeSync;
fs.copySync = copySync;

module.exports = fs;
