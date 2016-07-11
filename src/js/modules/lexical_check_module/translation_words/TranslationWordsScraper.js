//TranslationWordsScraper.js//

// Node module imports
const Fs = require(window.__base + '/node_modules/fs-extra');

//hardcoded URLS
const BASE_LINK = "https://git.door43.org/";
const TW_LINK = "Door43/tw-en/src/master/01";
//hard coded path
const FILEPATH = "./tw_word_list.json";

//Hard coded strings
const FAILURE = "Fetching translationWords failed";



class TranslationWordsScraper {
	constructor () {
		this.wordList = null;
		this.link = null;
	}

	getLink() {
		return this.link;
	}

	/** @description - This is mainly for debugging purposes so that 
	 * I don't have to download the list every time
	 */
	saveWordList(path=FILEPATH) {
		if (this.wordList) {
			Fs.outputJson(path, this.wordList, 
				function(error) {
					if (error) {
						console.error(error);
					}
				}
			);
		}
	}

	getWord(key, assignCallback, errorCallback) {
		if (!this.wordList) {
			return;
		}
		if (this.wordList[key]['file']) {
			console.log('assigning');
			if (assignCallback) {
				assignCallback(this.wordList[key]['file']);
			}
		}
		else {
		var request = new XMLHttpRequest();
		var _this = this;
		request.onload = function() {
			var link = _this.wordList[key].replace('src', 'raw');
			_this.wordList[key] = {
				"link": link,
				"file": this.response //this refers to XMLHttpRequest
			}
			if (assignCallback) {
				assignCallback(this.response); //pass the file to the callback
			}
		}

		request.onerror = function() {
			if (errorCallback) {
				errorCallback('GetWordList failed');
			}
			else {
				console.error('GetWordList failed');	
			}
		}

		var url = BASE_LINK + this.wordList[key];
		url = url.replace('src', 'raw');
		console.log('URL: ' + url);
		request.open('get', url, true);
		request.send();
		}
	}

	getWordList(link, assignCallback, errorCallback) {
		console.log('Retrieving list');
		var request = new XMLHttpRequest();

		// Fs.ensureFileSync(FILEPATH);
		// //See if we saved it first. Mostly for debugging purposes
		// this.wordList = Fs.readJsonSync(FILEPATH, {throws: false});
		// if (this.wordList != null) {
		// 	if (assignCallback) {
		// 		assignCallback(this.wordList);
		// 	}
		// }
		// else {
			var _this = this;
			request.onload = function() {
				_this.wordList = getItemsBehindLink(this.response);
				//For fast debugging
				_this.saveWordList();
				if (assignCallback) {
					assignCallback(_this.wordList);
				}
			}

			request.onerror = function() {
				if (errorCallback) {
					errorCallback(FAILURE);
				}
				else {
					console.error(FAILURE);	
				}
			}

			var url = link || BASE_LINK + TW_LINK;	
			this.link = url;
			request.open('get', url, true);
			request.send();
		// }
	}
}

function getItemsBehindLink(htmlString) {
    
    var regex = new RegExp('<a href="([^"]+)">(\\w*\\.md)(?=</a>\\s*?</td>)', 'g'); /* nasty regex that matches links only 
											      with </td> tags behind them, which 
											      correspond to the links we want
											   */
    var returnValue = {};
    var matches = regex.exec(htmlString);
    while (matches != null) {
		returnValue[matches[2]] = matches[1]; /* assigns the attribute tag with link; 
						 ex. 'aaron.md': https://git.door43.org/Door43/tw-en/src/master/01/aaron.md
						 in the returnObject
					      */
		matches = regex.exec(htmlString);
    }
    return returnValue;
}

module.exports = TranslationWordsScraper;