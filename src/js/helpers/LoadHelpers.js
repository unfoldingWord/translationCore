/* eslint-disable no-console */
import path from 'path-extra';
import * as fs from 'fs-extra';
// helpers
import * as usfmHelpers from './usfmHelpers';

const PACKAGE_SUBMODULE_LOCATION = path.join(__dirname, '../../../tC_apps');
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');

/**
 *
 * @param {string} directory - Directorty of the file to load, not the file name.
 * @param {string} file - The file name to load.
 */
export function loadFile(directory, file) {
  try {
    var manifest = fs.readJsonSync(path.join(directory, file));
    return manifest;
  }
  catch (e) {
    return null;
  }
}

/**
 * @description Stores the project path loaded into the default tC folder
 * location. If the project is exists in the default save location and it is
 * loaded from some place else, user will be prompted to overwrite it. Which results
 * in a deletion of the non-tC folder loaction project.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 */
export function saveProjectInHomeFolder(projectPath) {
  const parsedPath = path.parse(projectPath);
  const tCProjectsSaveLocation = path.join(DEFAULT_SAVE, parsedPath.base);

  if (!fs.existsSync(projectPath)) {
    return false;
  }
  if (fs.existsSync(tCProjectsSaveLocation)) {
    return tCProjectsSaveLocation;
  } else {
    let newPath = tCProjectsSaveLocation;
    if (usfmHelpers.isUSFMProject(projectPath)) {
      newPath = path.join(tCProjectsSaveLocation, parsedPath.name);
    }
    fs.copySync(projectPath, newPath);
    return tCProjectsSaveLocation;
  }
}
/** 
 * @description creates an array that has the data of each included tool and 'subtool'
 *
 * @param {object} dataObject - Package json of the tool being loaded,
 * meta data of what the tool needs to load.
 * @param {string} moduleFolderName - Folder path of the tool being loaded.
 */
export function createCheckArray(dataObject, moduleFolderName) {
  let modulePaths = [];
  try {
    if (!dataObject.name || !dataObject.version || !dataObject.title || !dataObject.main) {
      return;
    } else {
      modulePaths.push({ name: dataObject.name, location: moduleFolderName });
      for (let childFolderName in dataObject.include) {
        //If a developer hasn't defined their module in the corret way, this'll probably throw an error
        if (Array.isArray(dataObject.include)) {
          modulePaths.push({
            name: dataObject.include[childFolderName],
            location: path.join(PACKAGE_SUBMODULE_LOCATION, dataObject.include[childFolderName])
          });
        } else {
          modulePaths.push({
            name: childFolderName,
            location: path.join(PACKAGE_SUBMODULE_LOCATION, childFolderName)
          });
        }
      }
      return modulePaths;
    }
  } catch (e) {
    console.error(e);
  }
}




export function projectTypeExists(language_id, book_id) {
  let projectTypeExists = false;
  let projects = fs.readdirSync(DEFAULT_SAVE);
  for (var project of projects) {
    if (fs.existsSync(path.join(DEFAULT_SAVE, project, 'manifest.json'))) {
      let otherProjectManifest = fs.readJSONSync(path.join(DEFAULT_SAVE, project, 'manifest.json'));
      let otherBookId = otherProjectManifest.project ? otherProjectManifest.project.id : null;
      let otherProjectLanguage = otherProjectManifest.target_language ? otherProjectManifest.target_language.id : null;
      projectTypeExists = language_id === otherProjectLanguage && book_id === otherBookId;
    }
    if (projectTypeExists) return true;
  }
  return false;
}


export function projectAlreadyExists(newPath, oldPath) {
  let folderPathExists = fs.existsSync(newPath);
  let currentBookId = {};
  let currentProjectLanguage = {};
  if (fs.existsSync(path.join(oldPath, 'manifest.json'))) {
    let manifest = fs.readJSONSync(path.join(oldPath, 'manifest.json'));
    currentBookId = manifest.project ? manifest.project.id : null;
    currentProjectLanguage = manifest.target_language ? manifest.target_language.id : null;
  }
  else return folderPathExists;
  let projectTypeExists = this.projectTypeExists(currentProjectLanguage, currentBookId);
  return folderPathExists || projectTypeExists;
}