const remote = window.electron.remote;
const {dialog} = remote;

const FileModule = require('./FileModule');
const CoreActions = require('../actions/CoreActions.js');
const parser = require('./usfm-parse.js');

const path = require('path');

var manifestSource = '';
var bookName = '';
var joinedChunks = {};
var bookTitle = "";

module.exports = (function() {
/**
 * @description This function begins the import process.
 * @param {boolean} error - Whether or not an error occurs.
 * @param {object} response - The response from the server.
 * @param {string} body - The body of the page queried.
 ******************************************************************************/
  function startImport(error, response, body) {
    if (!error && response.statusCode === 200) {
      CoreActions.updateModal(false);
      let parsedManifest = JSON.parse(body);
      bookTitle = parsedManifest.project.name;
      let bookTitleSplit = bookTitle.split(' ');
      bookName = bookTitleSplit.join('');
      let bookFileName = bookName + '.json';
      try {
        let filePath = path.join('data', 'ulgb', bookFileName);
        FileModule.readFile(filePath, openOriginal);
      } catch (error) {
        console.log(error);
      }
      let finishedChunks = parsedManifest.finished_chunks;
      for (let chapterVerse in finishedChunks) {
        if (finishedChunks.hasOwnProperty(chapterVerse)) {
          openUsfmFromChunks(finishedChunks[chapterVerse]);
        }
      }
    } else {
      dialog.showErrorBox('Import Error', 'The project cannot be found');
    }
  }
/**
 * @description This function opens a chunk from a remote source.
 * @param {array} chunkArray - The chunks to be read.
 ******************************************************************************/
  function openUsfmFromChunks(chunkArray) {
    let chunk = chunkArray.split('-');
    try {
      FileModule.loadOnline(manifestSource + '/' + chunk[0] + '/' + chunk[1] +
    '.txt', joinChunks, chunk[0]);
    } catch (error) {
      dialog.showErrorBox('Import Error', 'Unknown error has occurred');
      console.log(error);
    }
  }
/**
 * @description This function saves the chunks locally as a window object;
 * @param {boolean} error - The error from a server
 * @param {object} response - A response object from the server
 * @param {string} text - The text being read in from chunks
 * @param {string} currentChapter - The current chapter that is being read.
 ******************************************************************************/
  function joinChunks(error, response, text, currentChapter) {
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
    CoreActions.updateTargetLanguage(joinedChunks);
  }

/**
 * @description This function opens the original book by using the bookname;
 * @param {JSON} text - The manifest, to find the bookname.
 ******************************************************************************/
  function openOriginal(text) {
    var input = JSON.parse(text);
    input[bookName].title = bookTitle;
    CoreActions.updateOriginalLanguage(input[bookName]);
  }
/**
 * @description This function takes a url and opens it from a remote source.
 * @param {string} url - The url that the project is found at
 ******************************************************************************/
  return function(url) {
    url += '/raw/master/';
    manifestSource = url;
    url += 'manifest.json';
    FileModule.loadOnline(url, startImport, "");
  };
})();
