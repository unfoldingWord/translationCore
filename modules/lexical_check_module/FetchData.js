// FetchData.js//

/**
* @description: This file defines the function that
* fetches the data and populates a list of checks
* @author Sam Faulkner
*/

const api = window.ModuleApi;

// User imports
const Door43DataFetcher = require('./Door43DataFetcher.js');
const TranslationWordsFetcher = require('./translation_words/TranslationWordsFetcher.js');
const BookWordTest = require('./translation_words/WordTesterScript.js');

/**
* @description exported function that returns the JSON array of a list
* of checks
* @param {string} bookAbr - 3 letter abbreviation used by git.door43.org to denote books of Bible
* @param {function} progressCallback - callback that gets called during
* the fetch, with params (itemsDone/maxItems)
* @param {function} callback - callback that gets called when function is finished,
* if error ocurred it's called with an error, 2nd argument carries the result
*/
function getData(params, progressCallback, callback) {
// Get Bible
  var bookData;
  var Door43Fetcher = new Door43DataFetcher();

  function parseDataFromBook(bookData) {
    var tWFetcher = new TranslationWordsFetcher();
    var wordList;
    tWFetcher.getWordList(undefined,
      function(error, data) {
        if (error) {
          console.error('TWFetcher throwing error');
          callback(error);
        }
        else {
          wordList = data;
          tWFetcher.getAliases(function(done, total) {
            progressCallback(((done / total) * 50) + 50);
          }, function(error) {
            if (error) {
              callback(error);
            }
            else {
              var actualWordList = BookWordTest(tWFetcher.wordList, bookData);
              var checkObject = findWordsInBook(bookData, actualWordList);
              checkObject.LexicalChecker.sort(function(first, second) {
                  return stringCompare(first.group, second.group);
              });
              
              api.putDataInCheckStore('LexicalChecker', 'book', 
                api.convertToFullBookName(params.bookAbbr));
              api.putDataInCheckStore('LexicalChecker', 'groups', checkObject['LexicalChecker']);
              api.putDataInCheckStore('LexicalChecker', 'currentCheckIndex', 0);
              api.putDataInCheckStore('LexicalChecker', 'currentGroupIndex', 0);
              api.putDataInCheckStore('LexicalChecker', 'wordList', wordList);
              //TODO: This shouldn't be put in the check store because we don't want this saved to disk
              api.putDataInCheckStore('LexicalChecker', 'menu', require('./MenuView'));
              callback(null);
            }
          });
        }
      });
  }

  Door43Fetcher.getBook(params.bookAbbr, function(done, total) {
    progressCallback((done / total) * 50);}, function(error, data) {
      if (error) {
        console.error('Door43Fetcher throwing error');
        callback(error);
      }
      else {
        var gatewayLanguage = api.getDataFromCommon('gatewayLanguage');
        var bookData;
        /*
         * we found the gatewayLanguage already loaded, now we must convert it
         * to the format needed by the parsers
         */
        if (gatewayLanguage) {
          var reformattedBookData = {chapters: []};
          for (var chapter in gatewayLanguage) {
            var chapterObject = {
              verses: [],
              num: parseInt(chapter)
            }
            for (var verse in gatewayLanguage[chapter]) {
              var verseObject = {
                num: parseInt(verse),
                text: gatewayLanguage[chapter][verse]
              }
              chapterObject.verses.push(verseObject);
            }
            chapterObject.verses.sort(function(first, second) {
              return first.num - second.num;
            });
            reformattedBookData.chapters.push(chapterObject);
          }
          reformattedBookData.chapters.sort(function(first, second) {
            return first.num - second.num;
          });
          parseDataFromBook(reformattedBookData);
        }
        // We need to load the data, and then reformat it for the store and store it
        else {
          bookData = Door43Fetcher.getULBFromBook(data);
          //reformat
          var newBookData = {};
          for (var chapter of bookData.chapters) {
            newBookData[chapter.num] = {};
            for (var verse of chapter.verses) {
              newBookData[chapter.num][verse.num] = verse.text;
            }
          }
          newBookData.title = api.convertToFullBookName(params.bookAbbr);
          //load it into checkstore
          api.putDataInCommon('gatewayLanguage', newBookData);
          //resume fetchData
          parseDataFromBook(bookData);
        }
      }
    }
  );
}


/**
* Outputs a JSON object in the format defined by what 'FetchData.js' should output
*/
function findWordsInBook(bookData, actualWordList) {
  var returnObject = {};
  returnObject['LexicalChecker'] = [];
  //sort the set of words by how long their aliases are
  for (var word of actualWordList) {
    var wordReturnObject = {
      "group": word.name,
      "checks": []
    };
    for (var chapter of bookData.chapters) {
      for (var verse of chapter.verses) {
        var wordArray = findWordInBook(chapter.num, verse, word);
        for (var item of wordArray) {
          wordReturnObject.checks.push(item);
        }
      }
    }
    if (wordReturnObject.checks.length <= 0) {
      continue;
    }
    wordReturnObject.checks.sort(function(first, second) {
      if (first.chapter != second.chapter) {
          return first.chapter - second.chapter;
      }
      return first.verse - second.verse;
    });
    returnObject.LexicalChecker.push(wordReturnObject);
  }
  return returnObject;
}

function findWordInBook(chapterNumber, verseObject, wordObject) {
  var returnArray = [];
  var wordRegex = wordObject.regex;
  var currentText = verseObject.text;
  var index = currentText.search(wordRegex);
  while (index != -1) {
    returnArray.push({
      "chapter": chapterNumber,
      "verse": verseObject.num,
      "checkStatus": "UNCHECKED"
    });
    currentText = currentText.replace(wordRegex, ' ');
    index = currentText.search(wordRegex);
  }
  verseObject.text = currentText;
  return returnArray;
}


/**
 * @description - Used to sort the set of words by max number of words within all of their aliases
 * @param {set} wordSet - set of words, but it contains the title of the tW file. like falsegod.txt
 * @param {array} wordList - array of word objects. Each object contains word, link, file, and aliases
 * @return {array} - Returns an array of wordObjects sorted described as above
 */
function sortWordSet(wordSet, wordList) {
  var returnArray = [];
  for (var word of wordSet) {
    var wordObject = search(wordList, function(item) {
      return stringCompare(word, item.name);
    });
    if (wordObject) {
      returnArray.push(wordObject);
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

module.exports = getData;
