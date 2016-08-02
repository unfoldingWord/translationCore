//Door43DataFetcher.js//

/**
 * @description - Grabs pages from the door43 github repository that
 * represents the most up-to-date information.
 * @author - Samuel Faulkner, Evan Wiederspan
 */
 // This file should probably be moved to a new location later
 const USFMParser = require('./USFMParse');
 // const TNParser = require("./tNParser");

 //hardcoded github api calls
 const GITHUB_API_NOTES = "https://api.github.com/repositories/23808509/contents/bible/notes",
 	INVALID_DATA = "Invalid Data",
 	INVALID_BOOK_ABBREVIATION = "Invalid book abbreviation",
 	REQUEST_FAILURE = "HttpRequest failed";

  const AUTHENTICATION = "access_token=" + require("./Authentication.js");

const suppress = true;

// ONLY USE getBook()
class Door43DataFetcher {
	contructor() {
		this.bookList = null;
	}

	/**
	 * @description - This queries all the chapters of the bible into a JSON object
	 * each with a key of the chapter name and value is the link to that specific chapter
	 * @param {string} url = This is the github api call the XMLHttpRequest will open
	 * @param {function} callback = This is the callback that will get called with (error, object)
	 */
	getBooks(url, callback= () => ({})) {
		var _this = this;
		var url = url || GITHUB_API_NOTES;
		var request = new XMLHttpRequest();

		/** Retrieves the bookAbbreviation and api link from
		 * the request
		 */
		function getChaptersFromObject(obj) {
			var bookList = {};
			for (var book of obj) {
				bookList[book.name] = book.url;
			}
			return bookList;
		}

		request.onload = function() {
			var obj = getJSONFromData(this);
			//Invalid response
			if (obj == null) {
				callback(INVALID_DATA);
			}
			else {
				var bookObj = getChaptersFromObject(obj);
				_this.bookList = bookObj;
				callback(null, bookObj);
			}
		}

		request.onerror = function() {
			callback(REQUEST_FAILURE);
		}

		request.open('GET', url + "?" + AUTHENTICATION, true);
		request.send();
	}

	/**
	 * @description: Downloads an entire book data from github
	 * @param {string} bookAbbr: three letter string that denotes the book
	 * @param {function} progress: progress callback that's
	 * called with (downloadedVerses, totalVerses)
	 * @param {function} callback: callback called with (error, bookObj)
	 */
	getBook(bookAbbr, progress, callback = () => ({})) {
		var _this = this;
		if (this.bookList && this.bookList[bookAbbr].chapters) {
			callback(null, this.bookList[bookAbbr]);
		}
		else {
			this.getBookData(bookAbbr,
                function(error, bookObj) {
				    _this.getBookDataCallback(error, bookObj, progress, callback);
                }
            );
		}
  }

    getBookDataCallback(error, bookObj, progress, callback) {
        if (error) {
            callback(error);
        }
        else {
            var totalVerses = 0;
            /* create a new array that we can push our chapter objects onto
             * then we can clear the github chapter objects once they're
             * all finished
             */
            var chapters = [];
            var doneChapters = 0;
            var totalChapters = bookObj['chapters'].length;

            function getChapterCallback(error, chapterObj) {
                if (error) {
                    callback(error);
                }
                else {
                    doneChapters++;
                    if (chapterObj) {
                        chapters.push(chapterObj);
                    }
                    //this should only be called after the last chapter
                    if (doneChapters >= totalChapters) {
                        //reassign github objects to our objects
                        bookObj['chapters'] = chapters;
                        totalVerses = this.countVerses(bookObj['chapters']);
                        var numVerses = 0;
                        for (let _chapter of bookObj['chapters']) {
                            let verses = [];
                            let totalChapterVerses = _chapter['verses'].length;
                            let numChapterVerses = 0;

                            function getVerseCallback(error, verseData) {
                                if (error) {
                                    callback(error);
                                }
                                else {
                                    verses.push(verseData);
                                    numVerses++;
                                    numChapterVerses++;
                                    progress(numVerses, totalVerses);
                                    if (numChapterVerses >= totalChapterVerses) {
                                        /**reassign the array of github objects to our
                                         * verse objects
                                         */
                                        _chapter['verses'] = verses;
                                    }

                                    //We're completely done!
                                    if (numVerses >= totalVerses) {
                                        callback(null, bookObj);
                                    }
                                }       
                            }

                            for (let verse of _chapter['verses']) {
                                //push our own verse obj that's created from
                                this.getVerse(verse, getVerseCallback);
                            }
                        }
                    }
                }
            }

            for (var chapter of bookObj['chapters']) {
                this.getChapter(chapter,
                    getChapterCallback.bind(this));
            }
        }
    }

	countVerses(chapterArray) {
		var totalVerses = 0;
		for (var chapter of chapterArray) {
			//assuming chapter['verses'] is an array
			totalVerses += chapter['verses'].length;
		}
		return totalVerses;
	}

	/**
	 * @description: Gets the initial book data using the github api link within this.bookList
	 * @param {string} bookAbbr: three letter string that denotes the book
	 * @param {function} callback: function that is called when method terminates
	 * with (error, bookData)
	 */
	getBookData(bookAbbr, callback= () => ({})) {
		var _this = this;

		if (!this.bookList) {
			//call this.getBooks
			this.getBooks(null,
				function(error, obj) {
					//if this.getBooks didn't have an error, call getBook again
					if (!error) {
						_this.getBookData(bookAbbr, callback);
					}
					else {
						callback(error);
					}
				}
			);
		}
		else {
			if (!(bookAbbr in this.bookList)) {
				callback(INVALID_BOOK_ABBREVIATION);
			}
			else {
				var link = this.bookList[bookAbbr];

				var request = new XMLHttpRequest();

				request.onload = function() {
					var bookLink = _this.bookList[bookAbbr];
					var chapterObj = getJSONFromData(this);
					if (!chapterObj) {
						callback(INVALID_DATA);
					}

					_this.bookList[bookAbbr] = {};
					_this.bookList[bookAbbr]['chapters'] = chapterObj;
					_this.bookList[bookAbbr]['link'] = bookLink;

					callback(null, _this.bookList[bookAbbr]);

				}

				request.onerror = function() {
					callback(REQUEST_FAILURE);
				}

				request.open('GET', link + "&" + AUTHENTICATION, true);
				request.send();
			}
		}
	}

	/**
	 * @description: Queries all the verses located within the given chapter
	 * object
	 * @param {object} chapterData: Chapter object returned from github api
	 * @param {function} callback: callback that could get called with (error, chapterObj)
	 */
	getChapter(chapterData, callback= () => ({})) {
		if (chapterData.type == "dir") {
			var link = chapterData.url;
			var chapterObj = {};
			chapterObj['link'] = link;
			chapterObj['num'] = chapterData.name;

			var request = new XMLHttpRequest();

			request.onload = function() {
				var verseObj = getJSONFromData(this);
				if (verseObj == null) {
					callback(INVALID_DATA);
				}
				chapterObj['verses'] = verseObj;
				callback(null, chapterObj);

			}

			request.onerror = function() {
				callback(REQUEST_FAILURE);
			}

			request.open('GET', link + "&" + AUTHENTICATION, true);
			request.send();
		}
		else {
			//we've hit a non directory, something like 'home.txt' that
			// we don't care about
			callback(null, null);
		}
	}

	/**
	 * @description - Downloads all the verse data from each verse from the given
	 * github object that contains data on where to get the verse
	 */
	getVerse(verseData, callback=() => ({})) {
		var _this = this;
		var verseObj = {};
		verseObj['link'] = verseData['download_url'];
		verseObj['num'] = verseData['name'].replace('.txt', '');

		var request = new XMLHttpRequest();

		request.onload = function() {
			var file = this.response;
			verseObj['file'] = file;
			callback(null, verseObj);
		}

		request.onerror = function() {
			callback(REQUEST_FAILURE);
		}

		var link = verseObj['link'];
		request.open('GET', link + (link.indexOf('?') == -1 ? '?' : '&') + AUTHENTICATION, true);
		request.send();
	}

  /**
   * @description - This function finds the ULB text within a book and returns it as
   * an object
   * @param {Object} book - book object from getBook() function that is to be parsed
   */
  getULBFromBook(book = {chapters: []}) {
    let ulbData = {chapters: []};
    if (!book.chapters) {
      console.error("Error: Input object is in incorrect format");
      return ulbData;
    }
    const usfmRegex = new RegExp("=+\\s*ulb:\\s*=+\\s*<usfm>([^<]+)<\\/usfm>", "i");
    for (let ch of book.chapters) {
      let chap = {num: -1, verses: []};
      for (let v of ch.verses) {
        let regRes;
        try {
          [,regRes] = usfmRegex.exec(v.file);
        }
        catch (e) {
          if (!suppress) {            
            console.warn("ULB Parse Warning: No ULB Data for chapter " + ch.num + " verse " + v.num);
            console.warn("File may be in incorrect format");
          }
          continue;
        }
        let parsed = USFMParser(regRes).chapters[0];
        if (parsed.num != -1) chap.num = parsed.num;
        chap.verses = chap.verses.concat(parsed.verses);
      }
      if (chap.verses.length != 0)
        ulbData.chapters.push(chap);
    }
    return ulbData;
  }

  getTNFromBook(book = {chapters: []}, bookAbbr = "?") {
    if (!book.chapters) {
      console.error("Error: Input object is in incorrect format");
      return {};
    }
    return TNParser(book, bookAbbr);
  }
}

/**
 * @description - This function checks the responsetype of the given
 * request and does error checking to always return a json object if valid
 * or null if invalid
 * @param {XMLHttpRequest} httpRequest - request that is supposed to return
 * json object
 */
function getJSONFromData(httpRequest) {

	try {
		return JSON.parse(httpRequest.response);
	}
	catch(error) {
		console.error(error);
		return null;
	}
}

module.exports = Door43DataFetcher;