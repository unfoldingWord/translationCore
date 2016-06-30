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
const FileActions = require('./FileActions');
const Book = require('./bibletext');
var manifestSource = '';
var joinedChunks = {};
var currentChapter = '';

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
    var style = {
      dropzone: {
        width: '100%',
        color: '#212121',
        height: '200px',
        border: '2px dashed #727272',
        borderRadius: '5px',
        fontSize: '25px'
      },
      dropzoneActive: {
        border: '2px solid #727272',
        backgroundColor: '#f5f5f5'
      },
      dropzoneText: {
        lineHeight: '200px',
        verticalAlign: 'middle',
        width: '100%'
      }
    };
    return (
    <div onClick = {this.onClick} >
      <Dropzone onDrop = {this.onDrop}
        disableClick={true} multiple={false} style={style.dropzone}
        activeStyle={style.dropzoneActive}>
        <div style={style.dropzoneText}>
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
    FM.readFile(file + '/manifest.json', readInManifest);
    FileActions.setState(false);
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
  for (let chapterVerse in finishedChunks) {
    if (finishedChunks.hasOwnProperty(chapterVerse)) {
      let splitted = finishedChunks[chapterVerse].split('-');
      openUsfmFromChunks(splitted);
    }
  }
  FileActions.changeTargetText(<Book input={joinedChunks}/>);
}
/**
 * @description This function opens the chunks defined in the manifest file.
 * @param {array} chunk - An array of the chunks defined in manifest
 ******************************************************************************/
function openUsfmFromChunks(chunk) {
  currentChapter = chunk[0];
  try {
    FM.readFile(manifestSource + '/' + chunk[0] + '/' + chunk[1] +
  '.txt', saveChunksLocal);
  } catch (error) {
    dialog.showErrorBox('Import Error', 'Unknown error has occurred');
    console.log(error);
  }
}
/**
 * @description This function saves the chunks locally as a window object;
 * @param {string} text - The text being read in from chunks
 ******************************************************************************/
function saveChunksLocal(text) {
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
