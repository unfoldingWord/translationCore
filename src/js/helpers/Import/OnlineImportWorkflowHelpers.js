import git from '../GitApi';
import path from 'path-extra';
import * as fs from 'fs-extra';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
import consts from '../../actions/ActionTypes';

export const clone = (link) => {
  return ((dispatch) => {
    return new Promise((resolve) => {
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
        dispatch(
          AlertModalActions.openAlertDialog("Importing " + link + " Please wait...", true)
        );
        cloneFromGit(link).then((savePath) => {
          dispatch(clearLink());
          dispatch(AlertModalActions.closeAlertDialog());
          resolve(savePath);
        }).catch((errMessage) => {
          dispatch(AlertModalActions.openAlertDialog(errMessage));
          dispatch({ type: "LOADED_ONLINE_FAILED" });
        });
      }));
    });
  });
};


export function clearLink() {
  return {
    type: consts.IMPORT_LINK,
    importLink: ""
  };
}
/**
 * @Description:
 * Helpers for the business logic and conditions that wrapping together
 * helpers used for Online Imports
 * Note: This avoids problematic chaining that is troublesome to debug
 */
/**
* @description Clones the project of either a DCS or Door43 URL into the imports directory
* @param {string} link - The url of the git.door43.org repo or rendered Door43 HTML page
* @returns {Promise}
******************************************************************************/
export const cloneFromGit = (link) => {
  return new Promise((resolve, reject) => {
    const gitUrl = getValidGitUrl(link); // gets a valid git URL for git.door43.org if possible, null if not
    let projectName = getProjectName(gitUrl);
    if (!projectName) {
      return reject('The URL ' + link + ' does not reference a valid project');
    }
    let savePath = path.join(path.homedir(), 'translationCore', 'imports', projectName);
    if (!fs.existsSync(savePath)) {
      fs.ensureDirSync(savePath);
    } else {
      return reject("Project has already been imported.");
    }
    runGitCommand(savePath, gitUrl, function (err) {
      if (err) {
        return reject(convertGitErrorMessage(err));
      }
      else {
        return resolve(savePath);
      }
    });
  });
};

/**
* @description Converts git error messages to human-readable error messages for tC users
* @param {string} err - the git error message
* @param {string} link - The url of the git repo
* @returns {string} - The human-readable error message
******************************************************************************/
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
******************************************************************************/
export function runGitCommand(savePath, link, callback, gitHandler) {
  gitHandler = gitHandler || git;
  gitHandler(savePath).mirror(link, savePath, function (err) {
    if (err) {
      fs.removeSync(savePath);
      callback(err);
      if (callback)
        callback(err, savePath, link);
    } else {
      callback(null, savePath, link);
    }
  });
}

/**
* @description Determines if a url is a DCS or Door43 URL and returns the proper git URL for cloning
* @param {string} link - The url of the git.door43.org repo or rendered Door43 HTML page
* @returns {string} - The proper DCS git url if the given url was valid, otherwise empty
******************************************************************************/
export function getValidGitUrl(link) {
  link = link.trim().replace(/\/?$/, ''); // remove white space and right trailing /'s
  const validUrlRE = new RegExp(/^https?:\/\/((live\.|www\.){0,1}door43.org\/u|git.door43.org)\/([^\/]+)\/([^\/]+)/);
  let match = validUrlRE.exec(link);
  if (!match) {
    return '';
  } else {
    // Return a proper git.door43.org URL from the match
    let userName = match[3];
    let repoName = match[4];
    return 'https://git.door43.org/' + userName + '/' + repoName + '.git';
  }
}

/**
* @description Gets the project name from a git URL
* @param {string} link - The url of the git.door43.org repo URL
* @returns {string} - The project name the url points to, empty if URL is invalid
******************************************************************************/
export function getProjectName(link) {
  const gitUrlRE = new RegExp(/^https?:\/\/git.door43.org\/[^\/]+\/([^\/]+)\.git$/);
  let match = gitUrlRE.exec(link);
  if (!match) {
    return '';
  } else {
    // Return the project name
    let projectName = match[1];
    return projectName;
  }
}
