//FetchData.js//

/**
 * @description: This file defines the function that 
 * fetches the data and populates a list of checks
 * @author Samuel Faulkner
 */

//User imports
const Door43DataFetcher = require('./../translation_notes/Door43DataFetcher.js');
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
function getData(bookAbbr, progressCallback, callback) {
	//Get Bible
	var bookData;
	var Door43Fetcher = new Door43DataFetcher();
	Door43Fetcher.getBook(bookAbbr, progressCallback, function(error, data) {
		if (error) {
			console.log('Door43Fetcher throwing error');
			callback(error);
		}
		else {
			bookData = Door43Fetcher.getULBFromBook(data);
			console.dir(bookData);
			//Get list of words
			var tWFetcher = new TranslationWordsFetcher();
			var wordList;
			tWFetcher.getWordList(undefined, 
				function(error, data) {
					if (error) {
						console.log('TWFetcher throwing error');
						callback(error);
					}
					else {
						wordList = data;
						//for word in wordList get aliases
						for (var wordObject of wordList) {
							wordObject['aliases'] = [wordObject.name.replace('.txt', '')];
						}

						var actualWordList = BookWordTest(wordList, bookData);
						callback(null, actualWordList);
					}
				})
		}
	});

	
	//get full list of words through out word files
	//get all the words in that book
	//search through entire book for each occurence of each word
	//return big javascript object
}

module.exports = getData;