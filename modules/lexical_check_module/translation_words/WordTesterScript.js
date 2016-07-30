// WordTesterScript.js//

var natural = require('natural');
var XRegExp = require('xregexp');
var nonUnicodeLetter = XRegExp('\\PL');

//Wordlength tokenizer
const tokenizer = new natural.RegexpTokenizer({pattern: nonUnicodeLetter});

/**
 * The functions in this file are used to see which words in wordList are in
 * bookData. {@link testBook}
 */

/**
 * @description - Concatenates all the verses found in the given parameter into a long string
 * to reduce the number of inner loops
 * @param {object} chapterData - object generated for each chapter from Door43DataFetcher
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
 * @param {object} word - a object contructed from TranslationWordsFetcher
 * @param {string} chapterString - a single string that has an entire chapter concatenated into it
 */
function testWord(word, chapterString) {
  for (var regex of word.regex) {
    if (regex.test(chapterString)) {
      return true;
    }
  }
  return false;
}

/**
 * @description - Constructs regexes according to each alias from each word. These regexes will
 * be used a few more times throughout the processing of the data to generate the checks associated
 * with the LexicalCheck
 * @param {array} wordList - array of word objects that contain several fields, primarily aliases for
 * this method
 * @param {Set} caseSensitiveAliases - set of aliases that have been marked as case sensitive. 
 * Regexes that are constructed containing aliases that are in this set don't have the 'i' flag
 */
function constructRegexes(wordList, caseSensitiveAliases) {
  for (var word of wordList) {
    //Create an array of regexes that preserves the sorted order while still accounting for
    // case sensitive and case insensitive requirements. This is lengthy in order to only create the 
    // smallest number of regexes needed
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
  }
}

/**
 * @description - Tests if an array contains case sensitive aliases by looking at the last
 * element in the array
 * @param {array} stringArray - Array of aliases all of which should either be case sensitive or
 * case insensitive, although this is assumed and there is no checking for that in this method
 * @param {Set} caseSensitiveAliases - A set containing all the aliases that should be case
 * sensitive
 */
function isCaseSensitive(stringArray, caseSensitiveAliases) {
  return caseSensitiveAliases.has(stringArray[stringArray.length - 1]);
}

/**
 * @description - Constructs a single string from an array of words using an alternating
 * non capture group. Also places word boundaries on either side of the group to be used with 
 * capturing words and phrases. The returned string is meant to be used in the constructor of a 
 * regular expression
 * @param {array} arrayOfWords - Words that will be placed within the alternating non capture
 * group
 */
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

/**
 * @description - This tests all the words in wordList against a single chapter string
 * @param {array} wordList - array of word objects to test with
 * @param {string} chapterString - string of an entire chapter of a book of the Bible at a time.
 * @param {Set} caseSensitiveAliases - a set containing aliases that should be case sensitive. 
 * since no regexes are generated here this parameter is just passed to {@link testWord}
 */
function testWords(wordList, chapterString) {
  var returnList = [];
  for (var word of wordList) {
    if (testWord(word, chapterString))
      returnList.push(word);
  }
  return returnList;
}

/**
 * @description - Sorts the 'aliases' field of each object in the given wordList
 * @param {array} wordList - array of word objects that contain several fields, specifically
 * the 'aliases' field for this method. That field should be an array of found aliases from 
 * TranslationWordsFetcher
 */
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
  constructRegexes(wordList, caseSensitiveAliases);
  var wordListInBook = new Set();
  for (var chapter of bookData.chapters) {
    var chapterString = concatenateChapterIntoString(chapter);
    for (var word of testWords(wordList, chapterString)) {
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
