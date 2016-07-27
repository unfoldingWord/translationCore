const api = window.ModuleApi;

function getData(params, progressCallback, onCompleteCallback) {
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
  onCompleteCallback(null);
}

module.exports = getData;