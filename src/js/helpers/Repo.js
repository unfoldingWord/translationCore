import * as git from "isomorphic-git";
import fs from "fs-extra";
import path from "path-extra";
import klaw from "klaw";
import ignore from "ignore";

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
 * Checks if a string matches any of the expressions
 * @param {string} string - the string to compare
 * @param {array} expressions - an array of expressions to compare against the string
 * @returns {boolean} true if any of the expressions match the string
 */
export function isMatched(string, expressions) {
  for(const expr of expressions) {
    if(expr === string || new RegExp(expr).exec(string)) {
      return true;
    }
  }
  return false;
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
 * Recursively returns an array of file paths within the directory.
 * .gitignore is obeyed and the .git dir is always ignored.
 *
 * This is not the fastest implementation but it should be good enough for for our use case.
 * Also this does not support nested .gitignores
 * @param {string} dir - the directory being read
 * @return {Promise<string[]>} an array of relative file paths within the directory
 */
export function readGitDir(dir) {
  return new Promise((resolve, reject) => {
    const paths = [];
    const ig = ignore().add([".git"]);

    // load .gitignore
    const ignorePath = path.join(dir, ".gitignore");
    if (fs.pathExistsSync(ignorePath)) {
      ig.add(fs.readFileSync(ignorePath).toString());
    }

    // filter files
    const filter = item => {
      const file = path.relative(dir, item);
      return !ig.ignores(file);
    };

    // scan directory
    klaw(dir, { filter }).
      on("data", item => paths.push(path.relative(dir, item.path))).
      on("error", (err, item) => {
        reject(err.message, item.path);
      }).
      on("end", () => {
        // remove directories from list
        resolve(paths.filter(
          file => !fs.statSync(path.join(dir, file)).isDirectory()));
      });
  });
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
   * @returns {Promise<Repo>}
   */
  static async open(dir, user = {}) {
    const ok = await Repo.isRepo(dir);
    if (!ok) {
      await Repo.init(dir);
    }
    return new Repo(dir, user);
  }

  /**
   * Checks if the directory is an initialized git repository.
   * @param {string} dir - the directory to inspect
   * @return {boolean} true if the repo has been initialized.
   */
  static async isRepo(dir) {
    const gitPath = path.join(dir, ".git");
    return await fs.pathExists(gitPath);
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
    if (!url) return null;

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
   * @param {string} [branch=master] - the branch to clone
   * @return {Promise<void>}
   */
  static async clone(url, dest, branch = "master") {
    const config = {
      dir: dest,
      url,
      ref: branch,
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
   * Lists all files in the git repo including ones that have been removed but not committed yet.
   * @returns {Promise<string>}
   */
  async list() {
    // files that git knows about
    const stagedFiles = await git.listFiles({
      dir: this.dir
    });
    // files that git may not know about
    const paths = await readGitDir(this.dir);

    // merge lists
    for (let i = 0, len = stagedFiles.length; i < len; i++) {
      if (paths.indexOf(stagedFiles[i]) === -1) {
        paths.push(stagedFiles[i]);
      }
    }
    return paths;
  }

  /**
   * Checks if there are any file changes.
   * Paths can be ignored from this check which is helpful for constantly changing files like the current context id.
   * WARNING: this will be slow if you have lots of files
   * @param {array} [ignored=[]] - an array of path expressions that will excluded from the check.
   * @returns {Promise<string>} the status
   */
  async isDirty(ignored = []) {
    const paths = await this.list();
    for (let i = 0, size = paths.length; i < size; i++) {
      if(isMatched(paths[i], ignored)) {
        // skip ignored paths
        continue;
      }
      const status = await this.status(paths[i]);
      if (["unmodified", "ignored"].indexOf(status) === -1) {
        return true;
      }
    }
    return false;
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
   * Adds a file to the git index.
   * If the file has been deleted it will be removed from the index.
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
   * Removes a file from the git index.
   * This will not delete a file from the disk.
   * @param {string} filepath - the relative path to the file being removed
   * @returns {Promise<void>}
   */
  async remove(filepath) {
    await git.remove({
      dir: this.dir,
      filepath
    });
  }

  /**
   * Retrieves the status of a file.
   * If there are no commits in the repo this will assume the file has been added but not staged.
   * @param {string} filepath - the relative path of the file to stat.
   * @returns {Promise<string>}
   */
  async status(filepath) {
    try {
      return await git.status({
        dir: this.dir,
        filepath
      });
    } catch(e) {
      if(e.code === "ResolveRefError") {
        // TRICKY: if there are no commits we get a ref error
        return "*added";
      } else {
        // raise unhandled error
        throw e;
      }
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
    // remove deleted files
    const stagedFiles = await git.listFiles({
      dir: this.dir
    });
    for(let i = 0, len = stagedFiles.length; i < len; i ++) {
      const status = await this.status(stagedFiles[i]);
      if(status === "*deleted") {
        await this.remove(stagedFiles[i]);
      }
    }
    // add all modifications and new files
    await this.add(".");
    // commit staged files
    await this.commit(message, makeAuthor(this.user));
  }
}
