const api = window.ModuleApi;

function getData(params, progressCallback, onCompleteCallback) {
  var groups = getGroupsOfChecks(params);
  api.initializeCheckStore('ExampleChecker', params, groups);
  api.putGatewayLanguageInCheckStore(params, progressCallback, onCompleteCallback);
}

function getGroupsOfChecks(params) {
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
  return groups;
}

module.exports = getData;