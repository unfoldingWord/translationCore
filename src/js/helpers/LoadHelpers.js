/* eslint-disable no-console */
import Path from 'path-extra';
import * as fs from 'fs-extra';
// helpers
import * as usfmHelpers from './usfmHelpers';

const PACKAGE_SUBMODULE_LOCATION = Path.join(window.__base, 'tC_apps');
const DEFAULT_SAVE = Path.join(Path.homedir(), 'translationCore', 'projects');

/**
 *
 * @param {string} path - Directorty of the file to load, not the file name.
 * @param {string} file - The file name to load.
 */
export function loadFile(path, file) {
  try {
    var manifest = fs.readJsonSync(Path.join(path, file));
    return manifest;
  }
  catch (e) {
    return null
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
  const parsedPath = Path.parse(projectPath);
  const tCProjectsSaveLocation = Path.join(DEFAULT_SAVE, parsedPath.name);

  if (!fs.existsSync(projectPath)) {
    return false;
  }
  if (fs.existsSync(tCProjectsSaveLocation)) {
    return tCProjectsSaveLocation;
  } else {
    let newPath = tCProjectsSaveLocation
    if (usfmHelpers.isUSFMProject(projectPath) !== false) {
      newPath = Path.join(tCProjectsSaveLocation, parsedPath.name);
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
            location: Path.join(PACKAGE_SUBMODULE_LOCATION, dataObject.include[childFolderName])
          });
        } else {
          modulePaths.push({
            name: childFolderName,
            location: Path.join(PACKAGE_SUBMODULE_LOCATION, childFolderName)
          });
        }
      }
      return modulePaths;
    }
  } catch (e) {
    console.error(e)
  }
}
