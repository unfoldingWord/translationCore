var request = require('request');
var headers = {
  'X-HockeyAppToken': '18e2870d00ca751291a183fa3e10f744'
};
var url = 'https://rink.hockeyapp.net/api/2/apps/2be18e8dac7c4d799c8c23d80a4350c1/feedback';
function postMessage(message, username, callback) {
  var dataString = "subject='User Message'&text=" + message + "&name=" + username;
  var options = {
      url: url,
      method: 'POST',
      headers: headers,
      body: dataString
  };
  request(options, callback);
}

function postBug(bug, username, callback) {
  var dataString = "subject='Bug Report'&text=" + JSON.stringify(bug, null, 4) + "&name=" + username;
  var options = {
      url: url,
      method: 'POST',
      headers: headers,
      body: dataString
  };
  request(options, callback);
}

postBug('slkds', 'ihoegen');
module.exports = {
  postBug: postBug,
  postMessage: postMessage
}
