/**
 * @author Ian Hoegen
 * This class provides the application with functions for feedback.
 ******************************************************************************/
const request = require('request');
const headers = {
  'X-HockeyAppToken': '18e2870d00ca751291a183fa3e10f744'
};
const url = 'https://rink.hockeyapp.net/api/2/apps/2be18e8dac7c4d799c8c23d80a4350c1/feedback';
/**
 * This method handles user generated feedback.
 *
 * @param {string} message - A message to be published.
 * @param {string} username - The username of the poster.
 * @param {function} callback - To be initiated after posting.
 ******************************************************************************/
function postMessage(message, username, callback) {
  var dataString = "subject=User Message&text=" + message + "&name=" + username;
  var options = {
      url: url,
      method: 'POST',
      headers: headers,
      body: dataString
  };
  request(options, callback);
}
/**
 * This method handles system generated bug reports.
 *
 * @param {string} bug - A bug object to be pushed to management.
 * @param {string} username - The username of the poster.
 * @param {function} callback - To be initiated after posting.
 ******************************************************************************/
function postBug(bug, username, callback) {
  var bugString = JSON.stringify(bug, null, 4);
  if (bugString === "{}" || !bugString) {
    return;
  }
  var dataString = "subject=Bug Report&text=" + bugString + "&name=" + username;
  var options = {
      url: url,
      method: 'POST',
      headers: headers,
      body: dataString
  };
  request(options, callback);
}

module.exports = {
  postBug: postBug,
  postMessage: postMessage
}
