import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import { getTranslate } from '../../selectors';
// helpers
import * as ProjectImportFilesystemHelpers from '../../helpers/Import/ProjectImportFilesystemHelpers';
//actions
import * as ProjectDetailsActions from '../ProjectDetailsActions';
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const TEMP_DIR = IMPORTS_PATH + "-old";
/**
 * @description Moves a project from imports folder to projects folder
 */
export const move = () => {
  return ((dispatch, getState) => {
    return new Promise(async(resolve, reject) => {
      const translate = getTranslate(getState());
      try {
        const projectName = getState().localImportReducer.selectedProjectFilename;
        const projectPath = await ProjectImportFilesystemHelpers.move(projectName, translate);
        dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
        fs.removeSync(path.join(IMPORTS_PATH, projectName));
        resolve();
      } catch (error) {
        if (error && error.message && error.data) {
          reject(translate(error.message, error.data));
        }
        else reject(error);
      }
    });
  });
};

/**
 * Deletes  the imports folder. Since there had been a race condition,
 * It now renames the "to be deleted folder" then deletes it so that async functions
 * will not be confused.
 */
export const deleteProjectFromImportsFolder = () => {
console.log("deleteP...: Entry");
  return ()  => {
console.log("deleteP...: return");
    return new Promise( resolve => {
console.log("deleteP...: Promise");
      try {
        if (fs.statSync(IMPORTS_PATH)) {   
console.log("deleteP...: Folder is there");
          fs.renameSync(IMPORTS_PATH, TEMP_DIR);
          fs.remove(TEMP_DIR);
        }
console.log("deleteP...: Folder was there");
        resolve(true);
      } catch(e) {
console.log("deleteP...: Folder not there");
        resolve(false);
      } 
    });
  };
};

