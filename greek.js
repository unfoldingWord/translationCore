var node_xj = require("xls-to-json");
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path');
const extensionRegex = new RegExp('(\\.\\w+)', 'i');

const GreekParser = {
    parseEachBook: function (bookPath, name) {
        node_xj({
            input: path.join(window.__base, 'UGNT', bookPath),  // input xls 
            output: ""
        }, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                var obj = this.parseData(result, name);
                fs.outputJsonSync(path.join(window.__base, 'UGNT', name + ".json"), obj);
            }
        });

    },
    parseData: function (data, name) {
        var book = {};
        try {
            for (verseRef in data) {
                var current_chapter = data[verseRef]['Reference'].split(" ")[1].split(":")[0];
                var current_verse = data[verseRef]['Reference'].split(" ")[1].split(":")[1];
                if (book[name] == undefined) book[name] = {};
                if (book[name][current_chapter] == undefined) book[name][current_chapter] = {};
                if (book[name][current_chapter][current_verse] == undefined) book[name][current_chapter][current_verse] = "";
                var word = data[verseRef]['UGNT text'];
                var strong = !isNaN(data[verseRef]["Strong's"]) ? "G" + data[verseRef]["Strong's"] : "G" + data[verseRef]["Strong's"].split("&")[0];
                var morph = data[verseRef]['Morphology'];
                var verse = word + " " + strong + " " + morph;
                book[name][current_chapter][current_verse] += verse + " ";
            }
        }
        catch (e) {
            console.log(e);
        }
        return book;
    },
    start: function () {
        var folder = fs.readdirSync(path.join(window.__base, 'UGNT'));
        for (var excel in folder) {
            if (folder[excel][0] == '.') continue;
            var name = path.basename(folder[excel]).replace(extensionRegex, '');
            this.parseEachBook(folder[excel], name);
        }
    }
};
module.exports = GreekParser.start();