import ospath from 'ospath';
import fs from 'fs-extra';
import path from 'path-extra';
import { ipcRenderer } from 'electron';
//consts
const OSX_DOCUMENTS_PATH = path.join(ospath.home(), 'Documents');
const WIN_DOCUMENTS_PATH = path.join(ospath.home(), 'My Documents');
//helpers
import * as manifestHelpers from './manifestHelpers';
import * as bibleHelpers from './bibleHelpers';
import * as LoadHelpers from "./LoadHelpers";

/**
 * Prompts the user to enter a location/name to save the usfm project.
 * Returns the path to save.
 * @param {string} projectName - Name of the project being exported (This can be altered by the user
 * when saving)
 * @param {string} lastSaveLocation - The last save location from the user. Coming from the settings reducer.
 * @param {string} ext - The extension to export the file with
 */
export function getFilePath(projectName, lastSaveLocation, ext) {
  /**Path to save the usfm file @type {string}*/
  let defaultPath;
  if (lastSaveLocation) {
    /**trys default save location first then trys different OS's */
    defaultPath = path.join(lastSaveLocation, projectName + `.${ext}`);
  }
  else if (fs.existsSync(OSX_DOCUMENTS_PATH)) {
    defaultPath = path.join(OSX_DOCUMENTS_PATH, projectName + `.${ext}`);
  } else if (fs.existsSync(WIN_DOCUMENTS_PATH)) {
    defaultPath = path.join(WIN_DOCUMENTS_PATH, projectName + `.${ext}`);
  }
  else {
    defaultPath = path.join(ospath.home(), projectName + `.${ext}`);
  }
  return ipcRenderer.sendSync('save-as', { options: { defaultPath: defaultPath, filters: [{ extensions: [ext] }], title: 'Save Export As' } });
}

/**
 * add entry to headers with optional overwrite
 * @param {array} headers
 * @param {object} add - verseObject type to add
 * @param {boolean} overWrite - if true then we replace existing entry
 */
let addHeader = function (headers, add, overWrite) {
  const index = headers.findIndex(item => (item.tag === add.tag));
  if (index >= 0) {
    if (overWrite) {
      headers[index] = add;
    }
  } else {
    headers.push(add);
  }
};

/**
 * This function uses the manifest to populate the usfm JSON object id key in preparation
 * of usfm to JSON conversion
 * @param {string} projectSaveLocation - Path location in the filesystem for the project.
 */
export function getHeaderTags(projectSaveLocation) {
  const manifest = manifestHelpers.getProjectManifest(projectSaveLocation);
  const bookName = manifest.project.id;
  /**Has fields such as "language_id": "en" and "resource_id": "ulb" and "direction":"ltr"*/
  let sourceTranslation = manifest.source_translations[0];
  let resourceName = sourceTranslation && sourceTranslation.language_id && sourceTranslation.resource_id ?
    `${sourceTranslation.language_id.toUpperCase()}_${sourceTranslation.resource_id.toUpperCase()}` :
    'N/A';
  /**This will look like: ar_العربية_rtl to be included in the usfm id.
   * This will make it easier to read for tC later on */
  let targetLanguageCode = manifest.target_language ?
    `${manifest.target_language.id}_${manifest.target_language.name}_${manifest.target_language.direction}` :
    'N/A';
  /**Date object when project was las changed in FS */
  let lastEdited = fs.statSync(path.join(projectSaveLocation), bookName).atime;
  let bookNameUppercase = bookName.toUpperCase();
  let headers = LoadHelpers.loadFile(path.join(projectSaveLocation, bookName), 'headers.json');
  headers = headers || {};
  /**Note the indication here of tc on the end of the id. This will act as a flag to ensure the correct parsing*/
  const id = {
    "content": `${bookNameUppercase} ${resourceName} ${targetLanguageCode} ${lastEdited} tc`,
    "tag": "id"
  };
  addHeader(headers, id, true);
  const h = {
    "content": bibleHelpers.convertToFullBookName(bookName),
    "tag": "h"
  };
  addHeader(headers, h, false);
  return headers;
}
