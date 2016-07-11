
const BASE_LINK = 'https://git.door43.org',
    TN_LINK = '/Door43/tn-en'; // TranslationNotes

class TranslationNotesHTMLScraper {
    
    constructor() {
		this._request = new XMLHttpRequest();
    }

    getBaseLink() {
		return BASE_LINK + TN_LINK
    }
    
    /** This function will goto https://git.door43.org/Door43/tn-en 
	 * (the translationNotes gogs home page for the repo) and
	 * query all the abbreviations for books found there into a json object
	 * 
	 * @param setterFunction: This is called after the asynchronous https request 
	 *  has been made so that the bookAbbreviations can be retrieved. Note it is
	 * not needed if the TranslationNotesHTMLScraper object has already retrieved it
	 *
	 * @param finishedFunction: This is called just before the program terminates
     */    
    getBookAbbreviations(setterFunction, finishedFunction, errorFunction) {
		if (this.bookAbbreviations) {
		    return this.bookAbbreviations;
		}
		var _this = this;
		//this will be called after the request is completed
		//now 'this' refers to the XMLHttpRequest
		this._request.onload = function() { //now 'this' refers to the XMLHttpRequest
		    console.log('Getting request');
		    //save the abbreviations to the HTMLScraper object so we can retrieve them later
		    _this.bookAbbreviations = getItemsBehindLink(this.response); 
		    if (setterFunction) {
		    	//this is supposed to call a callback that will assign the return value
				setterFunction(_this.bookAbbreviations); 
		    }

		    if (finishedFunction) {
				finishedFunction();
		    }

		};

		//set the error function
		this._request.onerror = errorFunction; 
		
		this._request.open('get', BASE_LINK + TN_LINK, true);
		//send the request and call 'onload' when finished
		this._request.send(); 
	
    }
    /** This is supposed to be used once a book has been downloaded, 
	 * so it would work well in the 'doneCallback param' in 'downloadEntireBook'
     */
    
    getBook(bookAbr) {
	if (!this.bookAbbreviations ||
	    !this.bookAbbreviations[bookAbr]) {
	    return;
	}
	return this.bookAbbreviations[bookAbr];
    }
    
    /** Once getBookAbbreviations has been called, 
	 * this will download all the chapter and verse files 
	 * found for the entire book
     */    
	
    downloadEntireBook(bookAbr, progressCallback, doneCallback) {
		var _this = this;
		if (!this.bookAbbreviations) { //getBookAbbreviations hasn't been called yet
		    this.getBookAbbreviations(null,        //set the setterFunction to null
					      function() { /* and the finishedCallback to this
							      anonymous function that will call
							      downloadEntireBook again, after the
							      abbreviations have been retrieved
							   */
						  _this.downloadEntireBook(bookAbr, progressCallback, doneCallback);
					      });
		    return; //make sure we don't do it again
		}
		if (!this.bookAbbreviations[bookAbr]['chapters']) { /* getChapters hasn't been called for 
								       this bookAbr yet
								    */
		    this.getChapters(bookAbr,
				     function() {
					 _this.downloadEntireBook(bookAbr, progressCallback, doneCallback);
				     });
		    return;
		}

		
		this.maxChapters = this.getMaxChapters(bookAbr);
		this.doneChapters = 0;
		this.doneVerses = 0;
		this.maxVerses = 0;
		for (var chapter in this.bookAbbreviations[bookAbr]['chapters']) {
		    this.getVerses(bookAbr, chapter,
				   function() {
				       /* if (_this.maxVerses == 0) {
					   _this.maxVerses = _this.getMaxVerses(bookAbr);
				       }
				       */
				       _this.doneChapters++;
				       if (_this.doneChapters == _this.maxChapters) {
					   _this.maxVerses = _this.getMaxVerses(bookAbr);
					   for (var chapter in _this.bookAbbreviations[bookAbr]['chapters']) {
					       for (var verse in _this.bookAbbreviations[bookAbr]['chapters'][chapter]['verses']) {	   
						   _this.getVerseFiles(bookAbr, chapter, verse,
								       function() {
									   _this.doneVerses++;
									   progressCallback(_this.doneVerses, _this.maxVerses);
									   if (_this.doneVerses == _this.maxVerses) {
									       doneCallback();
									   }
								       });
					       }
					       
					   }				  
				       }
				   });
		}
    }

    getMaxVerses(bookAbr) {
		if (!this.bookAbbreviations[bookAbr]['chapters']) {
		    return;
		}
		//I'm sure there is a better way to do this
		var chapters = this.bookAbbreviations[bookAbr]['chapters'];
		var length = 0;
		for (var chapter in chapters) {
		    if (!this.bookAbbreviations[bookAbr]['chapters'][chapter]['verses']) {
			continue;
		    }
		    for (var verse in this.bookAbbreviations[bookAbr]['chapters'][chapter]['verses']) {
			length++;
		    }
		}
		return length;
    }
	
    getMaxChapters(bookAbr) {	
		if (!this.bookAbbreviations[bookAbr]['chapters']) {
		    return;
		}
		//I'm sure there is a better way to do this
		var length = 0;
		for (var chapter in this.bookAbbreviations[bookAbr]['chapters']) {
		    length++;
		}
		return length;
    }
    
    getChapters(bookAbr, callback) {
		if (!this.bookAbbreviations) { //have to call getBookAbbreviations before chapters can be retrieved
		    return;
		}
		var _this = this;
		var request = new XMLHttpRequest();
		request.onload = function() {
		    //console.log('Getting Chapters for book: ' + bookAbr);
		    var link = _this.bookAbbreviations[bookAbr];
		    var chapters = getItemsBehindLink(this.response); //'this' refers to the XMLHttpRequest
		    _this.bookAbbreviations[bookAbr] = {
			'link': link,
			'chapters': chapters
		    };

		    if (callback) {
			callback();
		    }
		};
		var url = BASE_LINK + this.bookAbbreviations[bookAbr];
		// console.log('URL: ' + url);
		request.open('get', url, true);
		request.send();
    }

    /* @param chapter: is a string, exactly how it was found from the HTML */
    getVerses(bookAbr, chapter, callback) {
		//sanity check
		if (!this.bookAbbreviations || // have to have list of books
		    !this.bookAbbreviations[bookAbr]['chapters'] || //check to see if this book's chapters have been parsed
		    !this.bookAbbreviations[bookAbr]['chapters'][chapter]) { //check to see if this chapter is listed in this book
		    return;
		}
		
		var _this = this;
		var request = new XMLHttpRequest();
		request.onload = function() {
		    var link = _this.bookAbbreviations[bookAbr]['chapters'][chapter];
		    var verses = getItemsBehindLink(this.response);
		    _this.bookAbbreviations[bookAbr]['chapters'][chapter] = {
			'link': link,
			'verses': verses
		    };

		    if (callback) {
			callback();
		    }
		}
		var url = BASE_LINK + this.bookAbbreviations[bookAbr]['chapters'][chapter];
		request.open('get', url, true);
		request.send();
    }

    getVerseFiles(bookAbr, chapter, verse, callback) {
		// sanity check
		if (!this.bookAbbreviations ||
		    !this.bookAbbreviations[bookAbr]['chapters'] ||
		    !this.bookAbbreviations[bookAbr]['chapters'][chapter] ||
		    !this.bookAbbreviations[bookAbr]['chapters'][chapter]['verses'] ||
		    !this.bookAbbreviations[bookAbr]['chapters'][chapter]['verses'][verse]) {
		    return;
		}

		var _this = this;
		var link = _this.bookAbbreviations[bookAbr]['chapters'][chapter]['verses'][verse];
		link = link.replace('src', 'raw'); //this gives us the raw file instead of HTML tags and jargon
		var request = new XMLHttpRequest();
		request.onload = function () {
		    _this.bookAbbreviations[bookAbr]['chapters'][chapter]['verses'][verse] = {
			'file': this.response,
			'link': link
		    };
		    //console.log('BookAbr: ' + bookAbr + ', Chapter: ' + chapter + ', Verse: ' + verse);
		    if (callback) {
			callback();
		    }
		}
		var url = BASE_LINK + link;
		//console.log('URL: ' + url);
		request.open('get', url, true);
		request.send();
    }
}

function getItemsBehindLink(htmlString) {
    
    var regex = new RegExp('<a href="([^"]+)">([^.<]+|\\d+[.]md)(?=</a>\\s*?</td>)', 'g'); /* nasty regex that matches links only 
											      with </td> tags behind them, which 
											      correspond to the links we want
											   */
    var returnValue = {};
    var matches = regex.exec(htmlString);
    while (matches != null) {
	returnValue[matches[2]] = matches[1]; /* assigns the attribute tag with link; 
						 ex. '1ch': '/Door43/tn-en/src/master/1ch'
						 in the returnObject
					      */
	matches = regex.exec(htmlString);
    }
    return returnValue;
}

module.exports = TranslationNotesHTMLScraper;