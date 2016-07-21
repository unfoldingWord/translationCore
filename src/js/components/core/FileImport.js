/**
 * @description: This file provides the drag and drop file upload, along with
 *               the more traditional click and open file upload system.
 * @author: Ian Hoegen
 ******************************************************************************/

const FileModule = require('./FileModule');

const remote = window.electron.remote;
const {dialog} = remote;

const API = require('../../ModuleApi.js');
const CoreActions = require('../../actions/CoreActions.js');
const CheckStore = require('../../stores/CheckStore.js');

const path = require('path');

const parser = require('./usfm-parse.js');

const IMPORT_ERROR = 'Import Error';
const MISSING_MANIFEST = 'Please make sure that your folder includes a manifest.json file';

var manifestSource = '';
var bookName = '';
var joinedChunks = {};
var currentChapter = '';
var bookTitle = "";

/**
 * @description This function is used to send a file path to the readFile()
 * module
 * @param {string} file The path of the directory as specified by the user.
 ******************************************************************************/
function sendToReader(file) {
  try {
    manifestSource = file;
    FileModule.readFile(path.join(file, 'manifest.json'), readInManifest);
  } catch (error) {
    dialog.showErrorBox(IMPORT_ERROR, MISSING_MANIFEST);
    console.error(error);
  }
}
/**
 * @description This function takes the manifest file and parses it to JSON.
 * @param {string} manifest - The manifest.json file
 ******************************************************************************/
function readInManifest(manifest) {
  CoreActions.updateModal(false);
  let parsedManifest = JSON.parse(manifest);
  bookTitle = parsedManifest.project.name;
  let bookTitleSplit = bookTitle.split(' ');
  bookName = bookTitleSplit.join('');
  let bookFileName = bookName + '.json';
  try {
    FileModule.readFile(path.join('data', 'ulgb', bookFileName), openOriginal);
  } catch (error) {
    console.error(error);
  }
  let finishedChunks = parsedManifest.finished_chunks;
  for (let chapterVerse in finishedChunks) {
    if (finishedChunks.hasOwnProperty(chapterVerse)) {
      let splitted = finishedChunks[chapterVerse].split('-');
      openUsfmFromChunks(splitted);
    }
  }
    API.putDataInCommon('targetLanguage', joinedChunks);
    CheckStore.emitEvent('updateTargetLanguage');
}
/**
 * @description This function opens the chunks defined in the manifest file.
 * @param {array} chunk - An array of the chunks defined in manifest
 ******************************************************************************/
function openUsfmFromChunks(chunk) {
  currentChapter = chunk[0];
  try {
    var fileName = chunk[1] + '.txt';
    var chunkLocation = path.join(manifestSource, chunk[0], fileName);
    FileModule.readFile(chunkLocation, joinChunks);
  } catch (error) {
    console.error(error);
  }
}
/**
 * @description This function saves the chunks locally as a window object;
 * @param {string} text - The text being read in from chunks
 ******************************************************************************/
function joinChunks(text) {
  var currentJoined = joinedChunks;
  if (currentChapter === '00') {
    currentJoined.title = text;
  } else {
    if (currentJoined[currentChapter] === undefined) {
      currentJoined[currentChapter] = {};
    }
    var currentChunk = parser(text);
    for (let verse in currentChunk.verses) {
      if (currentChunk.verses.hasOwnProperty(verse)) {
        var currentVerse = currentChunk.verses[verse];
        currentJoined[currentChapter][verse] = currentVerse;
      }
    }
  }
  joinedChunks = currentJoined;
}

/**
 * @description This function processes the original text.
 * @param {string} text - The text being read from the JSON bible object
 ******************************************************************************/
function openOriginal(text) {
  var input = JSON.parse(text);
  input[bookName].title = bookTitle;
  API.putDataInCommon('originalLanguage', input[bookName]);
  CheckStore.emitEvent('updateOriginalLanguage');
}

module.exports = function(locate) {
  sendToReader(locate);
}
