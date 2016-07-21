// WordTesterScript.js//

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
  var reg = new RegExp('[\\W\\s]' + word + '[\\W\\s]', 'i');
  return reg.test(chapterString);
}

function testWords(wordList, chapterString) {
  var returnList = [];
  for (var word of wordList) {
    var isFound = false;
    for (var alias of word.aliases) {
      if (alias)
      if (testWord(alias, chapterString)) {
        isFound = true;
        break;
      }
    }
    if (isFound) {
      returnList.push(word.name);
    }
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
  return wordListInBook;
}

module.exports = testBook;
