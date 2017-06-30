import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
import moment from 'moment';
// actions
// contant declarations
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');


export function getDirectories(directory) {
  return fs.readdirSync(directory).filter( file =>
    fs.lstatSync(path.join(directory, file)).isDirectory()
  );
}

/**
 *  Reads projects from the fs in ~/translationCore/
 */
export function getMyProjects() {
  const folders = getDirectories(DEFAULT_SAVE);
  // filter to show folders with manifest
  const projectFolders = folders.filter( folder => {
    const manifestPath = path.join(DEFAULT_SAVE, folder, 'manifest.json');
    return fs.existsSync(manifestPath);
  });
  // generate properties needed
  const projects = projectFolders.map( folder => {
    const projectName = folder;
    const projectSaveLocation = path.join(DEFAULT_SAVE, folder);
    const projectDataLocation = path.join(projectSaveLocation, '.apps', 'translationCore');
    let accessTime = "", accessTimeAgo = "Never Opened";
    if (fs.existsSync(projectDataLocation)) {
      accessTime = fs.statSync(projectDataLocation).atime;
      accessTimeAgo = moment().to(accessTime);
    }
    const manifestPath = path.join(DEFAULT_SAVE, folder, 'manifest.json');
    const manifest = fs.readJsonSync(manifestPath);
    const { target_language } = manifest;
    const bookAbbr = manifest.project.id;
    const bookName = manifest.project.name;

    return {
      projectName,
      projectDataLocation,
      accessTimeAgo,
      bookAbbr,
      bookName,
      target_language
    }
  });
  return {
    type: consts.GET_MY_PROJECTS,
    projects: projects
  }
}
