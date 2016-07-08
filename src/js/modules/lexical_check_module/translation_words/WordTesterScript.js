//WordTesterScript.js//

function concatenateChapterIntoString(chapterData) {
	var chapterString = "";
	for (var verse of chapterData.verses) {
		chapterString += verse.text;
	}
	return chapterString;
}

function testWord(word, chapterString) {
	var word = word.replace('.md', '');
	//console.log('Word: ' + word);
	var reg = new RegExp(word, 'i');
	var returnValue = reg.test(chapterString);
	return returnValue;
}

function testWords(wordList, chapterString) {
	var returnList = [];
	for (var word of wordList) {
		if (testWord(word, chapterString)) {
			returnList.push(word);
		}
	}
	return returnList;
}

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