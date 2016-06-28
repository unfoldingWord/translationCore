/**
 * @description: This file provides the drag and drop file upload, along with
 *               the more traditional click and open file upload system.
 * @author: Ian Hoegen
 ******************************************************************************/
const Dropzone = require('react-dropzone');
const FM = require('./filemodule.js');
const remote = window.electron.remote;
const parser = require('./usfm-parse.js');
const {dialog} = remote;
const React = require('react');
const ReactDOM = require('react-dom');

var FileUploader = React.createClass({
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
    <div onClick = {this.onClick}>
      <Dropzone onDrop = {this.onDrop} disableClick={true} multiple={false}>
        <div>Drag files here to upload, or click to select a file. </div>
      </Dropzone>
    </div>

  );
  }

});

window.FileUploader = FileUploader;
module.exports = FileUploader;

/**
 * @description This function is used to send a file path to the readFile()
 * module
 * @param {string} file The path of the directory as specified by the user.
 ******************************************************************************/
function sendToReader(file) {
  try {
    localStorage.setItem('manifestSource', file);
    FM.readFile(file + '\\manifest.json', readInManifest);
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
  let parsedManifest = JSON.parse(manifest);
  let finishedChunks = parsedManifest.finished_chunks;
  localStorage.setItem('joinedChunks', JSON.stringify({}));
  for (let chapterVerse in finishedChunks) {
    let splitted = finishedChunks[chapterVerse].split('-');
    openUsfmFromChunks(splitted);
  }
}
/**
 * @description This function opens the chunks defined in the manifest file.
 * @param {array} chunk - An array of the chunks defined in manifest
 ******************************************************************************/
function openUsfmFromChunks(chunk) {
  var source = localStorage.getItem('manifestSource');
  localStorage.setItem('currentChapter', chunk[0]);
  try {
    FM.readFile(source + '\\' + chunk[0] + '\\' + chunk[1] +
  '.txt', saveChunksLocal);
  } catch (error) {
    dialog.showErrorBox('Import Error', 'Unknown error has occurred');
    console.log(error);
  }
}
/**
 * @description This function saves the chunks locally as a localstorage object;
 * @param {string} text - The text being read in from chunks
 ******************************************************************************/
function saveChunksLocal(text) {
  var currentJoined = JSON.parse(localStorage.getItem('joinedChunks'));
  var currentChapter = localStorage.getItem('currentChapter');
  if (currentChapter === '00') {
    currentJoined.title = text;
  } else {
    if (currentJoined[currentChapter] === undefined) {
      currentJoined[currentChapter] = [];
    }
    var currentChunk = parser(text);
    for (let verse in currentChunk.verses) {
      var currentVerse = currentChunk.verses[verse];
      currentJoined[currentChapter].push(currentVerse);
    }
  }
  localStorage.setItem('joinedChunks', JSON.stringify(currentJoined));
}
