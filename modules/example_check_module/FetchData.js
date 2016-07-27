const api = window.ModuleApi;

function getData(params, progressCallback, onCompleteCallback) {
  var groups = [
    {
      group: 'Alliteration',
      checks: [
        {
          chapter: 1,
          verse: 2,
          textToCheck: 'God is good',
          checkStatus: 'UNCHECKED'
        },
        {
          chapter: 1,
          verse: 4,
          textToCheck: 'Jesus is just',
          checkStatus: 'UNCHECKED'
        }
      ]
    },
    {
      group: 'Onomatopoeia',
      checks: [
        {
          chapter: 3,
          verse: 2,
          textToCheck: 'Moo',
          checkStatus: 'UNCHECKED'
        },
        {
          chapter: 3,
          verse: 4,
          textToCheck: 'Chirp',
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