const booksOfBible = require("./src/js/components/core/BooksOfBible.js");
function HEOT(URL) {
    var xhr = new XMLHttpRequest();
    var JSONOBJ = {};
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
            var xmlChapters = xmlDoc.getElementsByTagName("div")[0];
            var currBook = xmlChapters.attributes[1].nodeValue;
            var versesObj = {};
            for (var i = 0; i < xmlChapters.childElementCount; i++) {
                var xmlChapter = xmlChapters.children[i];
                var chapter = i + 1;
                var currentVerse = [];
                for (var j = 0; j < xmlChapter.childElementCount; j++) {
                    var xmlVerse = xmlChapter.children[j];
                    var verseNum = j + 1;
                    var size = xmlVerse.childElementCount - 1;
                    for(var k = 0; k < size; k++){
                        var word = xmlVerse.children[k];
                        currentVerse.push(word.innerHTML);
                        currentVerse.push(word.attributes[0].nodeValue);
                    }
                    let temp = currentVerse.join(" ");
                    debugger;
                }
            }
            //JSONOBJ[booksOfBible[currBook]] = 
        }
    }
    xhr.open('GET', URL, true);
    xhr.send(null);
}
module.exports = HEOT;