import git from '../GitApi';
import path from 'path';
import pathex from 'path-extra';
import * as fs from 'fs-extra';

/**
 * @Description:
 * Helpers for the business logic and conditions that wrapping together
 * helpers used for Online Imports
 * Note: This avoids problematic chaining that is troublesome to debug
 */

export const cloneRepo = (link) => {
  return new Promise((resolve, reject) => {
    /** Get project name */
    const dcsUrl = new RegExp(/^https?:\/\/git.door43.org\/[^\/]+\/([^\/.]+)(.git){0,1}$/);
    const d43Url = new RegExp(/^https?:\/\/(live\.|www\.){0,1}door43.org\/u\/([^\/]+)\/([^\/.]+)/);
    let d43Match = d43Url.exec(link);
    let dcsMatch = dcsUrl.exec(link);
    if (!dcsMatch && !d43Match) {
      return reject('The URL does not reference a valid project');
    }
    if (d43Match) {
      link = 'https://git.door43.org/'+d43Match[2]+'/'+d43Match[3]+'.git';
      dcsMatch = dcsUrl.exec(link);
    }
    if (!link.endsWith('.git')) {
      link += '.git';
    }
    let projectName = dcsMatch[1];
    let savePath = path.join(pathex.homedir(), 'translationCore', 'imports', projectName);
    if (!fs.existsSync(savePath)) {
      fs.ensureDirSync(savePath);
    } else {
      return reject("Project has already been imported.");
    }
    runGitCommand(savePath, link, function (err) {
      if(err) {
        let errMessage = "An unknown problem occurred during import";
        if (err.includes("fatal: unable to access")) {
          errMessage = "Unable to connect to the server. Please check your Internet connection.";
        } else if (err.includes("fatal: The remote end hung up")) {
          errMessage = "Unable to connect to the server. Please check your Internet connection.";
        } else if (err.includes("Failed to load")) {
          errMessage = "Unable to connect to the server. Please check your Internet connection.";
        } else if (err.includes("fatal: repository") && err.text.includes("not found")) {
          errMessage = "Project not found: '" + link + "'";
        return reject(errMessage);
      }
      else {
        return resolve();
      }
    });
  });
};

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
      callback(err);
      if (callback)
        callback(err, savePath, url);
    } else {
      callback(null, savePath, url);
    }
  });
}