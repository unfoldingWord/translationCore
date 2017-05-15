import path from 'path-extra';
import gogs from '../login/GogsApi.js';
import {updateManifest} from '../../../helpers/updateManifest';
// constants declaration
const git = require('../GitApi.js');

function syncToGit(projectPath, manifest, user, showAlert) {
  var alertError = console.error;
  console.error = console.errorold;
  if (user) {
    git(projectPath).save(user, 'Updating with Door43', projectPath, function() {
      if (manifest.repo) {
        var urlArray = manifest.repo.split('.');
        urlArray.pop();
        var finalPath = urlArray.join('.').split('/');
        var repoName = finalPath.pop();
        var userName = finalPath.pop();
        var repoPath = userName + '/' + repoName;
        var remote = 'https://' + user.token + '@git.door43.org/' + repoPath + '.git';
        var equalHistory = false;

        git(projectPath).update(remote, 'master', false, function(err) {
          if (err) {
            if(err.includes("rejected because the remote contains work")){
              showAlert("The project cannot be uploaded because there have been changes to the translation of "+repoName+" on your Door43 account")
            }
            var ask = 'You don\'t have permission to push to this repository.\nWould you like to create a new Door43 project?';
            var result = confirm(ask);
            if (result) {
              const projectName = repoName;
              gogs(user.token).createRepo(user, projectName).then(function(repo) {
                var newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';
                var remoteLink = 'https://git.door43.org/' + repo.full_name + '.git';
                updateManifest(projectPath, remoteLink);
                git(projectPath).update(newRemote, 'master', true, function(err){
                  if (err) {
                    git(projectPath).update(newRemote, 'master', false, function(){
                      console.error = alertError;
                    });
                  } else {
                    console.error = alertError;
                  }
                });
              });
            } else {
              console.error = alertError;
            }
          } else {
            console.error = alertError;
            showAlert("Your project was sucessfully uploaded and sync with your door43 account");
          }
        });
      } else {
        var ask = 'There is no associated repository with this translationCore project.\nWould you like to create a new Door43 project?'
        var result = confirm(ask);
        if (result) {
          const projectName = projectPath.split(path.sep);
          var nameOfProject = projectName.pop();
          nameOfProject = nameOfProject.replace(/[^A-Za-z-_\d]/g, '_')
          var repoPath = user.username + '/' + nameOfProject;
          var remote = 'https://' + user.token + '@git.door43.org/' + repoPath + '.git';
          var remoteLink = 'https://git.door43.org/' + repoPath + '.git';
          updateManifest(projectPath, remoteLink);
          git(projectPath).update(remote, 'master', true, function(err){
            if (err) {
              gogs(user.token).createRepo(user, nameOfProject).then(function(repo) {
                var newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';
                remoteLink = 'https://git.door43.org/' + repo.full_name + '.git';
                updateManifest(projectPath, remoteLink);
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
      }
    });
  } else {
    showAlert('Login then try again');
  }
}

module.exports = syncToGit;
