/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';
// constants
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
 * @description creates an array that has the data of each included tool and 'subtool'
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

export function projectTypeExists(language_id, book_id, projectPath) {
  let projectTypeExists = false;
  let projects = fs.readdirSync(DEFAULT_SAVE);
  for (var project of projects) {
    /* If the we are checking the same path as the current project
     * we do not need to worry about it being a duplicate
     */
    if (path.join(DEFAULT_SAVE, project) === projectPath) continue;
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
