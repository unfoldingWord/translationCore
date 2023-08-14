/* eslint-disable no-async-promise-executor */
import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path-extra';
import { DCS_BASE_URL, defaultBranch } from '../common/constants';
import GitApi, {
  getRemoteRepoHead,
  pushNewRepo,
  getRepoNameInfo,
  saveRemote,
  clearRemote,
  getSavedRemote,
} from './GitApi';

// consts
export const GIT_ERROR_UNKNOWN_PROBLEM = 'An unknown problem occurred during import';
export const GIT_ERROR_UNABLE_TO_CONNECT = 'Unable to connect to the server. Please check your Internet connection.';
export const GIT_ERROR_PROJECT_NOT_FOUND = 'Project not found';
export const GIT_ERROR_PUSH_NOT_FF = 'not a simple fast-forward';
export const GIT_ERROR_REPO_ARCHIVED = 'repo is archived';
export const GIT_ERROR_UNSUPPORTED_INITIAL_BRANCH = 'unsupported initial branch';
export const GIT_ERROR_AMBIGUOUS_HEAD = 'ambiguous HEAD';
export const NETWORK_ERROR_IP_ADDR_NOT_FOUND = 'ENOTFOUND';
export const NETWORK_ERROR_TIMEOUT = 'connect ETIMEDOUT';
export const NETWORK_ERROR_UNABLE_TO_ACCESS = 'unable to access';
export const NETWORK_ERROR_INTERNET_DISCONNECTED = 'INTERNET_DISCONNECTED';
export const NETWORK_ERROR_REMOTE_HUNG_UP = 'The remote end hung up';

const dcsHostname = (new URL(DCS_BASE_URL)).hostname;
const projectRegExp = new RegExp(`^https?://${dcsHostname}/([^/]+)/([^/.]+)(\\.git)?$`);
let doingSave = false;
let usingOlderVersion = false;

/**
 * Checks if a string matches any of the expressions
 * @param {string} string - the string to compare
 * @param {array} expressions - an array of expressions to compare against the string
 * @returns {boolean} true if any of the expressions match the string
 */
export function isMatched(string, expressions) {
  for (const expr of expressions) {
    if (expr === string || new RegExp(expr).exec(string)) {
      return true;
    }
  }
  return false;
}

/**
 * Provides a layer of abstraction over git repo management.
 */
export default class Repo {
  /**
   * Initializes a new repo handler. If you don't know what you are doing use {@link open} instead.
   * @param {string} dir - the file path to the local repository
   * @param {object} [user] - the user object that contains names, passwords, and tokens
   */
  constructor(dir, user = {}) {
    this.dir = dir;
    this.user = user;
  }

  /**
   * Returns an init'd instance of {@link Repo}.
   * Use this to safely open directories that will receive git operations.
   * An {@link init} will be performed on plain directories.
   *
   * @param {string} dir - the directory to open
   * @param {object} [user] - the user object that contains names, passwords. and tokens
   * @param {array|object|null} initOptions - options to use on git init
   * @returns {Promise<Repo>}
   */
  static async open(dir, user = {}, initOptions= null) {
    const ok = await Repo.isRepo(dir);

    if (!ok) {
      await Repo.init(dir, initOptions);
    }
    return new Repo(dir, user);
  }

  /**
   * Returns an init'd instance of {@link Repo}.
   * Use this to safely open directories that will receive git operations.
   * also make sure we are using correct branch
   * An {@link init} will be performed on plain directories.
   *
   * @param {string} dir - the directory to open
   * @param {object} [user] - the user object that contains names, passwords. and tokens
   * @param {array|object|null} initOptions - options to use on git init
   * @returns {Promise<Repo>}
   */
  static async openSafe(dir, user = {}, initOptions= null) {
    const repo = await Repo.open(dir, user, initOptions);
    let ensureBr = await makeSureCurrentBranchHasName(dir, defaultBranch);

    if (!ensureBr.success) {
      console.error(`Repo.openSafe() - not currently on branch ${defaultBranch}`);
    }
    return repo;
  }

  /**
   * Checks if the directory is an initialized git repository.
   * @param {string} dir - the directory to inspect
   * @return {boolean} true if the repo has been initialized.
   */
  static isRepo(dir) {
    const gitPath = path.join(dir, '.git');
    return fs.pathExists(gitPath);
  }

  /**
   * returns true if using an old version of git.  Useful for determining which features are supported
   * @return {boolean}
   */
  static usingOldGitVersion() {
    return usingOlderVersion;
  }

  /**
   * function to read the version of git installed on the PC
   * @return {Promise<string>}
   */
  static gitVersion() {
    return new Promise( (resolve, reject) => {
      exec('git --version', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.trim());
        }
      });
    });
  }

  /**
   * Determines if a url is a DCS or Door43 URL and returns the proper git URL for cloning
   * @param {string} url - The url of the git.door43.org repo or rendered Door43 HTML page
   * @returns {string|null} - The sanitized url or else null if invalid
   */
  static sanitizeRemoteUrl(url) {
    if (!url || !url.trim()) {
      return null;
    }

    url = url.trim().replace(/\/?$/, ''); // remove white space and right trailing /'s
    const liveDoor43Url = new RegExp(/^https?:\/\/(live\.|www\.)?door43.org\/u\/([^/]+)\/([^/]+)/);
    const dcsHostname = (new URL(DCS_BASE_URL)).hostname;
    const gitDoor43Url = new RegExp(`^https?://(${dcsHostname})/([^/]+)/([^/]+)`);
    let match = liveDoor43Url.exec(url);

    if (!match) {
      match = gitDoor43Url.exec(url);

      if (match) {
        const extra = url.substr(match.index + match[0].length);

        if (extra && (extra !== '/')) { // make sure not trying to point into contents of repo
          match = null;
        }
      }
    }

    if (match) {
      // Return a proper git.door43.org URL from the match
      let userName = match[2];
      let repoName = match[3];
      repoName = (repoName && repoName.replace('.git', '')) || '';
      return DCS_BASE_URL + '/' + userName + '/' + repoName + '.git';
    }
    return null;
  }

  /**
   * Parses a remote url and returns a object of information about the project.
   * The url must be a properly formatted git url.
   * @param {string} url
   * @returns {null|
   *  {
   *    owner: String,
   *    name: String,
   *    full_name: String,
   *    host: String,
   *    url: String
   *  }
   * }
   */
  static parseRemoteUrl(url) {
    if (!url) {
      return null;
    }

    let matches = projectRegExp.exec(url);

    if (!matches) {
      return null;
    } else {
      return {
        owner: matches[1],
        name: matches[2],
        full_name: `${matches[1]}/${matches[2]}`,
        host: DCS_BASE_URL + '/',
        url,
      };
    }
  }

  /**
   * determines if remote exists.
   * @param {string} url - the remote repo url
   * @returns {Promise<boolean>} true if exists
   */
  static async doesRemoteRepoExist(url) {
    let exists = true;

    try {
      let data = await getRemoteRepoHead(url);
      exists = !! data;
    } catch (e) {
      exists = false;
    }
    return exists;
  }

  /**
   * Initializes a new repository with fallback to support for older git versions if newer features are not supported
   * @param {string} dir - the file path to the local repository
   * @param {array|object|null} options
   * @return {Promise<void>}
   */
  static async init(dir, options = null) {
    try {
      await Repo.initSub_(dir, options);
    } catch (err) {
      if (!usingOlderVersion && err === GIT_ERROR_UNSUPPORTED_INITIAL_BRANCH ) {
        console.log(`Repo.init() - older git init does not support setting default branch`);
        usingOlderVersion = true;
        await Repo.initSub_(dir, options);
      } else {
        throw (err);
      }
    }
  }

  /**
   * init sub function that sets options based on initial branch features support by the git version
   * @param {string} dir - the file path to the local repository
   * @param {array|object|null} options
   * @return {Promise<void>}
   */
  static async initSub_(dir, options = null) {
    const options_ = usingOlderVersion ? {} : options || { '--initial-branch': defaultBranch }; // set options based on git version
    await Repo.initLowLevel_(dir, options_);

    if (usingOlderVersion) { // use fallback code for older git versions
      let { noCommitsYet } = await getDefaultBranch(dir);

      if (noCommitsYet) { // make a commit so we can change branch name
        console.log(`Repo.initSub() - no commits yet, so need to commit so we can identify current branch`);
        const repo = await Repo.open(dir);
        await repo.save('first save');
        const defaultInitialBranch = options?.['--initial-branch'] || defaultBranch;
        const currentBr = await getCurrentBranch(dir);
        const currentBranch = currentBr.current;

        if (defaultInitialBranch !== currentBranch) {
          console.log(`Repo.initSub() - older git init and no commits yet, changing branch name from ${currentBranch} to ${defaultInitialBranch}`);
          await renameBranch(dir, currentBranch, defaultInitialBranch);
        }
      }
    }
  }

  /**
   * low level function to Initialize a new repository
   * @param {string} dir - the file path to the local repository
   * @param {array|object|null} options
   * @return {Promise<void>}
   */
  static initLowLevel_(dir, options = null) {
    const repo = GitApi(dir);
    return new Promise((resolve, reject) => {
      repo.init(err => {
        if (err) {
          err = convertGitErrorMessage(err);
          console.warn('Repo.init() - ERROR', err);
          reject(err);
        } else {
          resolve();
        }
      }, options);
    });
  }

  /**
   * Clones a remote repository, throws exception on error
   * @param {string} url - the remote repository to be cloned
   * @param {string} dest - the local destination of the repository
   * @return {Promise<void>}
   */
  static clone(url, dest) {
    const repo = GitApi(dest);
    return new Promise((resolve, reject) => {
      repo.mirror(url, dest, err => {
        if (err) {
          fs.removeSync(dest);
          console.warn('Repo.clone() - ERROR', err);
          reject(convertGitErrorMessage(err, url));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Pushes commits to a remote repository, throws exception on error
   * @param {string} [remote="origin"] - the name of the remote
   * @param {string} [branch="master"] - the branch to push
   * @return {Promise<void>}
   */
  push(remote = 'origin', branch = defaultBranch) {
    return new Promise(async (resolve, reject) => {
      try {
        const repoName = await getRepoNameInfo(this.dir, remote);
        const response = await pushNewRepo(this.dir, this.user, repoName.name, branch);

        if (response) { // TRICKY: we get a response if there was an error
          reject(convertGitErrorMessage(response, this.url));
        } else { // if null then no error
          resolve(response);
        }
      } catch (e) {
        console.warn('Repo.push() - ERROR', e);
        reject(e);
      }
    });
  }

  /**
   * Adds a new remote endpoint to this repo.
   * If the remote name already exists it will be overwritten.
   * @param {string} url - the remote repository url
   * @param {string} [name="origin"] - the local remote alias
   * @return {Promise<void>}
   */
  addRemote(url, name = 'origin') {
    return new Promise(async (resolve, reject) => {
      try {
        this.url = url;
        const oldUrl = await this.getRemote(name);

        if (oldUrl) {
          await this.removeRemote(name).catch(() => {}); // clear after deletion
        }
        await saveRemote(this.dir, name, url);
        resolve();
      } catch (e) {
        console.warn('Repo.addRemote() - git ERROR', e);
        reject(e);
      }
    });
  }

  /**
   * Checks if there are any file changes.
   * Paths can be ignored from this check which is helpful for constantly changing files like the current context id.
   * WARNING: this will be slow if you have lots of files
   * @param {array} [ignored=[]] - an array of path expressions that will excluded from the check.
   * @returns {Promise<void>} the status
   */
  isDirty(ignored = []) {
    const repo = GitApi(this.dir);
    return new Promise((resolve, reject) => {
      repo.status((err, data) => {
        if (err) {
          console.warn('Repo.isDirty() - git status ERROR', err);
          reject(err);
        } else {
          let dirty = false;

          if (!data) {
            const message = 'Repo.isDirty() - git status empty ERROR';
            console.warn(message);
            reject(message);
          } else {
            const checks = ['modified', 'not_added', 'deleted' ];

            for (let i = 0, l = checks.length; i < l; i++) {
              const check = checks[i];
              dirty = Repo.hasChangedFilesForCheck(data, check, ignored);

              if (dirty) {
                break;
              }
            }
            resolve(dirty);
          }
        }
      });
    });
  }

  /**
   * check status data to see if there are entries under check.  Skip ignored folders
   * @param {Object} data - status data to check
   * @param {String} check - key of check
   * @param {array} ignored - files to ignore
   * @return {boolean}
   */
  static hasChangedFilesForCheck(data, check, ignored) {
    let changed = false;
    let length = data[check] && data[check].length;

    if (length) {
      if (ignored.length) {
        for (let j = 0, jLen = ignored.length; j < jLen; j++) {
          const ignore = ignored[j];
          const pos = data[check].indexOf(ignore);

          if (pos >= 0) {
            data[check].splice(pos, 1); // remove match
          }
        }
        length = data[check].length; // update length
      }

      if (length) {
        console.log(`hasChangedFilesForCheck(%{check}) - failed`, data[check]);
        changed = true;
      }
    }
    return changed;
  }

  /**
   * Removes a named remote from this repo.
   * @param {string} [name="origin"] - the locale remote alias
   * @return {Promise<void>}
   */
  removeRemote(name = 'origin') {
    return clearRemote(this.dir, name);
  }

  /**
   * returns repo info
   * @param {array|object|null} options
   * @return {Promise<{owner: String, name: String, full_name: String, host: String, url: String}|null>}
   */
  async revParse(options) {
    const repo = GitApi(this.dir);
    const data = await new Promise((resolve, reject) => {
      try {
        repo.revparse(options,(err, data) => {
          if (err) {
            err = convertGitErrorMessage(err);

            if (err !== GIT_ERROR_AMBIGUOUS_HEAD) {
              console.warn('Repo.revParse() - ERROR', err);
            }
            reject(err);
          } else {
            resolve(data);
          }
        });
      } catch (err) {
        console.warn('Repo.revParse() - EXCEPTION', err);
        reject(convertGitErrorMessage(err));
      }
    });

    return data;
  }

  /**
   * gets list of local branches
   * @return {Promise<object>}
   */
  async branchLocal() {
    const repo = GitApi(this.dir);
    const data = await new Promise((resolve, reject) => {
      try {
        repo.branchLocal((err, data) => {
          if (err) {
            console.warn('Repo.branchLocal() - ERROR', err);
            reject(convertGitErrorMessage(err));
          } else {
            resolve(data);
          }
        });
      } catch (err) {
        console.warn('Repo.branchLocal() - EXCEPTION', err);
        reject(convertGitErrorMessage(err));
      }
    });

    return data;
  }

  /**
   * runs branch commands
   * @param {array|object|null} options
   * @return {Promise<object>}
   */
  async branch(options) {
    const repo = GitApi(this.dir);
    const data = await new Promise((resolve, reject) => {
      try {
        repo.branch(options,(err, data) => {
          if (err) {
            console.warn('Repo.branch() - ERROR', err);
            reject(convertGitErrorMessage(err));
          } else {
            resolve(data);
          }
        });
      } catch (err) {
        console.warn('Repo.branch() - EXCEPTION', err);
        reject(convertGitErrorMessage(err));
      }
    });

    return data;
  }

  /**
   * Returns information regarding the registered remote
   * @param {string} [name="origin"] - the name of the remote
   * @returns {Promise<null|
   *   {
   *    owner: String,
   *    name: String,
   *    full_name: String,
   *    host: String,
   *    url: String
   *   }
   * >} the url of the remote
   */
  async getRemote(name = 'origin') {
    let remote = await getSavedRemote(this.dir, name);

    if (remote) { // if found get url from remote object
      return Repo.parseRemoteUrl(remote.refs.push || remote.refs.fetch);
    }
    return null;
  }

  /**
   * Adds a file to the git index.
   * If the file has been deleted it will be removed from the index.
   * @param {string} filepath - the relative path to the file/folder being added.
   * @returns {Promise<void>}
   */
  add(filepath) {
    const repo = GitApi(this.dir);
    return new Promise((resolve, reject) => {
      repo.add(filepath, err => {
        if (err) {
          console.warn('Repo.add() - ERROR', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * checkout branch
   * @param {string} branch
   * @param {array|object|null} options
   * @return {Promise<unknown>}
   */
  checkout(branch, options = {}) {
    const repo = GitApi(this.dir);
    return new Promise((resolve, reject) => {
      repo.checkout(branch, options, err => {
        if (err) {
          console.warn('Repo.checkout() - ERROR', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Saves all pending changes to the repo
   * @param {string} message - the commit message
   * @return {Promise<void>}
   */
  async save(message) {
    doingSave = true;

    try {
      const repo = GitApi(this.dir);

      await new Promise((resolve, reject) => {
        repo.save(this.user, message, '.', err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (e) {
      console.warn('Repo.save() - ERROR', e);
      doingSave = false; // need to do here since throw will skip finally block
      throw (e);
    } finally {
      doingSave = false;
    }
  }

  /**
   * Similar to save, but prevents overlapping saves
   * @param {string} message - the commit message
   * @return {Promise<boolean>} true if save started
   */
  async saveDebounced(message) {
    let startSave = !doingSave; // if already saving then we don't start

    if (startSave) {
      await this.save(message);
    }
    return startSave;
  }
}

/**
 * @description Converts git error messages to human-readable error messages for tC users
 * @param {string} err - the git error message
 * @param {string} link - The url of the git repo
 * @returns {string} - The human-readable error message
 */
export function convertGitErrorMessage(err, link) {
  console.warn('convertGitErrorMessage()', { err, link });

  if (typeof err !== 'string') {
    err = err?.toString();
  }

  let errMessage = GIT_ERROR_UNKNOWN_PROBLEM + ': ' + err; // default message

  // 'unknown option `initial-branch=master'
  if (err.includes('unknown option `initial-branch')) {
    errMessage = GIT_ERROR_UNSUPPORTED_INITIAL_BRANCH;
  } else if (err.includes('ambiguous argument \'HEAD\'')) {
    errMessage = GIT_ERROR_AMBIGUOUS_HEAD;
  } else if (err.includes('repo is archived')) {
    errMessage = GIT_ERROR_REPO_ARCHIVED;
  } else if (err.includes('fatal: unable to access')) {
    errMessage = GIT_ERROR_UNABLE_TO_CONNECT;
  } else if (err.includes('fatal: The remote end hung up')) {
    errMessage = GIT_ERROR_UNABLE_TO_CONNECT;
  } else if (err.includes('Failed to load')) {
    errMessage = GIT_ERROR_UNABLE_TO_CONNECT;
  } else if (err.includes('fatal: repository') && err.includes('not found')) {
    errMessage = GIT_ERROR_PROJECT_NOT_FOUND + ': \'' + link + '\'';
  } else if (err.includes('Cloning into') && err.includes('fatal: could not read Username for') && err.includes('Device not configured')) {
    // TRICKY: get above error on MacOS Monterey if user is not in git configuration and project is not found.
    //    For some reason it prompts for username even though this is an unauthenticated clone.
    errMessage = GIT_ERROR_PROJECT_NOT_FOUND + ': \'' + link + '\'';
  } else if (err.includes('error: failed to push some refs')) {
    errMessage = GIT_ERROR_PUSH_NOT_FF;
  }
  console.warn('convertGitErrorMessage() returning message:', errMessage);
  return errMessage;
}

/**
 * get the default branch for repo folder
 * @param {string} repoFolder
 * @return {Promise<{noCommitsYet: boolean, error: null, results: null}>}
 */
export async function getDefaultBranch(repoFolder) {
  const repo = await Repo.open(repoFolder);
  let branch = null;
  let error = null;
  let noCommitsYet = false;

  try {
    // git rev-parse --abbrev-ref HEAD
    branch = await repo.revParse([ '--abbrev-ref', 'HEAD' ]);
  } catch (e) {
    error = e?.toString();
    noCommitsYet = error === GIT_ERROR_AMBIGUOUS_HEAD;
  }
  return {
    branch,
    error,
    noCommitsYet,
  };
}

/**
 * checks if there is a branch in the repo matching branchName
 * @param {string} repoFolder
 * @param {string} branchName
 * @return {Promise<{exists: boolean, error: string|null}>}
 */
export async function doesBranchExist(repoFolder, branchName) {
  const repo = await Repo.open(repoFolder);
  let exists = false;
  let error = null;

  try {
    const data = await repo.branchLocal();

    for (const item of data?.all || []) {
      if (item === branchName) { // check if match
        exists = true;
        break;
      }
    }
  } catch (e) {
    error = e?.toString();
  }
  return {
    exists,
    error,
  };
}

/**
 * gets the current branch name
 * @param {string} repoFolder
 * @return {Promise<{current: *, error: null}>}
 */
export async function getCurrentBranch(repoFolder) {
  const repo = await Repo.open(repoFolder);
  let error = null;
  let data = null;

  try {
    data = await repo.branchLocal();
  } catch (e) {
    error = e?.toString();
  }
  return {
    current: data?.current,
    error,
  };
}

/**
 * rename a branch from oldBranchName to newBranchName
 * @param {string} repoFolder
 * @param {string} oldBranchName
 * @param {string} newBranchName
 * @return {Promise<{success: boolean, error: null}>}
 */
export async function renameBranch(repoFolder, oldBranchName, newBranchName) {
  const repo = await Repo.open(repoFolder);
  let exists = false;
  let error = null;

  try {
    // branch -m old-name new-name
    await repo.branch(['-m', oldBranchName, newBranchName]);
    const data = await repo.branchLocal();

    for (const item of data?.all || []) {
      if (item === oldBranchName) {
        console.warn(`renameBranch() - old branch ${oldBranchName} still exists`);
      }

      if (item === newBranchName) {
        exists = true;
      }
    }
  } catch (e) {
    error = e?.toString();
  }

  if (!exists) {
    console.warn(`renameBranch() - rename branch ${oldBranchName} to ${newBranchName} FAILED`);
  } else {
    // git branch --set-upstream-to <remote-branch>
    await repo.branch(['--set-upstream-to', newBranchName]);
  }
  return {
    success: exists,
    error,
  };
}

/**
 * creates a new branch that is a copy of the current branch
 * @param {string} repoFolder
 * @param {string} branchName
 * @return {Promise<void>}
 */
export async function createNewBranch(repoFolder, branchName) {
  const repo = await Repo.open(repoFolder);
  await repo.branch([branchName]); // create new branch
  await repo.checkout(branchName); // change to new branch
}

/**
 * change the branch to repoFolder
 * @param {string} repoFolder
 * @param {string} branchName
 * @return {Promise<void>}
 */
export async function changeBranch(repoFolder, branchName) {
  const repo = await Repo.open(repoFolder);
  await repo.checkout(branchName);
}

/**
 * makes sure that we are working in branchName.  Handles these cases:
 * - if there is no branch name, we save changes (a commit in case there has not been any commits yet) and then we check the current branch name again
 * - if current branch matches branchName, we do nothing
 * - if current branch does not match branchName, we check if there is already a branch with branchName:
 *   - if there is already a branch with branchName, then we save changes and change the current branch to branchName
 *   - if there is not a branch with branchName, then we save changes and rename the current branch to branchName
 * @param {string} repoFolder
 * @param {string} branchName
 * @return {Promise<{success: boolean, error: null|string, renamed: boolean}>}
 */
export async function makeSureCurrentBranchHasName(repoFolder, branchName) {
  let success = false;
  let currentBranch = null;
  let saved = false;
  let renamed = false;
  let error = null;

  try {
    let currentBr = await getCurrentBranch(repoFolder);
    currentBranch = currentBr.current;

    if (!currentBranch) {
      const repo = await Repo.open(repoFolder);
      await repo.save('initial save');
      currentBr = await getCurrentBranch(repoFolder);
      currentBranch = currentBr.current;
      saved = true;
    }

    if (currentBranch === branchName) {
      console.log(`makeSureCurrentBranchHasName(${branchName} - already in this branch, nothing to do`);
      success = true;
    } else {
      let { exists } = await doesBranchExist(repoFolder, branchName);

      if (exists) {
        console.warn(`makeSureCurrentBranchHasName(${branchName}) - already exists and is not current branch`);

        if (!saved) {
          const repo = await Repo.open(repoFolder);
          // save changes before changing branch
          await repo.save(`save before changing to ${branchName}`);
        }

        // change to branch
        await changeBranch(repoFolder, branchName);
        const currentBr = await getCurrentBranch(repoFolder);
        success = currentBr.current === branchName;
      } else {
        console.warn(`makeSureCurrentBranchHasName() - branch name needs to be renamed from ${currentBranch} to ${branchName}`);

        if (!saved) {
          // save changes before rename
          const repo = await Repo.open(repoFolder);
          await repo.save('save before rename');
        }

        let brRename = await renameBranch(repoFolder, currentBranch, branchName);
        success = brRename.success;
        renamed = true;

        if (success) {
          let currentBr = await getCurrentBranch(repoFolder);

          if (currentBr.current !== branchName) {
            console.error(`makeSureCurrentBranchHasName() - current branch should be ${branchName}, but is ${currentBr.current}`);
            success = false;
          }
        }
      }
    }
  } catch (e) {
    console.error(`makeSureCurrentBranchHasName() - ERROR renaming to ${branchName}`);
    success = false;
  }
  return {
    success,
    renamed,
    error,
  };
}
