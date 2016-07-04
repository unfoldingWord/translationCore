
var BASE_LINK = "https://git.door43.org/";
var TW_LINK = "Door43/tw-en/src/master/01";

//TranslationWordsScraper.js//

class TranslationWordsScraper {
	constructor () {
		this.wordList = null;
		this.link = null;
	}

	getLink() {
		return this.link;
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
				errorCallback();
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
		var request = new XMLHttpRequest();
		

		var _this = this;
		request.onload = function() {
			_this.wordList = getItemsBehindLink(this.response);
			if (assignCallback) {
				assignCallback(_this.wordList);
			}
		}

		request.onerror = function() {
			if (errorCallback) {
				errorCallback();
			}
			else {
				console.error('GetWordList failed');	
			}
		}

		var url = link || BASE_LINK + TW_LINK;	
		this.link = url;
		request.open('get', url, true);
		request.send();
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