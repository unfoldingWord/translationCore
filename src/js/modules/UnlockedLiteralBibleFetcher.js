// UnlockedLiteralBibleFetcher.js //

/**
 * @description: This fetches the UnlockedBible from unfoldingWord's 
 	github repository. Kind of hardcoded and might need to be refactored later
 */

//Http constants
//hardcoded for the english version right now
const UNFOLDING_WORD_BASE_URL = 'https://api.github.com/orgs/unfoldingWord/repos',
	ULB_IDENTIFIER = 'ulb-en';

const request = require('request');
const fs = require(window.__base + '/node_modules/fs-extra');
const AdmZip = require('adm-zip');
const http = require('http');
const url = require('url');

class UnlockedLiteralBibleFetcher {
	constructor() {

	}

	ulbZipFile = null

	getZipFile(zipURL, assignCallback, errorCallback) {

		var options = {
		    host: url.parse(zipURL).host,
		    port: 80,
		    path: url.parse(zipURL).pathname
		};
		console.log('ZipURL: ' + zipURL);
		console.log('Path: ' + options.path);
		http.get(options, 
			function(res) {
			    var data = [], dataLen = 0; 

			    res.on('data', 
			    	function(chunk) {

				            data.push(chunk);
				            dataLen += chunk.length;

			        }
			    ).on('end', 
			    	function() {
				        var buf = new Buffer(dataLen);

			            for (var i=0, len = data.length, pos = 0; i < len; i++) { 
			                data[i].copy(buf, pos); 
			                pos += data[i].length; 
			            } 

			            var zip = new AdmZip(buf);
			            this.ulbZipFile = zip;
    
				    }
			    );
		    }
		);
	}

	saveZipFile(path) {
		this.ulbZipFile.writeZip(path);
	}

	getZipURL(repoObject, assignCallback, errorCallback) { /* Retrieves the information 
															from github using the github api
															*/
		var releasesURL = repoObject.releases_url;
		//the URL has a {/id} at the end of it, so remove it
		releasesURL = releasesURL.replace('{/id}', '');
		
		var request = new XMLHttpRequest();

		var _this = this;
		var releasesObject;
		request.onload = function() {
			releasesObject = JSON.parse(this.response);

			//Get the latest released version. This assumes the version with the
			// biggest ID is the newest
			var releaseID = 0;
			var zipURL = null;
			for (var i = 0; i < releasesObject.length; i++) {
				var object = releasesObject[i];
				if (object.id > releaseID) {
					releaseID = object.id;
					zipURL = object.zipball_url;
				}
			}

			//_this.getZipFile(zipURL, assignCallback, errorCallback);
			if (assignCallback) {
				assignCallback(zipURL);
			}
		}

		request.onerror = function() {
			if (errorCallback) {
				errorCallback();
			}
		}

		console.log('Releases_URL: ' + releasesURL);
		request.open('get', releasesURL, true);
		request.send();
	}

	getRepo(assignCallback, errorCallback) {
		var request = new XMLHttpRequest();

		var repos;
		var bibleRepo;

		var _this = this;

		request.onload = function() {
			repos = JSON.parse(this.response);
			
			for (var i = 0; i < repos.length; i++) {
				var repo = repos[i];
				if (repo.name && repo.name == 'ulb-en') {
					bibleRepo = repo;
					break;
				}
			}
			if (assignCallback) {
				assignCallback(bibleRepo);
			}

		}

		request.onerror = function() {
			if (errorCallback) {
				errorCallback();
			}
		}

		var url = UNFOLDING_WORD_BASE_URL
		console.log('URL: ' + url);
		request.open('GET', url, true);
		request.send();
	}

	getULBFile(assignCallback, errorCallback) {
		var _this = this;
		this.getRepo(
			function(repo) { //getRepo's assignCallback
				_this.getZipURL(repo, 
					function(zipURL) { //getZipURL's assigncallback
						_this.getZipFile(zipURL,
							function(ulbFile) { //getZipFile's assigncallback
								if (assignCallback) {
									assignCallback(ulbFile);
								}
							},
							errorCallback
						);
					},
					errorCallback
				);
			},
			errorCallback
		);
	}
}

module.exports = UnlockedLiteralBibleFetcher;