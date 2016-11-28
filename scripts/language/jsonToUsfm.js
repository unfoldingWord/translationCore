var fs = require('fs');
var usfm = require('usfm-parser');

fs.readdir('./static/ulgb', function(err, data) {
  for(var s in data) {
    fs.readFile('./static/ulgb/' + data[s], function(err, data) {
      var book = JSON.parse(data.toString());
      var finalJson = {chapters: []}
      for (var w in book) {
        finalJson.book = w
        for (var q in book[w]) {
          var verseArray = [];
          for (var x in book[w][q]) {
            verseArray.push({number: x, text: book[w][q][x]});
          }
          finalJson.chapters.push({number: q, verses: verseArray});
        }
      }
      fs.writeFile('./static/usfm/' + finalJson.book + '.usfm', usfm.toUSFM(finalJson));
  });
}
});
