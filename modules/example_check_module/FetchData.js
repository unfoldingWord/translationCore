const api = window.ModuleApi;

function getData(params, progressCallback, onCompleteCallback) {
  var groups = [
    {
      group: 'Alliteration',
      checks: [
        {
          book: 'Ephesians',
          chapter: 1,
          verse: 2,
          textToCheck: 'God is good',
          checkStatus: 'UNCHECKED'
        },
        {
          book: 'Ephesians',
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
          book: 'Ephesians',
          chapter: 3,
          verse: 2,
          textToCheck: 'Moo',
          checkStatus: 'UNCHECKED'
        },
        {
          book: 'Ephesians',
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
  onCompleteCallback(null);
}

module.exports = getData;