var HTMLScraper = require('./parsers/HTMLscraper');
var Parser = require('./parsers/tnParser.js');

var DataFetcher = function(bookAbbr, progress, onComplete){
  var http = new HTMLScraper();
  var chapterData = {};
  http.downloadEntireBook(
    bookAbbr,
    function(done, total){
      progress(done/total*100);
    },
    function(){
      var book = http.getBook(bookAbbr);
      chapterData = Parser(book, bookAbbr, function(a){console.log(a*100+"%")});
      onComplete(parseObject(chapterData));
    }
  );
}

var parseObject = function(object){
  let phraseObject = {};
  phraseObject["Phrase Checks"] = [];
  for(let type in object){
    var newGroup = {group: type, checks: []};
    for(let verse of object[type].verses) {
      let newVerse = Object.assign({},verse);
      delete newVerse.book;
      newVerse.checked = false;
      newGroup.checks.push(newVerse);
    }
    phraseObject["Phrase Checks"].push(newGroup);
  }
  return phraseObject;
}





module.exports = DataFetcher;
