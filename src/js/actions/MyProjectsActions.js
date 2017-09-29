import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
import moment from 'moment';
import usfmHelper from 'usfm-js';
// helpers
import * as usfmHelpers from '../helpers/usfmHelpers';
//helpers
// contant declarations
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');
const OLD_DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');
/**
 * @description - Will get the directories inside of a directory and return them
 * @return {array} projectDirectories
 */
export function getProjectDirectories() {
  const directories = fs.readdirSync(DEFAULT_SAVE);
  const projectDirectories = {};
  directories.forEach(directory => {
    // we need to only get files not directories
    const isDirectory = fs.lstatSync(path.join(DEFAULT_SAVE, directory)).isDirectory();
    // if it is a directory check to see if it has a manifest
    let isProject, usfmPath = false;
    if (isDirectory) {
      const manifestPath = path.join(DEFAULT_SAVE, directory, 'manifest.json');
      isProject = fs.existsSync(manifestPath);
      if (!isProject) {
        usfmPath = usfmHelpers.isUSFMProject(path.join(DEFAULT_SAVE, directory));
      }
    }
    if (isProject || usfmPath) {
      projectDirectories[directory] = {
        usfmPath
      };
    }
  });
  return projectDirectories;
}


/**
 *  @description: With the list of project directories, generates an array of project detail objects
 */
export function getMyProjects() {
  return ((dispatch, getState) => {
    migrateResourcesFolder();
    const state = getState();
    const { projectDetailsReducer } = state;

    /**@type {{directoryName: {usfmPath: (false|string)}}} */
    const projectFolders = getProjectDirectories();
    // generate properties needed
    let projects = [];
    Object.keys(projectFolders).forEach(folder => {
      const projectName = folder;
      const projectSaveLocation = path.join(DEFAULT_SAVE, folder);
      const projectDataLocation = path.join(projectSaveLocation, '.apps', 'translationCore');
      let accessTime = "", accessTimeAgo = "Never Opened";
      if (fs.existsSync(projectDataLocation)) {
        accessTime = fs.statSync(projectDataLocation).atime;
        accessTimeAgo = moment().to(accessTime);
      }
      let bookAbbr;
      let bookName;
      let target_language = {};

      try {
        //Basically checks if the project object is a usfm one
        if (!projectFolders[projectName].usfmPath) {
          const manifestPath = path.join(DEFAULT_SAVE, folder, 'manifest.json');
          const manifest = fs.readJsonSync(manifestPath);
          target_language = manifest.target_language;
          bookAbbr = manifest.project.id;
          bookName = manifest.project.name;
        } else {
          const usfmText = fs.readFileSync(projectFolders[projectName].usfmPath).toString();
          const usfmObject = usfmHelper.toJSON(usfmText);
          let usfmHeadersObject = usfmHelpers.getUSFMDetails(usfmObject);
          bookName = usfmHeadersObject.book.name;
          target_language.id = usfmHeadersObject.language.id;
          target_language.name = usfmHeadersObject.language.name;
        }

        const isSelected = projectSaveLocation === projectDetailsReducer.projectSaveLocation;
        projects.push({
          projectName,
          projectSaveLocation,
          accessTimeAgo,
          bookAbbr,
          bookName,
          target_language,
          isSelected
        });
      } catch (e) {
        console.warn('invalid project in tC folder...removing');
        fs.removeSync(projectSaveLocation);
      }
    });
    dispatch({
      type: consts.GET_MY_PROJECTS,
      projects: projects
    });
  });
}

export function migrateResourcesFolder() {
  const directories = fs.readdirSync(OLD_DEFAULT_SAVE);
  for (var folder of directories) {
    let isDirectory = fs.lstatSync(path.join(OLD_DEFAULT_SAVE, folder)).isDirectory();
    let hasManifest = fs.existsSync(path.join(OLD_DEFAULT_SAVE, folder, 'manifest.json'));
    let notDuplicate = !(fs.existsSync(path.join(DEFAULT_SAVE, folder)));
    if (folder != 'resources'
      && folder != 'projects'
      && isDirectory
      && hasManifest
      && notDuplicate) {
      fs.moveSync(path.join(OLD_DEFAULT_SAVE, folder), path.join(DEFAULT_SAVE, folder));
    }
  }
}
