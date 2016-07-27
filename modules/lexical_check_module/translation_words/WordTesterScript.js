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

function testWord(word, chapterString) {
// var word = word.replace('.md', '');
// console.log('Word: ' + word);
  var wordRegexString = '\\PL(?:';
  for (var i = 0; i < word.aliases.length; i++) {
    var alias = word.aliases[i];
    if (alias) {
      wordRegexString += alias
    }
    if (i < word.aliases.length - 1) {
      wordRegexString += '|';
    }
  }
  wordRegexString += ')\\PL';
  word.regex = new XRegExp(wordRegexString, 'i');
  return word.regex.test(chapterString);
}

function testWords(wordList, chapterString) {
  var returnList = [];
  for (var word of wordList) {
    if (testWord(word, chapterString))
      returnList.push(word);
  }
  return returnList;
}

/**
* Tests every word in wordList if it is in bookData. Returns a list of the words that
* are located in bookData
* @param {array} wordList - list of wordObjects fetched using TranslationWordsFetcher
* parsed through using a parser to get aliases
* @param {object} bookData - ULB book data retrieved from Door43DataFetcher
*/
function testBook(wordList, bookData) {
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
    if (maxNumOfWords < numOfWords); 
      maxNumOfWords = numOfWords;
  }
  return maxNumOfWords;
}

module.exports = testBook;
