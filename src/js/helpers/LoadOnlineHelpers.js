import path from 'path';
import pathex from 'path-extra';
import fs from 'fs-extra';
import git from '../helpers/GitApi.js';

/**
* @description This function takes a url and opens it from a remote source.
* @param {string} url - The url that the project is found at
* @param {function} callback - The function to be run on complete
* @param {function} gitHandler - optional for testing.  If not given will use git module
******************************************************************************/
export function openManifest(url, callback, gitHandler) {
  if (!url) {
    if (callback) {
      callback({ type: "custom", text: 'No link specified' }, null, null);
    }
    return;
  }
  var splitUrl = url.split('.');
  if (splitUrl[splitUrl.length - 1] !== 'git') {
    url += '.git';
  }

  var expression = new RegExp(/^https?:\/\/(git.door43.org|door43.org\/u)\/[^\/]+\/([^\/.]+).git$/);

  if (expression.test(url)) {
    var projectName = expression.exec(url)[2];
    var savePath = path.join(pathex.homedir(), 'translationCore', 'imports', projectName);
  } else {
    if (callback) {
      callback({ type: "custom", text: 'The URL does not reference a valid project' }, null, url);
    }
    return;
  }

  if (!fs.existsSync(savePath)) {
    fs.ensureDirSync(savePath);
    runGitCommand(savePath, url, callback, gitHandler);
  } else {
    if (callback)
      callback({ type: "custom", text: 'The project you selected already exists. Reimporting existing projects is not currently supported.' }, savePath, url);
  }
}

/**
* @description Runs the git command to clone a repo.
* @param {string} savePath - The location of the git repo
* @param {string} url - The url of the git repo
* @param {function} callback - The function to be run on complete
* @param {module} gitHandler - optional for testing.  If not given will use git module
******************************************************************************/
export function runGitCommand(savePath, url, callback, gitHandler) {
  gitHandler = gitHandler || git;
  gitHandler(savePath).mirror(url, savePath, function (err) {
    if (err) {
      fs.removeSync(savePath);
      if (callback)
        callback({ type: "custom", text: err }, savePath, url);
    } else {
      callback(null, savePath, url);
    }
  });
}

/**
 * @description import online project from link
 * @param {string} link - url of project to import
 * @param {function} dispatch
 * @param {function} handleImportResults - action function to display results
 * @param {function} gitHandler - optional for testing.  If not given will use git module
 */
export function importOnlineProjectFromUrl(link, dispatch, handleImportResults, gitHandler) {
    openManifest(link, function (err, savePath, url) {
        let errMessage = null;
        if (err) {
            errMessage = "An unknown problem occurred during import";

            if (err.text.includes("fatal: unable to access")) {
                errMessage = "Unable to connect to the server. Please check your Internet connection.";
            } else if (err.text.includes("fatal: The remote end hung up")) {
                errMessage = "Unable to connect to the server. Please check your Internet connection.";
            } else if (err.text.includes("Failed to load")) {
                errMessage = "Unable to connect to the server. Please check your Internet connection.";
            } else if (err.text.includes("fatal: repository") && err.text.includes("not found")) {
                errMessage = "Project not found: '" + url + "'";
            } else if (err.type && err.type === "custom") {
                errMessage = err.text;
            }
        }
        handleImportResults(dispatch, url, savePath, errMessage);
    }, gitHandler);
}

