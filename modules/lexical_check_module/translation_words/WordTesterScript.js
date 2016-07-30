// WordTesterScript.js//

var natural = require('natural');
var XRegExp = require('xregexp');
var nonUnicodeLetter = XRegExp('\\PL');

//Wordlength tokenizer
const tokenizer = new natural.RegexpTokenizer({pattern: nonUnicodeLetter});

/**
* @description - These functions are used to see which words in wordList are in
* bookData. {@link testBook}
*/

function concatenateChapterIntoString(chapterData) {
  var chapterString = "";
  for (var verse of chapterData.verses) {
    chapterString += verse.text;
  }
  return chapterString;
}

/**
 * @description - Tests if a word is in a single chapter by using a regex with all of
 * it's aliases
 * @param {object} word - a object contructed from TranslationWordsFetcher, with several fields,
 * including 'aliases'
 * @param {string} chapterString - a single string that has an entire chapter concatenated into it
 * @param {set} caseSensitiveAliases - a set containing aliases that need their regexes to be
 * case sensitive
 */
function testWord(word, chapterString, caseSensitiveAliases) {

  // var regexes = [];
  // for (var alias of word.aliases) {
  //   regexes.push(new XRegExp('(?=\\PL|\\b)(?:' + alias + ')(?=\\PL|\\b)',
  //     caseSensitiveAliases.has(alias) ? '' : 'i'));
  // }

  //Create an array of regexes that preserves the sorted order while still accounting for
  // case sensitive and case insensitive requirements
  var regexStrings = [];
  for (var alias of word.aliases) {
    var currentRegexStringArray = regexStrings[regexStrings.length - 1];
    if (currentRegexStringArray) {
      var lastAlias = currentRegexStringArray[currentRegexStringArray.length - 1];
      if (lastAlias && ((caseSensitiveAliases.has(lastAlias)) == (caseSensitiveAliases.has(alias)))) {
        currentRegexStringArray.push(alias);
      }
      else {
        regexStrings.push([alias]);
      }
    }
    else {
      regexStrings.push([alias]);
    }
  }

  var regexes = [];
  for (var regexStringArray of regexStrings) {
    regexes.push(new XRegExp(constructRegexString(regexStringArray), 
      isCaseSensitive(regexStringArray, caseSensitiveAliases) ? '' : 'i'));
  }

  word.regex = regexes;
  for (var regex of word.regex) {
    if (regex.test(chapterString)) {
      return true;
    }
  }
  return false;
}

function isCaseSensitive(stringArray, caseSensitiveAliases) {
  return caseSensitiveAliases.has(stringArray[stringArray.length - 1]);
}

function constructRegexString(arrayOfWords) {
  var wordRegexString = '(?=\\b|\\PL)(?:';
  for (var i = 0; i < arrayOfWords.length; i++) {
    var word = arrayOfWords[i];
    if (word) {
      wordRegexString += word
    }
    if (i < arrayOfWords.length - 1) {
      wordRegexString += '|';
    }
  }
  wordRegexString += ')(?=\\b|\\PL)';
  return wordRegexString;
}

function testWords(wordList, chapterString, caseSensitiveAliases) {
  var returnList = [];
  for (var word of wordList) {
    if (testWord(word, chapterString, caseSensitiveAliases))
      returnList.push(word);
  }
  return returnList;
}

function sortAliases(wordList) {
  for (var word of wordList) {
    word.header = word.aliases[0];
    /* Sort the aliases by how many words are in their alias, so that we
     * search by the largest alias first
     */
    word.aliases.sort(function(first, second) {
      return tokenizer.tokenize(second).length - tokenizer.tokenize(first).length;
    });
  }
}

/**
* Tests every word in wordList if it is in bookData. Returns a list of the words that
* are located in bookData
* @param {array} wordList - list of wordObjects fetched using TranslationWordsFetcher
* parsed through using a parser to get aliases
* @param {object} bookData - ULB book data retrieved from Door43DataFetcher
*/
function testBook(wordList, bookData, caseSensitiveAliases) {
  sortAliases(wordList);
  var wordListInBook = new Set();
  for (var chapter of bookData.chapters) {
    var chapterString = concatenateChapterIntoString(chapter);
    for (var word of testWords(wordList, chapterString, caseSensitiveAliases)) {
      wordListInBook.add(word);
    }
  }
  var actualArray = Array.from(wordListInBook).sort(function(first, second) {
    return getMaxNumOfWordsInAliases(second) - getMaxNumOfWordsInAliases(first);
  });
  return actualArray;
}

function getMaxNumOfWordsInAliases(wordObject) {
  var maxNumOfWords = 0;
  for (var alias of wordObject.aliases) {
    var numOfWords = tokenizer.tokenize(alias).length;
    if (maxNumOfWords < numOfWords) {
      maxNumOfWords = numOfWords;
    }
  }
  return maxNumOfWords;
}

module.exports = testBook;
