import Repo from '../Repo';
import path from 'path-extra';
import ospath from 'ospath';
import fs from 'fs-extra';
/**
* @description Clones the project of either a DCS or Door43 URL into the imports directory
* @param {string} link - The url of the git.door43.org repo or rendered Door43 HTML page
* @returns {Promise}
*/
export function clone (link) {
  return new Promise((resolve, reject) => {
    const gitUrl = Repo.sanitizeRemoteUrl(link); // gets a valid git URL for git.door43.org if possible, null if not
    if(gitUrl === null) {
      return reject('The URL ' + link + ' does not reference a valid project');
    }

    let project = Repo.parseRemoteUrl(gitUrl);
    let savePath = path.join(ospath.home(), 'translationCore', 'imports', project.name);
    if (!fs.existsSync(savePath)) {
      fs.ensureDirSync(savePath);
    } else {
      return reject("Project has already been imported.");
    }

    return Repo.clone(gitUrl, savePath).then(() => {
      resolve(project.name);
    }).catch((e) => {
      reject(e);
    });
  });
}
