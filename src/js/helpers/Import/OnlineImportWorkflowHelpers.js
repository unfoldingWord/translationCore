import git from '../GitApi';
import path from 'path-extra';
import ospath from 'ospath';
import fs from 'fs-extra';

/**
* @description Clones the project of either a DCS or Door43 URL into the imports directory
* @param {string} link - The url of the git.door43.org repo or rendered Door43 HTML page
* @returns {Promise}
*/
export const clone = (link) => {
  return new Promise((resolve, reject) => {
    const gitUrl = getValidGitUrl(link); // gets a valid git URL for git.door43.org if possible, null if not
    let projectName = getProjectName(gitUrl);
    if (!projectName) {
      return reject('The URL ' + link + ' does not reference a valid project');
    }
    let savePath = path.join(ospath.home(), 'translationCore', 'imports', projectName);
    if (!fs.existsSync(savePath)) {
      fs.ensureDirSync(savePath);
    } else {
      return reject("Project has already been imported.");
    }
    runGitCommand(savePath, gitUrl).then(()=>{
      resolve(projectName);
    }).catch((e)=>{
      console.log(e);
      reject(e);
    });
  });
};

/**
* @description Converts git error messages to human-readable error messages for tC users
* @param {string} err - the git error message
* @param {string} link - The url of the git repo
* @returns {string} - The human-readable error message
*/
export function convertGitErrorMessage(err, link) {
  let errMessage = "An unknown problem occurred during import";
  if (err.includes("fatal: unable to access")) {
    errMessage = "Unable to connect to the server. Please check your Internet connection.";
  } else if (err.includes("fatal: The remote end hung up")) {
    errMessage = "Unable to connect to the server. Please check your Internet connection.";
  } else if (err.includes("Failed to load")) {
    errMessage = "Unable to connect to the server. Please check your Internet connection.";
  } else if (err.includes("fatal: repository") && err.includes("not found")) {
    errMessage = "Project not found: '" + link + "'";
  }
  return errMessage;
}

/**
* @description Runs the git command to clone a repo.
* @param {string} savePath - The location of the git repo
* @param {string} link - The url of the git repo
* @param {function} callback - The function to be run on complete
* @param {module} gitHandler - optional for testing.  If not given will use git module
*/
export function runGitCommand(savePath, link, gitHandler) {
  return new Promise((resolve, reject) => {
    gitHandler = gitHandler || git;
    gitHandler(savePath).mirror(link, savePath, function (err) {
      if (err) {
        fs.removeSync(savePath);
        reject(convertGitErrorMessage(err));
      } else {
        resolve();
      }
    });
  });
}

/**
* @description Determines if a url is a DCS or Door43 URL and returns the proper git URL for cloning
* @param {string} link - The url of the git.door43.org repo or rendered Door43 HTML page
* @returns {string} - The proper DCS git url if the given url was valid, otherwise empty
*/
export function getValidGitUrl(link) {
  if (!link || !link.trim) return '';
  link = link.trim().replace(/\/?$/, ''); // remove white space and right trailing /'s
  const validUrlRE = new RegExp(/^https?:\/\/((live\.|www\.){0,1}door43.org\/u|git.door43.org)\/([^/]+)\/([^/]+)/);
  let match = validUrlRE.exec(link);
  if (!match) {
    return '';
  } else {
    // Return a proper git.door43.org URL from the match
    let userName = match[3];
    let repoName = match[4];
    repoName = repoName.replace('.git', '');
    return 'https://git.door43.org/' + userName + '/' + repoName + '.git';
  }
}

/**
* @description Gets the project name from a git URL
* @param {string} link - The url of the git.door43.org repo URL
* @returns {string} - The project name the url points to, empty if URL is invalid
*/
export function getProjectName(link) {
  const gitUrlRE = new RegExp(/^https?:\/\/git.door43.org\/[^/]+\/([^/]+)\.git$/);
  let match = gitUrlRE.exec(link);
  if (!match) {
    return '';
  } else {
    // Return the project name
    let projectName = match[1];
    return projectName;
  }
}
