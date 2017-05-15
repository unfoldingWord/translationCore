const git = require('../GitApi.js');
import path from 'path-extra';
import gogs from '../login/GogsApi.js';

function uploadProject(projectPath, user){
  git(projectPath).save(user, 'Uploading to Door43', projectPath, () => {
    gogs(user.token).createRepo(user, projectPath.split(path.sep).pop()).then(repo => {
      var newRemote = 'https://' + user.username + ":" + user.password + '@git.door43.org/' + repo.full_name + '.git';
      console.log(newRemote);
      git(projectPath).push(newRemote, "master", err => {
        console.log("were in the err callback " + err)
        throw(err)
      })
    }).catch(err => {
        throw(err)
    })
  })
}

export default uploadProject
