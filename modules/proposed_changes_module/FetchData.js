//FetchData.js//

const api = window.ModuleApi;

const path = require('path');

var parser = require('./usfm-parse.js');

function fetchData(params, progress, callback) {
//Get target Language
//check if original language is already in common
//get it if it isn't using parsers and params

  var targetLanguage = api.getDataFromCommon('targetLanguage');

  if (!targetLanguage) {
    if (!params.targetLanguagePath) {
      console.error('ProposedChanges requires a filepath');
    }
    else {
      sendToReader(params.targetLanguagePath, 
        function() {
          progress(100);
          api.putDataInCheckStore("ProposedChanges", "newWord", '');
          callback();
        }, 
        progress
      );
    }
  }
  else {
    progress(100);
    api.putDataInCheckStore("ProposedChanges", "newWord", '');
    callback();
  }
}

/**
 * @description This function is used to send a file path to the readFile()
 * module
 * @param {string} file The path of the directory as specified by the user.
 ******************************************************************************/
function sendToReader(file, callback, progress) {
  try {
    // FileModule.readFile(path.join(file, 'manifest.json'), readInManifest);
    readFile(path.join(file, 'manifest.json'), function(err, data) {
      if (err) {
        console.error(err);
      }
      else {
        readInManifest(data, file, callback, progress);
      }
    });
  } catch (error) {
    console.error(error);
  }
}
/**
 * @description This function takes the manifest file and parses it to JSON.
 * @param {string} manifest - The manifest.json file
 ******************************************************************************/
function readInManifest(manifest, source, callback, progress) {
  let parsedManifest = JSON.parse(manifest);
  var bookTitle = parsedManifest.project.name;
  let bookTitleSplit = bookTitle.split(' ');
  var bookName = bookTitleSplit.join('');
  let bookFileName = bookName + '.json';
  let finishedChunks = parsedManifest.finished_chunks;
  var total = len(finishedChunks);
  let currentJoined = {};
  var done = 0;
  for (let chapterVerse in finishedChunks) {
    if (finishedChunks.hasOwnProperty(chapterVerse)) {
      let splitted = finishedChunks[chapterVerse].split('-');
      openUsfmFromChunks(splitted, currentJoined, total, source,
        function() {
          done++;
          progress((done / total) * 100);
          if (done >= total) {
            api.putDataInCommon('targetLanguage', currentJoined);
            callback();
          }
        });
    }
  }

}

function readFile(path, callback) {
  api.inputText(path, function(err, data) {
    callback(err, data.toString());
  });
}


/**
 * @description This function opens the chunks defined in the manifest file.
 * @param {array} chunk - An array of the chunks defined in manifest
 ******************************************************************************/
function openUsfmFromChunks(chunk, currentJoined, totalChunk, source, callback) {
  let currentChapter = chunk[0];
  try {
    currentChapter = parseInt(currentChapter);
    var fileName = chunk[1] + '.txt';
    var chunkLocation = path.join(source, chunk[0], fileName);
    readFile(chunkLocation, function(err, data) {
      if (err) {
        console.error('Error in openUSFM: ' + err);
      } else {
        joinChunks(data, currentChapter, currentJoined);
        callback();
      }
    });
  } catch (error) {
    console.error(error);
  }
}
/**
 * @description This function saves the chunks locally as a window object;
 * @param {string} text - The text being read in from chunks
 ******************************************************************************/
function joinChunks(text, currentChapter, currentJoined) {
  if (currentChapter === 0) {
    currentJoined.title = text;
  } else {
    if (currentJoined[currentChapter] === undefined) {
      currentJoined[currentChapter] = {};
    }
    var currentChunk = parser(text);
    for (let verse in currentChunk.verses) {
      if (currentChunk.verses.hasOwnProperty(verse)) {
        var currentVerse = currentChunk.verses[verse];
        currentJoined[currentChapter][parseInt(verse)] = currentVerse;
      }
    }
  }
}

function len(obj) {
	var length = 0;
	for (let item in obj) {
		length++;
	}
	return length;
}

module.exports = fetchData;
