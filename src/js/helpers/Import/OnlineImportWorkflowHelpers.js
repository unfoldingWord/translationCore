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

/**
* @description Clones the project of either a DCS or Door43 URL into the imports directory
* @param {string} url - The url of the git.door43.org repo or rendered Door43 HTML page
* @returns {Promise}
******************************************************************************/
export const cloneRepo = (url) => {
  return new Promise((resolve, reject) => {
    const gitUrl = getValidGitUrl(url); // gets a valid git URL for git.door43.org if possible, null if not
    let projectName = getProjectName(gitUrl);
    console.log(projectName);
    if (!projectName) {
      return reject('The URL '+url+' does not reference a valid project');
    }
    let savePath = path.join(pathex.homedir(), 'translationCore', 'imports', projectName);
    if (!fs.existsSync(savePath)) {
      fs.ensureDirSync(savePath);
    } else {
      return reject("Project has already been imported.");
    }
    runGitCommand(savePath, gitUrl, function (err) {
      if(err) {
        let errMessage = "An unknown problem occurred during import";
        if (err.includes("fatal: unable to access")) {
          errMessage = "Unable to connect to the server. Please check your Internet connection.";
        } else if (err.includes("fatal: The remote end hung up")) {
          errMessage = "Unable to connect to the server. Please check your Internet connection.";
        } else if (err.includes("Failed to load")) {
          errMessage = "Unable to connect to the server. Please check your Internet connection.";
        } else if (err.includes("fatal: repository") && err.text.includes("not found")) {
          errMessage = "Project not found: '" + gitUrl + "'";
        }
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

/**
* @description Determines if a url is a DCS or Door43 URL and returns the proper git URL for cloning
* @param {string} url - The url of the git.door43.org repo or rendered Door43 HTML page
* @returns {string} - The proper DCS git url if the given url was valid, otherwise empty
******************************************************************************/
export function getValidGitUrl(url) {
  url = url.trim().replace(/\/?$/, ''); // remove white space and right trailing /'s
  const validUrlRE = new RegExp(/^https?:\/\/((live\.|www\.){0,1}door43.org\/u|git.door43.org)\/([^\/]+)\/([^\/]+)/);
  let match = validUrlRE.exec(url);
  if(!match) {
    return '';
  } else {
    // Return a proper git.door43.org URL from the match
    let userName = match[3];
    let repoName = match[4];
    return 'https://git.door43.org/'+userName+'/'+repoName+'.git'; 
  }
}

/**
* @description Gets the project name from a git URL
* @param {string} url - The url of the git.door43.org repo URL
* @returns {string} - The project name the url points to, empty if URL is invalid
******************************************************************************/
export function getProjectName(url) {
  const gitUrlRE = new RegExp(/^https?:\/\/git.door43.org\/[^\/]+\/([^\/]+)\.git$/);
  let match = gitUrlRE.exec(url);
  if(!match) {
    return '';
  } else {
    // Return the project name
    let projectName = match[1];
    return projectName; 
  }
}
