
const api = window.ModuleApi;

const HTMLScraper = require('./parsers/HTMLscraper');
const Parser = require('./parsers/tNParser.js');
const Door43DataFetcher = require('./parsers/Door43DataFetcher.js');

const DataFetcher = function(params, progress, onComplete){
  var DoorDataFetcher = new Door43DataFetcher();
  var chapterData = {};
  var ulb = {};
  DoorDataFetcher.getBook(
    params.bookAbbr,
    function(done, total){
      progress(done/total*100);
    },
    function(err, book){
      if(err){
        onComplete(err);
      }else{
        chapterData = DoorDataFetcher.getTNFromBook(book, params.bookAbbr);

        //check to see if gatewayLanguage has already been loaded
        var gatewayLanguage = api.getDataFromCommon('gatewayLanguage');
        if (!gatewayLanguage) {
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
          //assign gatewayLanguage into CheckStore
          newStructure.title = api.convertToFullBookName(params.bookAbbr);
          api.putDataInCommon('gatewayLanguage', newStructure);
        }

        var phraseObject = parseObject(chapterData);
        //put the data in the CheckStore
        api.putDataInCheckStore('PhraseCheck', 'groups', phraseObject['groups']);
        api.putDataInCheckStore('PhraseCheck', 'currentCheckIndex', 0);
        api.putDataInCheckStore('PhraseCheck', 'currentGroupIndex', 0);
        // TODO: eventually, this event will be called when the check type is selected, not in fetchData
        api.emitEvent('phraseDataLoaded');
        onComplete(null);
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
