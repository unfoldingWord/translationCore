import path from 'path-extra';
import gogs from '../login/GogsApi.js';
import {updateManifest} from '../../../helpers/updateManifest';
// constants declaration
const git = require('../GitApi.js');

/**
 * @description
 * @param {string} projectPath - project path/directory in local file system.
 * @param {object} manifest - projects manifest file.
 * @param {object} user - userdata object that includes: fullname, token, avatar url etc.
 * @param {function} showAlert - callback that dispacthes a redux action to show an alert on the screen.
 */
function syncToGit(projectPath, manifest, user, showAlert) {
  var alertError = console.error;
  console.error = console.errorold;
  if (user) {
    git(projectPath).save(user, 'Uploading to Door43', projectPath, function() {
      if (manifest.repo) {
        var urlArray = manifest.repo.split('.');
        urlArray.pop();
        var finalPath = urlArray.join('.').split('/');
        var repoName = finalPath.pop();
        var userName = finalPath.pop();
        var repoPath = userName + '/' + repoName;
        var remote = 'https://' + user.token + '@git.door43.org/' + repoPath + '.git';
        git(projectPath).update(remote, 'master', false, err => {
          if (err) {
            // user doesn't have permission to push to this repository thus create a new Door43 project repo.
            const projectName = repoName;
            gogs(user.token).createRepo(user, projectName).then(repo => {
              var newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';
              var remoteLink = 'https://git.door43.org/' + repo.full_name + '.git';
              updateManifest(projectPath, remoteLink, showAlert);
              git(projectPath).update(newRemote, 'master', true, err => {
                if (err) {
                  git(projectPath).update(newRemote, 'master', false, () => {
                    console.error = alertError;
                  });
                } else {
                  console.error = alertError;
                }
              });
            });
          } else {
            console.error = alertError;
            showAlert("Your project was sucessfully uploaded and sync with your door43 account");
          }
        });
      } else {
        // There is no associated repository with this translationCore project thus a new Door43 project will be created
        const projectName = projectPath.split(path.sep);
        let nameOfProject = projectName.pop();
        nameOfProject = nameOfProject.replace(/[^A-Za-z-_\d]/g, '_')
        let repoPath = user.username + '/' + nameOfProject;
        let remote = 'https://' + user.token + '@git.door43.org/' + repoPath + '.git';
        let remoteLink = 'https://git.door43.org/' + repoPath + '.git';
        updateManifest(projectPath, remoteLink, showAlert);
        git(projectPath).update(remote, 'master', true, err => {
          if (err) {
            gogs(user.token).createRepo(user, nameOfProject).then(repo => {
              var newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';
              remoteLink = 'https://git.door43.org/' + repo.full_name + '.git';
              updateManifest(projectPath, remoteLink, showAlert);
              git(projectPath).update(newRemote, 'master', true, err => {
                if (err) {
                  git(projectPath).update(newRemote, 'master', false, err => {
                    if (!err) {
                      showAlert("Your project was sucessfully uploaded and sync with your door43 account");
                    }
                    console.error = alertError;
                  });
                } else {
                  console.error = alertError;
                  showAlert("Your project was sucessfully uploaded and sync with your door43 account");
                }
              });
            });
          } else {
            console.error = alertError;
            showAlert("Your project was sucessfully uploaded and sync with your door43 account");
          }
        });
      }
    });
  } else {
    showAlert('Login then try again');
  }
}

export default syncToGit;
