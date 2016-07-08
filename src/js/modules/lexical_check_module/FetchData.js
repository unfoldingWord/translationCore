//FetchData.js//

/**
 * @description: This file defines the function that 
 * fetches the data and populates a list of checks
 * @author Samuel Faulkner
 */

//user imports
const TranslationWordsScraper = require('./translation_words/TranslationWordsScraper');
const UnlockedLiteralBibleFetcher = require('./translation_words/UnlockedLiteralBibleFetcher');
const USFMParser = require('./translation_words/USFMParse.js');

//english constants
const ULB_FAILURE = "Failed to fetch the ULB-en";
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
	var returnData = {};
	//Get the list of words from translationWords
	var tWScraper = new TranslationWordsScraper();
	var wordList = null;
	//get the wordList
	tWScraper.getWordList(null,
		
		//assigncallback
		function(list) {
			wordList = list;

			var ULB = null;
			getULB(
				function(error, ulbFetcher) {
					//getULB failed with an error
					if (error) {
						//call our own callback function with an error
						callback(error, null);
					}
					var ufsmString = ulbFetcher.getBookUSFM(bookAbbr);
					var bookData = USFMParser(ufsmString);
					bookData.bookAbbr = bookAbbr;
					findWords(
						turnIntoArray(wordList),
						bookData,
						progressCallback,
						callback
					);
				}
			);
		},

		//errorcallback
		function(err) {
			//err isn't null, 2nd argument is because we shouldn't assign anything
			callback(err, null);
		}
	);
}

/**
 * @description Function that serves to fetch the ULB from the internet
 * @param {function} callback - callback called with (error, ulbFetcher)
 */
function getULB(callback) {
	var ulbFetcher = new UnlockedLiteralBibleFetcher();
	ulbFetcher.getULBFile(
		// assignCallback
		function() {
			callback(null, ulbFetcher)
		},
		//errorCallback
		function() {
			callback(ULB_FAILURE)
		}
	);
}

/** 
 * @description Function that runs WebWorker scripts in order to
 * find all occurences of words within the book of the bible
 */
function findWords(wordList, bookData, progressCallback, callback) {
	var testFunction = require('./translation_words/WordTesterScript.js')
	var wordListInBook = testFunction(wordList, bookData);
	console.log('WordList: ');
	console.dir(wordListInBook);
	// const PARALLEL_WEB_WORKERS = 3;
	// // var maxWords = wordList.length;
	// var maxWords = 10;
	// var finishedWords = 0;
	// var currentWordIndex = 0;
	// var workers = [];
	// var returnValue = {"LexicalCheck": []};

	// function workerMessage(e) {
	// 	++finishedWords;
	// 	progressCallback(finishedWords, maxWords);

	// 	returnValue.LexicalCheck.push({
	// 		"group": e.data.word,
	// 		"checks": e.data.checks
	// 	});

	// 	//remove this worker from the workerlist
	// 	removeItem(workers, this);
	// 	startNewWorker();
	// }

	// function startNewWorker() {
	// 	console.log('CurrentWordIndex: ' + currentWordIndex);
	// 	console.log('MaxWord: ' + maxWords);
	// 	if (currentWordIndex < maxWords) {
	// 		var newWorker = new Worker("src/js/modules/lexical_check_module/" + 
	// 			"translation_words/TranslationWordsWorkerScript.js");
	// 		var currentWord = wordList[currentWordIndex++];
	// 		newWorker.postMessage({"book": bookData, "word": currentWord});
	// 		newWorker.onmessage = workerMessage;
	// 		workers.push(newWorker);
	// 	}
	// 	else {
	// 		console.log('Done with worker');
	// 		console.log('Workers remaing: ' + workers.length);
	// 		//sanity check
	// 		if (workers.length <= 0) {
	// 			//assign the return value using the callback
	// 			callback(null, returnValue);
	// 		}
	// 	}
	// }

	// for (var i = 0; i < PARALLEL_WEB_WORKERS; i++) {
	// 	startNewWorker();
	// }
}

/**
 * @description Turns a JSON object into an array of its keys
 * @param {object} obj - json object to be turned into an array
 */
function turnIntoArray(obj) {
	var returnValue = [];
	for (var item in obj) {
		returnValue.push(item);
	}
	return returnValue;
}

 /**
  * @description Removes a specific item from an array
  * @param {array} list - the array for an item to be found and removed
  * @param {array.type} itme - the item to be removed
  */
function removeItem(list, obj) {
	console.log('Querying remove');
	for (var i = 0; i < list; i++) {
		if (list[i] === obj) {
			console.log('Removing obj');
			list.splice(i, 1);
		}
	}
}

module.exports = getData;