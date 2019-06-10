import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import { getTranslate } from '../../selectors';
// helpers
import * as ProjectImportFilesystemHelpers from '../../helpers/Import/ProjectImportFilesystemHelpers';
import {delay} from "../../helpers/bodyUIHelpers";
// actions
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as AlertModalActions from '../AlertModalActions';
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

/**
 * @description Moves a project from imports folder to projects folder
 */
export const move = () => {
  return ((dispatch, getState) => {
    return new Promise(async(resolve, reject) => {
      const translate = getTranslate(getState());
      dispatch(AlertModalActions.openAlertDialog(translate("projects.preparing_project_alert"), true));
      await delay(200);
      try {
        const projectName = getState().localImportReducer.selectedProjectFilename;
        console.log("ProjectImportFilesystemActions.move() - moving project from import folder");
        const projectPath = await ProjectImportFilesystemHelpers.moveProject(projectName, translate);
        console.log("ProjectImportFilesystemActions.move() - moving project from import folder to: " + projectPath);
        dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
        fs.removeSync(path.join(IMPORTS_PATH, projectName));
        dispatch(AlertModalActions.closeAlertDialog());
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

