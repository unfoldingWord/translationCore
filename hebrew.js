/*global javascripture*/
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path');
//const morphParse = require('./morph.js');

const HebrewFuncs = {
    VERSE_MAP: "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc/VerseMap.xml",
    XML_SOURCE: "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc/",
    stripPoint: function (word) {
        var wordArr = word.split('/');
        var newWord = "";
        if (wordArr[0]) {
            if (wordArr[1]) newWord = wordArr[0] + wordArr[1];
            else {
                newWord = wordArr[0];
            }
        }
        if (wordArr[1]) {
            if (wordArr[0]) newWord = wordArr[0] + wordArr[1];
            else {
                newWord = wordArr[1];
            }
        }
        return newWord;
    },
    xmlToJson: function (xml) {
        // Create the return object
        var obj = {};
        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    },
    jsonToArray: function (chapters) {
        // Create the return object
        var bookArray = [];
        // do children
        if ('undefined' === typeof chapters.forEach) {
            bookArray.push(this.createChapterArray(chapters));
        } else {
            chapters.forEach((chapterElement) => {
                var chapterArray = this.createChapterArray(chapterElement);
                bookArray.push(chapterArray);
            });
        }
        return bookArray;
    },
    createChapterArray: function (chapterElement) {
        var chapterArray = [];
        chapterElement.verse.forEach((verseElement) => {
            var verseArray = [];
            verseElement.w.forEach((wordElement) => {
                var wordArray = [];
                var text = wordElement['#text'];
                var word;
                if ('undefined' !== typeof text.replace) {
                    word = this.stripPoint(text);
                }
                var lemma = wordElement['@attributes'].lemma;
                var morph = wordElement['@attributes'].morph;
                wordArray[0] = word;
                if (lemma) {
                    lemma = lemma.replace(/ a/g, '').replace(/ b/g, '').replace(/ c/g, '').replace(/ d/g, '').replace(/ e/g, '').replace(/ f/g, '').replace('+', '');
                    lemmaArray = lemma.split(/\//);
                    lemmaArrayPrefixed = lemmaArray.map((lemmaValue) => {
                        return 'H' + lemmaValue;
                    });
                    wordArray[1] = lemmaArrayPrefixed.join('/');
                }
                if (morph) {
                    if ('H' === morph.charAt(0)) {
                        morph = morph.substring(1);
                    }
                    wordArray[2] = morph;
                }
                verseArray.push(wordArray);
            });
            chapterArray.push(verseArray);
        });
        return chapterArray;
    },

    hebrew: {},
    hebrewReordered: {},
    books: [
        { bookName: 'Genesis', bookFile: 'Gen' },
        { bookName: 'Exodus', bookFile: 'Exod' },
        { bookName: 'Leviticus', bookFile: 'Lev' },
        { bookName: 'Numbers', bookFile: 'Num' },
        { bookName: 'Deuteronomy', bookFile: 'Deut' },
        { bookName: 'Joshua', bookFile: 'Josh' },
        { bookName: 'Judges', bookFile: 'Judg' },
        { bookName: 'Ruth', bookFile: 'Ruth' },
        { bookName: '1 Samuel', bookFile: '1Sam' },
        { bookName: '2 Samuel', bookFile: '2Sam' },
        { bookName: '1 Kings', bookFile: '1Kgs' },
        { bookName: '2 Kings', bookFile: '2Kgs' },
        { bookName: '1 Chronicles', bookFile: '1Chr' },
        { bookName: '2 Chronicles', bookFile: '2Chr' },
        { bookName: 'Ezra', bookFile: 'Ezra' },
        { bookName: 'Nehemiah', bookFile: 'Neh' },
        { bookName: 'Esther', bookFile: 'Esth' },
        { bookName: 'Job', bookFile: 'Job' },
        { bookName: 'Psalm', bookFile: 'Ps' },
        { bookName: 'Proverbs', bookFile: 'Prov' },
        { bookName: 'Ecclesiastes', bookFile: 'Eccl' },
        { bookName: 'Song of Songs', bookFile: 'Song' },
        { bookName: 'Isaiah', bookFile: 'Isa' },
        { bookName: 'Jeremiah', bookFile: 'Jer' },
        { bookName: 'Lamentations', bookFile: 'Lam' },
        { bookName: 'Ezekiel', bookFile: 'Ezek' },
        { bookName: 'Daniel', bookFile: 'Dan' },
        { bookName: 'Hosea', bookFile: 'Hos' },
        { bookName: 'Joel', bookFile: 'Joel' },
        { bookName: 'Amos', bookFile: 'Amos' },
        { bookName: 'Obadiah', bookFile: 'Obad' },
        { bookName: 'Jonah', bookFile: 'Jonah' },
        { bookName: 'Micah', bookFile: 'Mic' },
        { bookName: 'Nahum', bookFile: 'Nah' },
        { bookName: 'Habakkuk', bookFile: 'Hab' },
        { bookName: 'Zephaniah', bookFile: 'Zeph' },
        { bookName: 'Haggai', bookFile: 'Hag' },
        { bookName: 'Zechariah', bookFile: 'Zech' },
        { bookName: 'Malachi', bookFile: 'Mal' }
    ],
    rotator: function (callback) {
        var arr = this.books;
        const _this = this;
        var iterator = function (index) {
            if (index >= arr.length) {
                _this.fixOffsetVerses((hebrewReordered) => {
                    for (var book in hebrewReordered) {
                        fs.writeJsonSync("./static/tagged/" + book + ".json", JSON.stringify(hebrewReordered[book]));
                    }
                    callback();
                });
            } else {
                var book = arr[index];
                var xhr = new XMLHttpRequest();
                xhr.open('GET', _this.XML_SOURCE + book.bookFile + ".xml", true);
                xhr.send(null);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                        var data = _this.xmlToJson(xmlDoc);
                        var json = data.osis.osisText.div.chapter;
                        _this.hebrew[book.bookName] = _this.jsonToArray(json);
                        _this.hebrewReordered[book.bookName] = _this.jsonToArray(json);
                        iterator(++index);
                    }
                }
            }
        };
        iterator(0);
    },
	/*for( bookName in books ) {
		var bookFile = books[ bookName ];
		console.log( bookName );
		$.get( '../morphhb/wlc/' + bookFile, function( data ) {
			var json = this.xmlToJson( data ).osis.osisText.div.chapter;
			hebrew[ bookName ] = this.jsonToArray( json );
		} );
	}
	$.each( books, function( bookName, bookFile ) {
		$.get( '../morphhb/wlc/' + bookFile, function( data ) {
			var json = this.xmlToJson( data ).osis.osisText.div.chapter;
			hebrew[ bookName ] = this.jsonToArray( json );
		} );
	} );*/
    // fix offset verses
    fixOffsetVerses: function (callback) {
        const _this = this;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                var data = _this.xmlToJson(xmlDoc);
                data.verseMap.book.forEach((verseMapping) => {
                    if (verseMapping.verse) {
                        verseMapping.verse.forEach((verse) => {
                            var attributes = verse['@attributes'];
                            var wlc = attributes.wlc.split('.');
                            var kjv = attributes.kjv.split('.');
                            var bookDetails = _this.books.filter((book) => {
                                return book.bookFile === wlc[0];
                            });
                            if (!bookDetails[0]) {
                                return;
                            }
                            var bookName = bookDetails[0].bookName;
                            if (_this.hebrewReordered[bookName]) {
                                // If the chapter doesn't exist, create it
                                if (!_this.hebrewReordered[bookName][kjv[1] - 1]) {
                                    _this.hebrewReordered[bookName][kjv[1] - 1] = [];
                                }
                                // Set the kjv verse number equal to the wlc verse content
                                // Use the hebrew object to define the this.hebrewReordered object, so that one doesn't disturb the other
                                _this.hebrewReordered[bookName][kjv[1] - 1][kjv[2] - 1] = _this.hebrew[bookName][wlc[1] - 1][wlc[2] - 1];
                                // if the hebrew is ahead of the KJV then we use this approach
                                if (wlc[1] < kjv[1]) { //|| ( wlc[1] === kjv[1] && wlc[2] < kjv[2] ) ) {
                                    // Set the wlc verse number to empty. It should be populated on a future iteration
                                    _this.hebrewReordered[bookName][wlc[1] - 1][wlc[2] - 1] = [];
                                }
                            }
                        });
                    }
                });
                callback(_this.hebrewReordered);
            }
        }
        xhr.open('GET', this.VERSE_MAP, true);
        xhr.send(null);
    },
    parse: function () {
        HebrewFuncs.rotator.call(HebrewFuncs, () => {
            for (var book in this.books) {
                var x = path.join(window.__base, "/static/tagged/", this.books[book].bookName + ".json");
                var obj = JSON.parse(fs.readJsonSync(x));
                var entireBook = {};
                var finishedBook = {};
                obj.forEach((chapter, cIndex) => {
                    var entireChapter = {};
                    chapter.forEach((verse, vIndex) => {
                        var entireVerse = "";
                        verse.forEach((word, wIndex) => {
                            entireVerse += word.join(" ") + " ";
                        });
                        entireChapter[`${vIndex + 1}`] = entireVerse;
                    });
                    entireBook[`${cIndex + 1}`] = entireChapter;
                });
                finishedBook[this.books[book].bookName] = entireBook;
                fs.writeJson("./static/tagged/" + this.books[book].bookName + ".json", finishedBook, (err) => {
                });
            }
        });
    }
}
module.exports = HebrewFuncs.parse();