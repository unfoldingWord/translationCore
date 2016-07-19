var HTMLScraper = require('./parsers/HTMLscraper');
var Parser = require('./parsers/tNParser.js');
var Door43DataFetcher = require('./parsers/Door43DataFetcher.js');
var CoreActions = require('../../../actions/CoreActions');

var DataFetcher = function(bookAbbr, progress, onComplete){
  var DoorDataFetcher = new Door43DataFetcher();
  var chapterData = {};
  var ulb = {};
  DoorDataFetcher.getBook(
    bookAbbr,
    function(done, total){
      progress(done/total*100);
    },
    function(err, book){
      if(err){
        console.log("Error in on complete callback: " + err);
      }else{
        chapterData = DoorDataFetcher.getTNFromBook(book, bookAbbr);
        ulb = DoorDataFetcher.getULBFromBook(book);
        var newStructure = {title: ''};
        for (chapter in ulb) {
          for (verses in ulb[chapter]) {
            var chapterNumber = ulb[chapter][verses].num;
            newStructure[chapterNumber] = {}
            for(verse in ulb[chapter][verses].verses) {
              var verseNumber = ulb[chapter][verses].verses[verse].num;
              var verse = ulb[chapter][verses].verses[verse].text;
              newStructure[chapterNumber][verseNumber] = verse;
            }
          }
        }
        CoreActions.updateGatewayLanguage(newStructure);
        onComplete(null, parseObject(chapterData));
      }
    }
  );
}

var parseObject = function(object){
  let phraseObject = {};
  phraseObject["groups"] = [];
  for(let type in object){
    var newGroup = {group: type, checks: []};
    for(let verse of object[type].verses) {
      let newVerse = Object.assign({},verse);
      newVerse.chapter += 1;
      newVerse.verse += 1;
      newVerse.flagged = false;
      newVerse.checkStatus = "NOT_CHECKED";
      newVerse.comments = "";
      newVerse.group = type;
      newGroup.checks.push(newVerse);

    }
    phraseObject["groups"].push(newGroup);
  }
  return phraseObject;
}

module.exports = DataFetcher;
