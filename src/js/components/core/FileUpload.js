/**
 * @description: This file provides the drag and drop file upload, along with
 *               the more traditional click and open file upload system.
 * @author: Ian Hoegen
 ******************************************************************************/
const React = require('react');

const Dropzone = require('react-dropzone');
const FileModule = require('./FileModule');

const remote = window.electron.remote;
const {dialog} = remote;

const CoreActions = require('../../actions/CoreActions.js');

const path = require('path');

const Book = require('./Book');

const parser = require('./usfm-parse.js');
const style = require('./Style');

var manifestSource = '';
var bookName = '';
var joinedChunks = {};
var currentChapter = '';
var bookTitle = "";

const FileUploader = React.createClass({
  onDrop: function(files) {
    if (files !== undefined) {
      sendToReader(files[0].path);
    }
  },
  onClick: function() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        sendToReader(filename[0]);
      }
    });
  },

  render: function() {
    return (
    <div onClick = {this.onClick} >
        <Dropzone onDrop = {this.onDrop}
        disableClick={true} multiple={false} style={style.dropzone.main}
        activeStyle={style.dropzone.active}>
            <div style={style.dropzone.text}>
              <center>
                Drag files here to upload, or click to select a file
              </center>
            </div>
      </Dropzone>
    </div>
  );
  }

});

module.exports = FileUploader;

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
    dialog.showErrorBox('Import Error', 'Please make sure that ' +
    'your folder includes a manifest.json file.');
    console.log(error);
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
    console.log(error);
  }
  let finishedChunks = parsedManifest.finished_chunks;
  for (let chapterVerse in finishedChunks) {
    if (finishedChunks.hasOwnProperty(chapterVerse)) {
      let splitted = finishedChunks[chapterVerse].split('-');
      openUsfmFromChunks(splitted);
    }
  }
  CoreActions.updateTargetLanguage(joinedChunks);
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
    dialog.showErrorBox('Import Error', 'Unknown error has occurred');
    console.log(error);
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
  console.log(input[bookName]);
  CoreActions.updateOriginalLanguage(input[bookName]);
}
