var HTMLScraper = require('./parsers/HTMLscraper');
var Parser = require('./parsers/tnParser.js');
var Door43DataFetcher = require('./parsers/Door43DataFetcher.js');

var DataFetcher = function(bookAbbr, progress, onComplete){
  var DataFetcher = new Door43DataFetcher();
  var chapterData = {};
  var ulb = {};
  DataFetcher.getBook(
    bookAbbr,
    function(done, total){
      progress(done/total*100);
    },
    function(err, book){
      if(err){
        console.log("Error in on complete callback: " + err);
      }else{
        chapterData = DataFetcher.getTNFromBook(book, bookAbbr);
        // ulb = DataFetcher.getULBFromBook(book);
        onComplete(null, parseObject(chapterData));
      }
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
      newVerse.chapter += 1;
      newVerse.flagged = false;
      newVerse.checkStatus = "NOT_CHECKED";
      newVerse.comments = "";
      newGroup.checks.push(newVerse);
    }
    phraseObject["Phrase Checks"].push(newGroup);
  }
  return phraseObject;
}

module.exports = DataFetcher;
