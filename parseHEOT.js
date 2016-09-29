const booksOfBible = require("./src/js/components/core/BooksOfBible.js");
function HEOT(URL) {
    var xhr = new XMLHttpRequest();
    var JSONOBJ = {};
    //OBJ to store entire JSON
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
            var xmlChapters = xmlDoc.getElementsByTagName("div")[0];
            //xmlChapters = <div type="book" osisID="XChr">
            var currBook = xmlChapters.attributes[1].nodeValue;
            var versesObj = {};
            for (var i = 0; i < xmlChapters.childElementCount; i++) {
                var xmlChapter = xmlChapters.children[i];
                //xmlChapter = <chapter osisID="XChr.X">
                var chapter = i + 1;
                for (var j = 0; j < xmlChapter.childElementCount; j++) {
                    var xmlVerse = xmlChapter.children[j];
                    //xmlVerse = <verse osisID="XChrX.XX">
                    var verseNum = j + 1;
                    var size = xmlVerse.childElementCount - 1;
                    var currentVerse = [];
                    for(var k = 0; k < size; k++){
                        var word = xmlVerse.children[k];
                        //word = <w lemma="XXXXX">HEBREW</w>
                        currentVerse.push(word.innerHTML);
                        //Hebrew Word 
                        currentVerse.push(word.attributes[0].nodeValue);
                        //Hebrew Strong Number "lemma"
                    }
                    let entireVerse = currentVerse.join(" ");
                    //TO-DO finish making entire object
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