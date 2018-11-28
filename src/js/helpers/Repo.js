import * as git from "isomorphic-git";
import fs from "fs-extra";
import globby from "globby";

git.plugins.set("fs", fs);

const projectRegExp = new RegExp(
  /^https?:\/\/git.door43.org\/([^/]+)\/([^/]+)\.git$/);

/**
 * Generates credentials from the user object
 * @param {object} user
 * @returns {*}
 */
function makeCredentials(user) {
  if (user && user.username && (user.password || user.token)) {
    return {
      username: user.username,
      password: user.password,
      token: user.token
    };
  }
  return {};
}

/**
 * Generates the commit author from the user object
 * @param user
 * @returns {{name: string, email: string}}
 */
function makeAuthor(user) {
  let name = "translationCore User";
  let email = "Unknown";
  if (user) {
    name = user.full_name || user.username || name;
    email = user.email || email;
  }
  return {
    name, email
  };
}

/**
 * Provides a layer of abstraction over git repo management.
 */
export default class Repo {

  /**
   * @param {string} dir - the file path to the local repository
   * @param {object} [user] - the user object that contains names, passwords, and tokens
   */
  constructor(dir, user = {}) {
    this.dir = dir;
    this.user = user;
  }

  /**
   * Determines if a url is a DCS or Door43 URL and returns the proper git URL for cloning
   * @param {string} url - The url of the git.door43.org repo or rendered Door43 HTML page
   * @returns {string|null} - The sanitized url or else null if invalid
   */
  static sanitizeRemoteUrl(url) {
    if (!url || !url.trim) return null;

    url = url.trim().replace(/\/?$/, ""); // remove white space and right trailing /'s
    const liveDoor43Url = new RegExp(
      /^https?:\/\/((live\.|www\.)?door43.org\/u)\/([^/]+)\/([^/]+)/);
    const gitDoor43Url = new RegExp(
      /^https?:\/\/((git.)door43.org)\/([^/]+)\/([^/]+)/);
    let match = liveDoor43Url.exec(url);
    if (!match) {
      match = gitDoor43Url.exec(url);
      if (match) {
        const extra = url.substr(match.index + match[0].length);
        if (extra && (extra !== "/")) { // make sure not trying to point into contents of repo
          match = null;
        }
      }
    }
    if (match) {
      // Return a proper git.door43.org URL from the match
      let userName = match[3];
      let repoName = match[4];
      repoName = (repoName && repoName.replace(".git", "")) || "";
      return "https://git.door43.org/" + userName + "/" + repoName + ".git";
    }
    return null;
  }

  /**
   * Parses a remote url and returns a object of information about the project.
   * The url must be a properly formatted git url.
   * @param {string} url
   * @returns {object|null}
   */
  static parseRemoteUrl(url) {
    if (!url) return null;

    let matches = projectRegExp.exec(url);
    if (!matches) {
      return null;
    } else {
      return {
        owner: matches[1],
        name: matches[2],
        full_name: `${matches[1]}/${matches[2]}`,
        host: "https://git.door43.org/"
      };
    }
  }

  /**
   * List a remote servers branches, tags, and capabilities.
   * @param {string} url - the remote repo url
   * @returns {Promise<object>}
   */
  static async getRemoteInfo(url) {
    if(!url) return null;

    return await git.getRemoteInfo({
      url,
      ...makeCredentials(this.user)
    });
  }

  /**
   * Initializes a new repository
   * @param {string} dir - the file path to the local repository
   * @return {Promise<void>}
   */
  static async init(dir) {
    await git.init({ dir });
  }

  /**
   * Clones a remote repository
   * @param {string} url - the remote repository to be cloned
   * @param {string} dest - the local destination of the repository
   * @return {Promise<void>}
   */
  static async clone(url, dest) {
    const config = {
      dir: dest,
      url,
      ref: "master",
      singleBranch: true,
      ...makeCredentials(this.user)
    };

    await git.clone(config);
  }

  /**
   * Pushes commits to a remote repository
   * @param {string} [remote="origin"] - the name of the remote
   * @param {string} [branch="master"] - the branch to push
   * @return {Promise<PushResponse>} - the error code if there is one
   */
  async push(remote = "origin", branch = "master") {
    return await git.push({
      dir: this.dir,
      remote,
      ref: branch,
      ...makeCredentials(this.user)
    });
  }

  /**
   * Adds a new remote endpoint to this repo.
   * If the remote name already exists it will be overwritten.
   * @param {string} url - the remote repository url
   * @param {string} [name="origin"] - the local remote alias
   * @return {Promise<void>}
   */
  async addRemote(url, name = "origin") {
    await git.addRemote({
      dir: this.dir,
      remote: name,
      url: url,
      force: true
    });
  }

  /**
   * Removes a named remote from this repo.
   * @param {string} [name="origin"] - the locale remote alias
   * @return {Promise<void>}
   */
  async removeRemote(name = "origin") {
    await git.deleteRemote({
      dir: this.dir,
      remote: name
    });
  }

  /**
   * Returns information regarding the registered remote
   * @param {string} [name="origin"] - the name of the remote
   * @returns {Promise<object>} the url of the remote
   */
  async getRemote(name = "origin") {
    const remotes = await git.listRemotes({
      dir: this.dir
    });
    for (const r of remotes) {
      if (r.remote === name) {
        return {
          ...r,
          ...Repo.parseRemoteUrl(r.url)
        };
      }
    }
    return null;
  }

  /**
   * Adds a file to the git index
   * @param {string} filepath - the relative path to the file being added.
   * @returns {Promise<void>}
   */
  async add(filepath) {
    await git.add({
      dir: this.dir,
      filepath
    });
  }

  /**
   * Adds all files to the git index
   * @returns {Promise<void>}
   */
  async addAll() {
    const paths = await globby(["./**", "./**/*"], {
      cwd: this.dir,
      gitignore: true,
      dot: true,
      ignore: [".git"]
    });
    for (let i = 0, size = paths.length; i < size; i++) {
      await this.add(paths[i]);
    }
  }

  /**
   * Commits added files
   * @param {string} message - the commit message
   * @param {object} [author] - details about the author.
   * @returns {Promise<void>}
   */
  async commit(message, author = undefined) {
    await git.commit({
      dir: this.dir,
      message,
      author
    });
  }

  /**
   * Saves all pending changes to the repo
   * @param {string} message - the commit message
   * @return {Promise<void>}
   */
  async save(message) {
    await this.addAll();
    await this.commit(message, makeAuthor(this.user));
  }
}
