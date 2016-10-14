// FetchData.js//

const api = window.ModuleApi;
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path');
var missingChunks = 0;

var parser = require('./usfm-parse.js');

function fetchData(params, progress, callback) {
  // Get original language
  // check if original language is already in common
  // get it if it isn't using parsers and params

  var targetLanguage = api.getDataFromCommon('targetLanguage');

  if (!targetLanguage) {
    if (!params.targetLanguagePath) {
      console.error('TPane requires a filepath');
    }
    else {
      dispatcher.schedule(function (subCallback) { sendToReader(params.targetLanguagePath, subCallback); });
    }
  }

  var originalLanguage = api.getDataFromCommon('originalLanguage');
  if (!originalLanguage) {
    if (!params.originalLanguagePath) {
      console.error("Can't find original language");
    }
    else {
      dispatcher.schedule(function (subCallback) {
        readInOriginal(path.join(params.originalLanguagePath, bookAbbreviationToBookPath(params.bookAbbr)),
          params.bookAbbr, subCallback);
      });
    }
  }
  dispatcher.run(callback, progress);
  // I'm not supposed to get the gateway language!
}

function bookAbbreviationToBookPath(bookAbbr) {
  var bookName = api.convertToFullBookName(bookAbbr);
  bookName = stripSpaces(bookName) + '.json';
  return bookName;
}

const spaceRegex = new RegExp('\\s', 'g');
function stripSpaces(str) {
  return str.replace(spaceRegex, '');
}

class Dispatcher {
  constructor() {
    this.jobs = [];
  }
  schedule(job) {
    this.jobs.push(job);
  }
  run(callback, progress) {
    var _this = this;
    var doneJobs = 0;
    if (this.jobs.length <= 0) {
      progress(100);
      callback();
    }
    for (var job of this.jobs) {
      job(
        function () {
          missingChunks = 0;
          doneJobs++;
          progress((doneJobs / _this.jobs.length) * 100);
          if (doneJobs >= _this.jobs.length) {
            callback();
          }
        }
      );
    }
  }
}

const dispatcher = new Dispatcher();

/**
* @description This function is used to send a file path to the readFile()
* module
* @param {string} file The path of the directory as specified by the user.
******************************************************************************/
function sendToReader(file, callback) {
  try {
    // FileModule.readFile(path.join(file, 'manifest.json'), readInManifest);
    var data = api.getDataFromCommon('tcManifest');
    readInManifest(data, file, callback);
  } catch (error) {
    console.error(error);
  }
}
/**
* @description This function takes the manifest file and parses it to JSON.
* @param {string} manifest - The manifest.json file
******************************************************************************/
function readInManifest(manifest, source, callback) {
    var bookTitle;
  if (manifest.ts_project) {
    bookTitle = manifest.ts_project.name;
  }  else  {
    bookTitle = manifest.project.name;
  }
  let bookTitleSplit = bookTitle.split(' ');
  var bookName = bookTitleSplit.join('');
  let bookFileName = bookName + '.json';
  let finishedChunks = manifest.finished_chunks || manifest.finished_frames;
  var total = len(finishedChunks);
  let currentJoined = {};
  var done = 0;
  for (let chapterVerse in finishedChunks) {
    if (finishedChunks.hasOwnProperty(chapterVerse)) {
      let splitted = finishedChunks[chapterVerse].split('-');
      openUsfmFromChunks(splitted, currentJoined, total, source,
        function () {
          done++;
          if (done >= (total - missingChunks)) {
            missingChunks = 0;
            api.putDataInCommon('targetLanguage', currentJoined);
            callback();
          }
        });
    }
  }
}

function readInOriginal(path, bookAbbr, callback) {
  var originalLanguage = api.getDataFromCommon("params").originalLanguage;
  try {
  var data = fs.readFileSync(path).toString();
    if (!data) {
    }
    else {
      var betterData = typeof data == 'object' ? JSON.stringify(data) : data;
      openOriginal(betterData, api.convertToFullBookName(bookAbbr));
      if (originalLanguage == "hebrew") {
        parseHebrew();
      }
      else {
        parseGreek();
      }
      callback();
    }
    } catch(error) {
      console.log(error);
  }
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
    var data = fs.readFileSync(chunkLocation);
    if (!data) {
    }
    joinChunks(data.toString(), currentChapter, currentJoined);
    callback();
  } catch (error) {
        missingChunks++;
  }
}
/**
* @description This function saves the chunks locally as a window object;
* @param {string} text - The text being read in from chunks
******************************************************************************/
function joinChunks(text, currentChapter, currentJoined) {
  currentChapter = parseInt(currentChapter);
  if (currentChapter == 0) {
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
}

/**
* @description This function processes the original text.
* @param {string} text - The text being read from the JSON bible object
******************************************************************************/
function openOriginal(text, bookName) {
  var input = JSON.parse(text);
  input[stripSpaces(bookName)].title = bookName;
  var newData = {};
  for (var chapter in input[bookName]) {
    newData[parseInt(chapter)] = {};
    for (var verse in input[bookName][chapter]) {
      newData[parseInt(chapter)][parseInt(verse)] = input[bookName][chapter][verse];
    }
  }
  // CoreActions.updateOriginalLanguage(input[bookName]);
  //make new function to put straight into common as array?
  api.putDataInCommon('originalLanguage', input[stripSpaces(bookName)]);
}

function len(obj) {
  var length = 0;
  for (let item in obj) {
    length++;
  }
  return length;
}

/**
  * @author Evan Wiederspan
  * @description parses the incoming greek and modifies it to be ready
*/
function parseGreek() {
  // looking at it now, this method with the regex may be way less efficient
  // than just splitting the verse by spaces and going word by word
  // this might want to be reworked later for efficiency
  var greekRegex = /([^\w\s,.\-?!\(\)]+)\s+G(\d{1,6})\s+(?:G\d{1,6})*\s*([A-Z0-9\-]+)/g;
  var lex = require("./Lexicon.json");
  let origText = api.getDataFromCommon("originalLanguage");
  let parsedText = {};
  for (let ch in origText) {
    if (!parseInt(ch)) { // skip the title
      continue;
    }
    parsedText[ch] = {};
    let chap = origText[ch];
    for (let v in chap) {
      let origVerse = origText[ch][v];
      let verse = parsedText[ch][v] = [];
      let result = [];
      while (result = greekRegex.exec(origVerse)) {
        let [, word, strong, speech] = result;
        try {
          let {brief, long} = lex[strong];
          verse.push({ word, strong, speech, brief, long });
        }
        catch (e) {
          verse.push({ word, strong, speech, brief: "No definition found", long: "No definition found" });
        }

      }
    }
  }
  api.putDataInCheckStore("TPane", 'parsedGreek', parsedText);
  //Put the parsed Hebrew into the checkstore in the Object format specified here
}

function parseHebrew() {
  var lex = require("./HebrewLexicon.json");
  let origText = api.getDataFromCommon("originalLanguage");
  let parsedText = {};
  for (let ch in origText) {
    if (!parseInt(ch)) { // skip the title
      continue;
    }
    parsedText[ch] = {};
    let chap = origText[ch];
    for (let v in chap) {
      let origVerseFull = origText[ch][v];
      let origVerse = origVerseFull.split(" ");
      let verse = parsedText[ch][v] = [];
      var word;
      var strong = "Strong Missing";
      var brief = "Brief Missing";
      for (var element in origVerse) {
        try {
          var currentElement = origVerse[element];
          var nextElement = origVerse[parseInt(element) + 1];
          if (isNaN(currentElement[currentElement.length - 1]) && !isNaN(nextElement[nextElement.length - 1])) {
            word = currentElement;
            strong = nextElement;
            brief = lex[strong].strongs_def;
            verse.push({ word, strong, brief });
          }
        }
        catch (e) {
          if (word) {
            //verse.push({ word, strong, brief });
          }
        }
      }
    }
  }
  api.putDataInCheckStore("TPane", 'parsedGreek', parsedText);
  //Put the parsed Hebrew into the checkstore in the Object format specified here
}

module.exports = fetchData;
