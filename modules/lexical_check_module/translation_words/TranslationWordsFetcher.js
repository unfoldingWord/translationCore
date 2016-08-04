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
    this.caseSensitiveAliases = new Set();
  }

/**
* Gets the list of words using github api this must be called before getWord
* will work!
* @param {string} url - url that the request is made to. Leave undefined to get tW from
* the door43 github repo
* @param {function} callback - called with (error, data) once operation is finished
*/
  getWordList(url, callback = () => ({})) {
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
        report();
      }
      /**
      * this is a directory, recursively call getWordList with
      *  the directory's URL
      */
      else if (entryObj.type == "dir") {
        /*
         * pass in report as the callback because we don't want callback to
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
    /**
     * This is a convenience class that is used as a set, but the 
     * collisions are based on lowercased strings
     */
    class LowercasedSet {
      constructor() {
        this.values = {};
      }

      add(string) {
        if (!(string.toLowerCase() in this.values)) {
          this.values[string.toLowerCase()] = string;
        }
      }

      has(string) {
        return string.toLowerCase() in this.values;
      }

      index(string) {
        return this.values[string.toLowerCase()];
      }
    }

    var aliases = new LowercasedSet();

    var calls = [];
    var numberDone = 0;
    function iterateOverCalls(start=0, end=100) {
      end = Math.min(end, calls.length);
      start = Math.min(start, end);
      if (start == end) {
        callback();
      }
      var callsNow = calls.slice(start, end);
      iterateOver(
        callsNow, 
        function(listItem, report) {
          listItem(function() {
            report();
            progCallback(++numberDone, calls.length);
          });
        }, 
        function() {
          if (end == calls.length) {
            callback();
          }
          else {
            iterateOverCalls(start + 100, end + 100);
          }
        }
      );
    }

    var _this = this;
    for (let word of this.wordList) {
      calls.push(function(report) {
        _this.getWord(word.name, (err, file) => {
          if (err) {
            console.error(err);
            report(err);
            return;
          }
          else {
            word.aliases = parseFile(file);
          }
          report(); // for the progCallback
        });
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
        console.error(e);
        return [];
      }
      // split by comma and take off hanging spaces
      let res = aliasRes.split(aliasRes.indexOf(';') != -1 ? ";" : ',').map(str => str.trim());
      for (var al of res) { 
        if (!aliases.has(al)) {
          aliases.add(al);
        }
        else {
          /* We need to add both aliases to the case sensitive set, because they only 
           * differ in case
           */
          _this.caseSensitiveAliases.add(al);
          _this.caseSensitiveAliases.add(aliases.index(al));
        }
      }
      return res; //.filter((item, pos) => {return res.indexOf(item) == pos;});
    }
    iterateOverCalls();
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