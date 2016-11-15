const api = window.ModuleApi;

const path = require('path');
const fs = require(window.__base + 'node_modules/fs-extra');
var parser = require('./usfm-parse.js');


function getData(params, progressCallback, onCompleteCallback) {
  // Get the gateway language and generate a check for each verse
  api.getGatewayLanguageAndSaveInCheckStore(params, progressCallback, function(bookData) {
    generateChecks(bookData, params, progressCallback, onCompleteCallback);
  });
}

/**
 * Generates two groups of checks, where each group has a check for each verse.
 */
function generateChecks(bookData, params, progressCallback, callback) {
  var groupNames = ['Overview', 'Naturalness', 'Clarity', 'Accuracy', 'Church Approval'];
  var groups = [];
  for (let groupName of groupNames) {
    var group = {
      group: groupName,
      checks: []
    };
    for (let chapter of bookData.chapters) {
        if(chapter.num){
          var check = {
            chapter: parseInt(chapter.num),
            verse: 1,
            index: bookData.chapters.indexOf(chapter),
            checkStatus: []
          }
          group.checks.push(check);
        }
      }
    for(var i = 0; i < group.checks.length; i++){
      switch (group.group) {
        case 'Overview':
          var checkStatus = {
            meaningBased: 'UNCHECKED',
            firstLangSpeakers: 'UNCHECKED',
            StatementOfFaith: 'UNCHECKED',
            translationGuidelines: 'UNCHECKED',
          }
          group.checks[i].checkStatus.push(checkStatus);
        break;
        case 'Naturalness':
          var checkStatus = {
            formOfLanguage: 'UNCHECKED',
            cultureCorrect: 'UNCHECKED',
            easyUnderstood: 'UNCHECKED',
            naturalText: 'UNCHECKED',
            communityReviewed: 'UNCHECKED',
            belNonBelReviewed: 'UNCHECKED',
            multAgeGroups: 'UNCHECKED',
            menAndWomen: 'UNCHECKED',
          }
        group.checks[i].checkStatus.push(checkStatus);
        break;
        case 'Clarity':
          var checkStatus = {
            easyUnderstood: 'UNCHECKED',
            correctNamingsVerbs: 'UNCHECKED',
            figuresofSpeech: 'UNCHECKED',
            meaningKept: 'UNCHECKED',
            communityReviewed: 'UNCHECKED',
            belNonBelReviewed: 'UNCHECKED',
            multAgeGroups: 'UNCHECKED',
            menAndWomen: 'UNCHECKED',
          }
        group.checks[i].checkStatus.push(checkStatus);
        break;
        case 'Accuracy':
          var checkStatus = {
            importantWordsUsed:'UNCHECKED',
            wordCorrect: 'UNCHECKED',
            wordConsistent: 'UNCHECKED',
            exegeticalUsed: 'UNCHECKED',
            correctNamingsVerbs: 'UNCHECKED',
            figuresofSpeech: 'UNCHECKED',
            communityReviewed: 'UNCHECKED',
            srcTextCompared: 'UNCHECKED',
            origTextCompared: 'UNCHECKED',
          }
        group.checks[i].checkStatus.push(checkStatus);
        break;
        case 'Church Approval':
          var checkStatus = {
            nativeAndGatewayReviewer:'UNCHECKED',
            naturalAndClear: 'UNCHECKED',
            accurate: 'UNCHECKED',
            faithful: 'UNCHECKED',
          }
        group.checks[i].checkStatus.push(checkStatus);
        break;
        default:
          //do nothing for now
        }
      }
      groups.push(group);
    }
    api.initializeCheckStore( "checkingRubricTool", params, groups);

    var targetLanguage = api.getDataFromCommon('targetLanguage');
    if (!targetLanguage) {
      if (!params.targetLanguagePath) {
        console.error('checkingRubric Tool requires a filepath');
      }
      else {
        sendToReader(params.targetLanguagePath, callback);
      }
    }
    callback();
}

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
  var missingChunks = 0;
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

function len(obj) {
  var length = 0;
  for (let item in obj) {
    length++;
  }
  return length;
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
  }catch (error) {
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


module.exports = getData;
