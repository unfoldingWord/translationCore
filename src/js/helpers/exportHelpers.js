import ospath from 'ospath';
import fs from 'fs-extra';
import path from 'path-extra';
import { ipcRenderer } from 'electron';
//consts
const OSX_DOCUMENTS_PATH = path.join(ospath.home(), 'Documents');
const WIN_DOCUMENTS_PATH = path.join(ospath.home(), 'My Documents');

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