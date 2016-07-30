// FetchData.js//

/**
* @description: This file defines the function that
* fetches the data and populates a list of checks
* @author Sam Faulkner
*/

const api = window.ModuleApi;

//node modules
const XRegExp = require('xregexp');
const natural = require('natural');
const tokenizer = new natural.RegexpTokenizer({pattern: new XRegExp('\\PL')});

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
              var actualWordList = BookWordTest(tWFetcher.wordList, bookData, 
                tWFetcher.caseSensitiveAliases);
              var mappedBook = mapVerses(bookData);
            
              // var checkObject = findWordsInBook(bookData, actualWordList);
              var checkObject = findWords(bookData, mappedBook, actualWordList);
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
 * @description - This creates an object from a string, in this case it'll always be a verse.
 * The object's keys are the indices of each word found in the string. The keys' values are objects
 * that contain the word, and a 'marked' boolean
 * @param {string} verse - a verse that can be tokenized to create the object
 */
function mapVerseToObject(verse) {  
  var words = tokenizer.tokenize(verse),
    returnObject = {},
    currentText = verse,
    currentIndex = 0;
  for (var word of words) {
    var index = currentText.indexOf(word);
    /* currentIndex is used to keep track of where we are in the whole verse, because the slicing 
     * returns an invalid index within the context of the entire verse
     */
    currentIndex += index;
    returnObject[currentIndex] = {'word': word, 'marked': false};
    currentIndex += word.length;
    currentText = verse.slice(currentIndex);
  }
  return returnObject;
}

/**
 * @description = This finds a specific word from wordObject within the given verse. 
 * It then will create a new check object when a valid word is found and push it onto 
 * an array which is returned
 * @param {int} chapterNumber - an integer indicating the current chapter so that it can be
 * added to the check object once a check object is created
 * @param {object} verseObject - an object with two fields: 'num' which is an int indicating
 * the verse number within the current chapter, and 'text' which is a string holding the actual text
 * of the verse
 * @param {object} mappedVerseObject - This is an object containing index keys to the individual words
 * of the verse. See {@link mapVerseToObject}
 * @param {object} wordObject - This is an object containing various fields about the word we're 
 * currently searching for, primary key for this methods are the wordObject's regexes
 */
function findWordInVerse(chapterNumber, verseObject, mappedVerseObject, wordObject) {
  var checkArray = []
  var sortOrder = 0;
  for (var regex of wordObject.regex) {
    var match = verseObject.text.match(regex);
    while(match) {
      if (!checkIfWordsAreMarked(match, mappedVerseObject)) {
        checkArray.push({
          "chapter": chapterNumber,
          "verse": verseObject.num,
          "checkStatus": "UNCHECKED",
          "sortOrder": sortOrder++,
          "word": match[0],
          "index": match.index,
        });
      }
      match = stringMatch(verseObject.text, regex, match.index + incrementIndexByWord(match));
    }
  }
  return checkArray;
}

/**
 * @description - This function will tokenize the matched string from the given match and return the length of 
 * the length of first word in the match
 * @param {object} match - the object returned from a string.match(regexp) method call
 */
function incrementIndexByWord(match) {
  if (!match) {
    console.error("Can't increment an index with an invalid match!");
    return 0;
  }
  var string = match[0];
  var words = tokenizer.tokenize(string);
  return words[0].length;
}

/**
 * @description - Does a string.match method for the given regex but only returns the first match
 * who's index is > the given index. Also supports regexes with alternating groups that might have 
 * sub matches within the string, which is an edge case but definitely occurs in the Lexical Check
 * @param {string} string - the string to match against
 * @param {XRegExp or RegExp} - the regex that the string will be matched with
 * @param {int} index - an integer indicator to only return a match if the match's index if > this 
 * indicator
 */
function stringMatch(string, regex, index) {
  var match = string.match(regex);
  var lastIndex = 0;
  while (match && match.index < index) {
    lastIndex = match.index + incrementIndexByWord(match);
    match = string.slice(lastIndex).match(regex);
    if (match) {
      match.index += lastIndex;
    }
  }
  return match;
}

/**
 * @description - This method checks to see if any of the words contained in the match
 * have already been 'marked' within the given verse object
 * @param {object} match - match that is returned from string.match(XRegExp) or string.match(RegExp)
 * @param {object} verseObject - a mapped verse object that contains index keys to individual words
 * of a verse. See {@link mapVerseToObject}
 */
function checkIfWordsAreMarked(match, verseObject) {
  var matchedWords = tokenizer.tokenize(match[0]);
  var indexes = [];
  for (var word of matchedWords) {
    indexes.push(match.index + match[0].indexOf(word));
  }
  var matchedWordObjects = [];
  for (var index of indexes) {
    if (verseObject[index]) {
      if (verseObject[index].marked) {
        return true;
      }
      else {
        matchedWordObjects.push(verseObject[index]);
      }
    }
    else {
      console.error("Can't find index: " + index + " in verseObject");
      console.dir(verseObject);
    }
  }
  for (var matchedObject of matchedWordObjects) {
    matchedObject.marked = true;
  }
  return false;
}

/**
 * @description - This takes the data from a book of the Bible returned by 
 * Door43DataFetcher and returns an array of arrays containing mappedVerseObjects for
 * each verse for each chapter. See {@link mapVerseToObject}
 * @param {object} - the data from downloading a book returned by Door43DataFetcher
 */
function mapVerses(bookData) {
  var mapVerse = [];
  for (var chapter of bookData.chapters) {
    var chapterMap = [];
    for (var verse of chapter.verses) {
      chapterMap[verse.num] = mapVerseToObject(verse.text);
    }
    mapVerse[chapter.num] = chapterMap;
  }
  return mapVerse;
}


/**
 * @description - This does a {@link findWordInVerse} for every word given in wordList and returns
 * the list of checks for the LexicalChecker
 * @param {object} bookData - This is the data returned by Door43DataFetcher after downloading
 * an entire book of the Bible
 * @param {array} mapBook - This is the array containing arrays of mappedVerses. See {@link mapVerses}
 * @param {array} wordList - list of objects containing all the necessary data to look for words 
 * in the book data. This list should be a filtered list from the entire translationWords list as 
 * this method has many inner loops 
 */
function findWords(bookData, mapBook, wordList) {
  var returnObject = {};
  returnObject['LexicalChecker'] = [];

  for (var word of wordList) {
    var wordReturnObject = {
      "group": word.name,
      "checks": []
    };
    for (var chapter of bookData.chapters) {
      for (var verse of chapter.verses) {
        for (var item of findWordInVerse(chapter.num, verse, 
          mapBook[chapter.num][verse.num], word)) {
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
      if (first.verse != second.verse) {
        return first.verse - second.verse;
      }
      return first.sortOrder - second.sortOrder;
    });
    returnObject.LexicalChecker.push(wordReturnObject);
  }
  return returnObject;
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