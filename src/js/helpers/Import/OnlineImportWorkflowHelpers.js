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
    var expression = new RegExp(/^https?:\/\/(git.door43.org|door43.org\/u)\/[^\/]+\/([^\/.]+).git$/);
    if (expression.test(link)) {
      var projectName = expression.exec(link)[2];
      var savePath = path.join(pathex.homedir(), 'translationCore', 'imports', projectName);
      runGitCommand(savePath, link, function (err) {
        if(err) return reject(err);
      });
    } else {
        return reject('The URL does not reference a valid project');
    }
    /** Clone repo to imports folder using git mirror */
    /** Return when repo is cloned */
    resolve();
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