const git = require('../GitApi.js');
import path from 'path-extra';
import gogs from '../login/GogsApi.js';

function uploadProject(user, projectPath){
  git(projectPath).save(user, 'Uploading to Door43', projectPath, () =>{
    gogs(user.token).createRepo(user, projectPath).then(repo => {
      var newRemote = 'https://' + user.username + ":" + user.password + '@git.door43.org/' + repo.full_name + '.git';
      git(projectPath).push(newRemote, "master", err => {
        throw(err);
      })
    })
  })
}

export default uploadProject
