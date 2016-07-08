//TranslationWordsFetcher.js//

/**
 * @description - Grabs a list of tW and then
 * returns individual files when queried
 * @author Samuel Faulkner
 */

const GITHUB_API_URL = "https://api.github.com/repos/Door43/d43-en/contents/obe?ref=master",
	REQUEST_FAILED = "Request failed";

class TranslationWordsFetcher {
	constructor() {
		this.wordList = null;
	}

	/**
	 * @description - Grabs the list of word using github api calls
	 * @param {string} url - optional url parameter to point the api call
	 * defaults to the constant
	 * @param {function} callback - Callback that is called with (error, list)
	 */
	getWordList(url, callback= () => ({})) {
		var link = url || GITHUB_API_URL;

		var request = new XMLHttpRequest();
		var _this = this;
		var totalFiles = 0;
		var currentFiles = 0;
		request.onload = function() {
			//get the list of files within the directory
			let directoryList = JSON.parse(this.response);
			
			for (let file of directoryList) {
				if (file.type == "dir") {
					totalFiles += directoryList.length;
					_this.getWordList(file.url, callback);
				}

				//this makes sure we don't get those files in the top directory that we don't want
				else if (file.type == "file" && url != GITHUB_API_URL) {
					_this.wordList.push(file.name);
					currentFiles++;
					if (currentFiles >= totalFiles) {
						callback(null, _this.wordList);
					}
				}
			}
		}

		request.onerror = function() {
			callback(REQUEST_FAILED);
		}

		request.open('get', link, true);
		request.send();
	}
}

module.exports = TranslationWordsFetcher;