const git = require('../GitApi.js');
import path from 'path-extra';
import gogs from '../login/GogsApi.js';

function uploadProject(projectPath, user){
  return Promise.resolve(true).then(()=>{
    return git(projectPath).save(user, 'Uploading to Door43', projectPath, () => {
      return true
    })
  }).then(()=>{
    return gogs(user.token).createRepo(user, projectPath.split(path.sep).pop())
  }).then(repo => {
    var newRemote = 'https://' + user.username + ":" + user.password + '@git.door43.org/' + repo.full_name + '.git';
    return git(projectPath).push(newRemote, "master")
  })
}
export default uploadProject
