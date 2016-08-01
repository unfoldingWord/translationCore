function syncToGit() {
  const git = require('../GitApi.js');
  const api = window.ModuleApi;
  const CoreActions = require('../../../actions/CoreActions.js');
  const CoreStore = require('../../../stores/CoreStore.js');
  const pathFinder = require('path');
  const path = api.getDataFromCommon('saveLocation');
  const user = CoreStore.getLoggedInUser();

  if (user) {
    git(path).save('Updating with Door43', path, function() {
        var manifest = api.getDataFromCommon('tcManifest');
        if (manifest.repo) {
          var urlArray = manifest.repo.split('.');
          urlArray.pop();
          var finalPath = urlArray.pop().split('/');
          var repoPath = finalPath[1] + '/' + finalPath[2];
          var remote = 'https://' + user.token + '@git.door43.org/' + repoPath + '.git';
          git(path).update(remote, 'master', false, function(err){
            if (err) {
              var Confirm = {
                title: 'You don\'t have permission to push to this repository.',
                content: "Would you like to create a new Door43 project?",
                leftButtonText: "No",
                rightButtonText: "Yes"
              }
              api.createAlert(Confirm, function(result){
                if(result == 'Yes') {
                  const projectName = path.split(pathFinder.sep);
                  gogs(user.token).createRepo(user, projectName.pop()).then(function(repo) {
                    var newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';
                    git(path).update(newRemote, 'master', true, function(){});
                  });
                }
              });
            } else {
              alert('Update succesful');
            }
          });
        } else {
              var Create = {
                title: 'There is no associated repository with this project.',
                content: "Would you like to create a new Door43 project?",
                leftButtonText: "No",
                rightButtonText: "Yes"
              }
              api.createAlert(Create, function(result){
                if(result == 'Yes') {
                  const projectName = path.split(pathFinder.sep);
                  var nameOfProject = projectName.pop();
                  var repoPath = user.username + '/' + nameOfProject;
                  var remote = 'https://' + user.token + '@git.door43.org/' + repoPath + '.git';
                  git(path).update(remote, 'master', true, function(err){
                    if (err) {
                      gogs(user.token).createRepo(user, nameOfProject).then(function(repo) {
                        var newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';
                        git(path).update(newRemote, 'master', true, function(){
                          alert('Update succesful');
                        });
                      });
                    } else {
                      alert('Update succesful');
                    }
                  });
                }
              });
        }
    });
  } else {
    alert('Login then try again');
    CoreActions.updateLoginModal(true);
  }
}

module.exports = syncToGit;
