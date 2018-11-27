import * as git from "isomorphic-git";
import fs from "fs-extra";
import globby from "globby";

git.plugins.set("fs", fs);

/**
 * Generates credentials from the user object
 * @param user
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
   * @param {object} [user] - the git user
   */
  constructor(dir, user = {}) {
    this.dir = dir;
    this.user = user;
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
   * @param {string} remoteName - the name of the remote
   * @param {string} [branch="master"] - the branch to push
   * @return {Promise<PushResponse>} - the error code if there is one
   */
  async push(remoteName, branch = "master") {
    return await git.push({
      dir: this.dir,
      remote: remoteName,
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
   * @param {string} name - the locale remote alias
   * @return {Promise<void>}
   */
  async removeRemote(name) {
    await git.deleteRemote({
      dir: this.dir,
      remote: name
    });
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
   * @return {Promise<>}
   */
  async save(message) {
    await this.addAll();
    await this.commit(message, makeAuthor(this.user));
  }
}
