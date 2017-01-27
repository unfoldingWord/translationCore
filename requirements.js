window.__base = __dirname + '/';

const api = require('./src/js/ModuleApi.js');
const remote = require('electron').remote;

//Any time an error occurs the user is prompted for a refresh
/**
 * TODO:
 *  +Support multiple errors to get a better idea what else might have
 *  been involved in causing the error.
 *  +Suport error reporting, where the error log can be sent to us so
 *  if there is a frequent issue we can learn about it sooner.
 */

console.errorold = console.error;

var bigError;

console.error = function(err){
  console.errorold(err);
  var loggedInUser = api.getLoggedInUser() || {userName: 'Unknown'};
  api.HockeyApp.postBug(err, loggedInUser.userName);
  bigError += "(" + err + ")";
  api.createAlert(
    {
      title: "A Fatal Error Has Occured",
      content: "Click below for more information about this error or to restart the app",
      moreInfo: bigError,
      leftButtonText: "Reload"
    },
    ()=>{
      localStorage.setItem('crashed', true);
      remote.getCurrentWindow().reload();
    });
}
