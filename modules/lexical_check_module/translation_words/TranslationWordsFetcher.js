// TranslationWordsFetcher.js//

/**
* @description - Grabs a list of tW and then
* returns individual files when queried
* @author Samuel Faulkner, Evan Wiederspan
*/

const GITHUB_API_URL = "https://api.github.com/repos/Door43/d43-en/contents/obe?ref=master",
  REQUEST_FAILED = "Request failed",
  AUTHENTICATION = "access_token=" + require("../Authentication.js"),
  UNKNOWN_TYPE = "Unknown type: ",
  WORD_NOT_FOUND = "Word not found in list";

class TranslationWordsFetcher {
  constructor() {
    this.wordList = [];
  }

/**
* Gets the list of words using github api this must be called before getWord
* will work!
* @param {string} url - url that the request is made to. Leave undefined to get tW from
* the door43 github repo
* @param {function} callback - called with (error, data) once operation is finished
*/
  getWordList(url, callback = () => ({})) {
// console.log('Calling getWordList');
    var link = url || GITHUB_API_URL;

    var request = new XMLHttpRequest();

    var _this = this;

// Parses each github api object individually
    function parseEntry(entryObj, report) {
      if (entryObj.type == "file") {
        _this.wordList.push({
          "name": entryObj.name,
          "link": entryObj.download_url
        });
// console.log('Reporting');
        report();
      }
/**
* this is a directory, recursively call getWordList with
*  the directory's URL
*/
      else if (entryObj.type == "dir") {
/** pass in report as the callback because we don't want callback to
* be called with a subdirectory's words
*/
        _this.getWordList(entryObj.url, report);
      }
else {
        var error = UNKNOWN_TYPE + entryObj.type;
        report(error);
      }
    }

    request.onload = function() {
      var listOfEntries = JSON.parse(this.response);
// function that ensures we don't call the callback until we're completely done
      iterateOver(listOfEntries, parseEntry, function(error) {
        if (error) {
          callback(error);
        }
        else {
          _this.wordList.sort(function(first, second) {
            return stringCompare(first.name, second.name);
          });
          callback(null, _this.wordList);
        }
      });
    };

    request.onerror = function() {
      callback(REQUEST_FAILED);
    };

    request.open('GET', link + (link.indexOf('?') == -1 ? '?' : '&') + AUTHENTICATION, true);
    request.send();
  }

/**
* Downloads the file from the internet and
* saves it in memory in the wordList array
* @param {string} word - the word that it's file is to be downloaded
* @param {function} callback(error, data) - called when the file is finished downloading
*/
  getWord(word, callback) {
    if (!this.wordList) {
      return;
    }

    var wordObj = search(this.wordList, function(item) {
      return stringCompare(word, item.name);
    });

    if (!wordObj) {
      callback(WORD_NOT_FOUND);
    }
    else {
      var url = wordObj.link;

      var request = new XMLHttpRequest();

      request.onload = function() {
        wordObj['file'] = this.response;
        callback(null, wordObj.file);
      };

      request.onerror = function() {
        callback(REQUEST_FAILED);
      };

      request.open('GET', url + (url.indexOf('?') == -1 ? '?' : '&') + AUTHENTICATION, true);
      request.send();
    }
  }

  getAliases(progCallback = () => {}, callback = () => {}) {
    var numDone = 0;
    const numToDo = this.wordList.length;
    var _this = this;
    for (let word of this.wordList) {
      this.getWord(word.name, (err, file) => {
        if (err) {
          console.log(err);
          callback(err);
          return;
        }
        else {
          word.aliases = parseFile(file);
        }
        finished(); // for the progCallback
      });
    }

    function parseFile(file) {
      const aliasReg = new RegExp("=+\\s*([^=]+)=+");
      let aliasRes;
      let returnVal = [];
      try {
        [, aliasRes] = aliasReg.exec(file);
      }
      catch (e) {
        console.log(e);
        return [];
      }
      // split by comma and take off hanging spaces
      return aliasRes.split(",").map(str => str.trim());
    }

    function finished() {
      progCallback(++numDone, numToDo);
      if (numDone == numToDo) callback(undefined);
    }
  }
}

/**
* Compares two string alphabetically
* @param {string} first - string to be compared against
* @param {string} second - string to be compared with
*/
function stringCompare(first, second) {
  if (first < second) {
    return -1;
  }
  else if (first > second) {
    return 1;
  }
else {
    return 0;
  }
}

/**
* Binary search of the list. I couldn't find this in the native methods of an array so
* I wrote it
* @param {array} list - array of items to be searched
* @param {function} boolFunction - returns # < 0, # > 0. or 0 depending on which path the
* search should take
* @param {int} first - beginnging of the current partition of the list
* @param {int} second - end of the current partition of the list
*/
function search(list, boolFunction, first = 0, last = -1) {
  if (last == -1) {
    last = list.length;
  }
  if (first > last) {
    return;
  }
  var mid = Math.floor(((first - last) * 0.5)) + last;
  var result = boolFunction(list[mid]);
  if (result < 0) {
    return search(list, boolFunction, first, mid - 1);
  }
  else if (result > 0) {
    return search(list, boolFunction, mid + 1, last);
  }
else {
    return list[mid];
  }
}

function iterateOver(list, iterator, callback) {
// console.log('Iterating over list of length: ' + list.length);
  var doneCount = 0;

  function report(error) {
    if (error) {
      callback(error);
    }
    else {
      doneCount++;
      if (doneCount == list.length) {
        callback();
      }
    }
  }

  for (var i = 0; i < list.length; i++) {
    iterator(list[i], report);
  }
}

module.exports = TranslationWordsFetcher;
