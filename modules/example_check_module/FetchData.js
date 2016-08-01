const api = window.ModuleApi;
const Door43DataFetcher = require('./../../src/js/components/core/parsers/Door43DataFetcher.js');

function getData(params, progressCallback, onCompleteCallback) {
  getBookAndGenerateChecks(params, progressCallback, onCompleteCallback);
}

function getBookAndGenerateChecks(params, progressCallback, callback) {
  Door43Fetcher = new Door43DataFetcher();
  Door43Fetcher.getBook(params.bookAbbr, function(done, total) {
    progressCallback((done / total) * 50);}, function(error, data) {
      if (error) {
        console.error('Door43Fetcher throwing error');
        callback(error);
      }
      else {
        var gatewayLanguage = api.getDataFromCommon('gatewayLanguage');
        var bookData;
        /*
         * we found the gatewayLanguage already loaded, now we must convert it
         * to the format needed by the parsers
         */
        if (gatewayLanguage) {
          var reformattedBookData = {chapters: []};
          for (var chapter in gatewayLanguage) {
            var chapterObject = {
              verses: [],
              num: parseInt(chapter)
            }
            for (var verse in gatewayLanguage[chapter]) {
              var verseObject = {
                num: parseInt(verse),
                text: gatewayLanguage[chapter][verse]
              }
              chapterObject.verses.push(verseObject);
            }
            chapterObject.verses.sort(function(first, second) {
              return first.num - second.num;
            });
            reformattedBookData.chapters.push(chapterObject);
          }
          reformattedBookData.chapters.sort(function(first, second) {
            return first.num - second.num;
          });
          generateChecksAndSaveToCheckStore(reformattedBookData, params, progressCallback, callback);
        }
        // We need to load the data, and then reformat it for the store and store it
        else {
          bookData = Door43Fetcher.getULBFromBook(data);
          //reformat
          var newBookData = {};
          for (var chapter of bookData.chapters) {
            newBookData[chapter.num] = {};
            for (var verse of chapter.verses) {
              newBookData[chapter.num][verse.num] = verse.text;
            }
          }
          newBookData.title = api.convertToFullBookName(params.bookAbbr);
          //load it into checkstore
          api.putDataInCommon('gatewayLanguage', newBookData);
          //resume fetchData
          for (var chapter of bookData.chapters) {
            chapter.verses.sort(function(first, second) {
              return first.num - second.num;
            });
          }
          bookData.chapters.sort(function(first, second) {
            return first.num - second.num;
          });
          generateChecksAndSaveToCheckStore(bookData, params, progressCallback, callback);
        }
      }
    }
  );
}

function generateChecksAndSaveToCheckStore(bookData, params, progressCallback, callback) {
  var groupNames = ['Language', 'Naturalness'];
  var groups = [];
  for (let groupName of groupNames) {
    var group = {
      group: groupName,
      checks: []
    };
    for (let chapter of bookData.chapters) {
      for (let verse of chapter.verses) {
        var check = {
          chapter: chapter.num,
          verse: verse.num,
          checkStatus: 'UNCHECKED'
        }
        group.checks.push(check);
      }
    }
    groups.push(group);
  }
  api.initializeCheckStore('ExampleChecker', params, groups);
  api.putGatewayLanguageInCheckStore(params, progressCallback, callback);
}

/** The groups created by the generateChecksAndSaveToCheckStore() method will be in this format:
var groups = [
  {
    group: 'Language',
    checks: [
      {
        chapter: 1,
        verse: 1,
        checkStatus: 'UNCHECKED'
      },
      {
        chapter: 1,
        verse: 2,
        checkStatus: 'UNCHECKED'
      }
    ]
  },
  {
    group: 'Naturalness',
    checks: [
      {
        chapter: 1,
        verse: 1,
        checkStatus: 'UNCHECKED'
      },
      {
        chapter: 1,
        verse: 2,
        checkStatus: 'UNCHECKED'
      }
    ]
  }
];
*/

module.exports = getData;