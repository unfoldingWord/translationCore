/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';
import env from 'tc-electron-env';
import { TC_PATH } from '../common/constants';
// constants
const DEFAULT_SAVE = path.join(env.home(), TC_PATH, 'projects');

/**
 * Loads a json file.
 * @param {string} directory - Directorty of the file to load, not the file name.
 * @param {string} file - The file name to load.
 */
export function loadFile(directory, file) {
  if (!directory) {
    return null;
  }

  const pathLocation = path.join(directory, file);

  if (fs.existsSync(pathLocation)) {
    return fs.readJsonSync(pathLocation);
  } else {
    return null;
  }
}

/**
 * Loads a json file.
 * @param {string} directory - Directorty of the file to load, not the file name.
 * @param {string} file - The file name to load.
 */
export async function loadFileAsync(directory, file) {
  if (!directory) {
    return null;
  }

  const pathLocation = path.join(directory, file);

  if (await fs.exists(pathLocation)) {
    return fs.readJson(pathLocation);
  } else {
    return null;
  }
}

/**
 * @deprecated
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
    if (path.join(DEFAULT_SAVE, project) === projectPath) {
      continue;
    }

    if (fs.existsSync(path.join(DEFAULT_SAVE, project, 'manifest.json'))) {
      let otherProjectManifest = fs.readJSONSync(path.join(DEFAULT_SAVE, project, 'manifest.json'));
      let otherBookId = otherProjectManifest.project ? otherProjectManifest.project.id : null;
      let otherProjectLanguage = otherProjectManifest.target_language ? otherProjectManifest.target_language.id : null;
      projectTypeExists = language_id === otherProjectLanguage && book_id === otherBookId;
    }

    if (projectTypeExists) {
      return true;
    }
  }
  return false;
}
