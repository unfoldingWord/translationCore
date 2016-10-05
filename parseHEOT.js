const booksOfBible = require("./src/js/components/core/BooksOfBible.js");
const hebrew = require('./hebrew.js');
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path');

// var javascripture = {
// 	data: {
// 		hebrew: {}
// 	},
// 	modules: {}
// };

function HEOT() {
    hebrew.parse();
    var books = hebrew.books;
    for (var book in books) {
        var x = path.join(window.__base, "/static/Hebrew/", books[book].bookName + ".json");
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
        finishedBook[books[book].bookName] = entireBook;
        fs.writeJson("./static/Hebrew/" + books[book].bookName + ".json", finishedBook, (err) => {
        });
    }

}
module.exports = HEOT; 