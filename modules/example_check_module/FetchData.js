const api = window.ModuleApi;

const Door43DataFetcher = require('./parsers/Door43DataFetcher.js');

function getData(params, progressCallback, onCompleteCallback) {
  getChecks(params);
  getGatewayLanguage(params, progressCallback, onCompleteCallback);
}

function getChecks(params) {
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
          chapter: 3,
          verse: 2,
          checkStatus: 'UNCHECKED'
        },
        {
          chapter: 3,
          verse: 4,
          checkStatus: 'UNCHECKED'
        }
      ]
    }
  ];
  api.putDataInCheckStore('ExampleChecker', 'groups', groups);
  api.putDataInCheckStore('ExampleChecker', 'currentCheckIndex', 0);
  api.putDataInCheckStore('ExampleChecker', 'currentGroupIndex', 0);
  api.putDataInCheckStore('ExampleChecker', 'book', api.convertToFullBookName(params.bookAbbr));
}

function getGatewayLanguage(params, progressCallback, callback) {
  var Door43Fetcher = new Door43DataFetcher();
  Door43Fetcher.getBook(
    params.bookAbbr,
    function(done, total) {
      progressCallback((done / total) * 50);
    },
    function(error, data) {
      if (error) {
        console.error('Door43Fetcher throwing error');
        callback(error);
      }
      else {
        var gatewayLanguage = api.getDataFromCommon('gatewayLanguage');
        var bookData;
        if (!gatewayLanguage) {
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
          callback();
        }
      }
    }
  );
}

module.exports = getData;