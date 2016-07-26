const api = window.ModuleApi;

function getData(params, progressCallback, onCompleteCallback) {
  var groups = [
    {
      group: 'Alliteration',
      checks: [
        {
          chapter: 1,
          verse: 2,
          checkStatus: 'UNCHECKED'
        },
        {
          chapter: 1,
          verse: 4,
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
  onCompleteCallback(null);
}

module.exports = getData;