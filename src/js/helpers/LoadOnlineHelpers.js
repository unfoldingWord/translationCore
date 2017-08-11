import path from 'path';
import pathex from 'path-extra';
import fs from 'fs-extra';
import git from '../helpers/GitApi.js';

/**
* @description This function takes a url and opens it from a remote source.
* @param {string} url - The url that the project is found at
* @param {function} callback - The function to be run on complete
******************************************************************************/
export function openManifest(url, callback) {
  if (!url) {
    if (callback) {
      callback({type: "custom", text: 'No link specified'}, null, null)
    }
    return;
  }
  var splitUrl = url.split('.');
  if (splitUrl[splitUrl.length-1] !== 'git') {
    url+='.git';
  }

  var expression = new RegExp(/^https?:\/\/(git.door43.org|door43.org\/u)\/[^\/]+\/([^\/.]+).git$/);

  if (expression.test(url)) {
    var projectName = expression.exec(url)[2];
    var savePath = path.join(pathex.homedir(), 'translationCore','projects', projectName);
  } else {
    if (callback) {
      callback({type: "custom", text: 'The URL does not reference a valid project'}, null, url)
    }
    return;
  }

  fs.readdir(savePath, function(err, contents) {
    if (err) {
      fs.ensureDir(savePath, function() {
        runGitCommand(savePath, url, callback);
      });
    } else {
      if (callback)
        callback({type: "custom", text: 'The project you selected already exists. Reimporting existing projects is not currently supported.'}, savePath, url);
    }
  });
}

/**
* @description Runs the git command to clone a repo.
* @param {string} savePath - The location of the git repo
* @param {string} url - The url of the git repo
* @param {function} callback - The function to be run on complete
******************************************************************************/
export function runGitCommand(savePath, url, callback) {
  git(savePath).mirror(url, savePath, function(err) {
    if (err) {
      fs.removeSync(savePath);
      if (callback)
        callback({type: "custom", text: "Cannot clone repository"}, null, null);
    } else {
      try {
        fs.readFileSync(path.join(savePath, 'manifest.json'));
        if (callback)
          callback(null, savePath, url);
      } catch (error) {
        if (callback)
          callback({type: "custom", text: "Cannot read project files"}, savePath, null);
      }
    }
  });
}
