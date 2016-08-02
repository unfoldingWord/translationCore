const api = window.ModuleApi;

function getData(params, progressCallback, onCompleteCallback) {
  // Get the gateway language and generate a check for each verse
  api.getGatewayLanguageAndSaveInCheckStore(params, progressCallback, function(bookData) {
    generateChecks(bookData, params, progressCallback, onCompleteCallback);
  });
}

/**
 * Generates two groups of checks, where each group has a check for each verse.
 */
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

/**
 * The groups created by the generateChecks() method must be in this format
 * to work with the CheckModule class and be displayed in the navigation menu:
 * 
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