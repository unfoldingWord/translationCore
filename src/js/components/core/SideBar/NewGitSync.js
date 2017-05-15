const git = require('../GitApi.js');
import path from 'path-extra';
import gogs from '../login/GogsApi.js';

function uploadProject(user, projectPath){
  git(projectPath).save(user, 'Uploading to Door43', projectPath, () =>{
    gogs(user.token).createRepo(user, projectPath).then(repo => {
      git(projectPath).push(repo, "master", err => {
        throw(err);
      })
    })
  })
}

export default uploadProject
