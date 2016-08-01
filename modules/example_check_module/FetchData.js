const api = window.ModuleApi;

function getData(params, progressCallback, onCompleteCallback) {
  api.getGatewayLanguageAndSaveInCheckStore(params, progressCallback, function(bookData) {
    generateChecks(bookData, params, progressCallback, onCompleteCallback);
  });
}

function generateChecks(bookData, params, progressCallback, callback) {
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
  callback();
}

/** The groups created by the generateChecks() method will be in this format:
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