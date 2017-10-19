import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { remote } from 'electron';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as ProjectSelectionActions from './ProjectSelectionActions';
import * as MyProjectsActions from './MyProjectsActions';
import * as ProjectDetailsActions from './ProjectDetailsActions';
import * as BodyUIActions from './BodyUIActions';
//helpers
import * as usfmHelpers from '../helpers/usfmHelpers';
import * as LoadHelpers from '../helpers/LoadHelpers';
import * as ProjectSelectionHelpers from '../helpers/ProjectSelectionHelpers';
// contstants
const { dialog } = remote;
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');
const ALERT_MESSAGE = (
  <div>
    No file was selected. Please click on the
    <span style={{ color: 'var(--accent-color-dark)', fontWeight: "bold" }}>
      &nbsp;Import Local Project&nbsp;
    </span>
    button again and select the project you want to load.
  </div>
);

/**
 * @description selects a project from the filesystem and loads it up to tC.
 */
export function loadProjectFromFS() {
  return ((dispatch) => {
    dispatch(BodyUIActions.toggleProjectsFAB());
    dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] }, (filePaths) => {
      dispatch(AlertModalActions.openAlertDialog(`Importing local project`, true));
      if (filePaths === undefined || !filePaths[0]) {
        return dispatch(AlertModalActions.openAlertDialog(ALERT_MESSAGE));
      }
      setTimeout(() => {
        dispatch(verifyAndSelectProject(filePaths[0]));
      }, 100);
    });
  });
}

/**
 * Verifies the selected project and initiates it into the loading process
 * @param {string} sourcePath - Path of project to load
 * @param {string} url - Url for git repository
 */
export function verifyAndSelectProject(sourcePath, url) {
  return ((dispatch) => {
    //Finding the project type and validility
    verifyProject(sourcePath, url).then(({ newProjectPath, type }) => {
      //Will only set the type if it is usfm, but can be used for other uses in future
      if (type) dispatch(ProjectDetailsActions.setProjectType(type));
      dispatch(ProjectSelectionActions.selectProject(newProjectPath));
      dispatch(AlertModalActions.openAlertDialog('Project imported successfully.', false));
    }).catch((err) => {
      //If there is an error wee need to clear everything that was loaded
      dispatch(AlertModalActions.openAlertDialog(err));
      dispatch(ProjectSelectionActions.clearLastProject());
      /** Need to re-run projects retreival because a project may have been deleted */
      dispatch(MyProjectsActions.getMyProjects());
    });
  });
}

/**
 * Verifies the selected project
 * @param {string} sourcePath - Path of project to load
 * @param {string} url - Url for git repository
 * @returns {<Promise>(resolve, reject)}
 */
function verifyProject(sourcePath, url) {
  return new Promise((resolve, reject) => {
    let tSProject = false;
    if (!sourcePath) return reject('Unable to load selected project, please choose another.');
    const fileNameSplit = path.parse(sourcePath).base.split('.') || [''];
    const fileName = fileNameSplit[0];
    if (!fileName) return reject('Problem getting project path');

    if (path.extname(sourcePath) === '.tstudio') {
      /** Must unzip before the file before project structure is verified */
      const zip = new AdmZip(sourcePath);
      let oldPath = sourcePath;
      sourcePath = path.join(DEFAULT_SAVE, fileName);
      if (!LoadHelpers.projectAlreadyExists(sourcePath, oldPath)) {
        zip.extractAllTo(DEFAULT_SAVE, /*overwrite*/true);
        tSProject = true;
      } else {
        return reject(`A project with the name ${fileName} already exists. Reimporting
           existing projects is not currently supported.`);
      }
    }

    let usfmFilePath = usfmHelpers.isUSFMProject(sourcePath);
    /**
     * If the project is not being imported from online there is no use
     * for the usfm process. 
     * TODO: Create way for regular USFM files to be imported from online
     */
    if (usfmFilePath && !url) {
      //Storing USFM in tC save location i.e. ~/translationCore/tit.usfm
      const { homeFolderPath, alreadyImported } = usfmHelpers.setUpUSFMFolderPath(usfmFilePath);
      if (!alreadyImported && homeFolderPath) {
        return resolve({ newProjectPath: homeFolderPath, type: 'usfm' });
      } else if (alreadyImported && homeFolderPath) {
        return reject('The project you selected already exists.\
        Reimporting existing projects is not currently supported.');
      }
    }
    /** Projects here should be tC fromatted */
    detectInvalidProjectStructure(sourcePath).then(() => {
      let newProjectPath = path.join(DEFAULT_SAVE, fileName);
      if (!usfmFilePath && !url && !tSProject) {
        if (!LoadHelpers.projectAlreadyExists(newProjectPath, sourcePath))
          fs.copySync(sourcePath, newProjectPath);
        else return reject('The project you selected already exists.\
      Reimporting existing projects is not currently supported.');
      }
      return resolve({ newProjectPath, type: 'tC' });
    }).catch(reject);
  });
}

/**
 * Wrapper function for detecting invalid folder/file structures for expected
 * tC projects.
 * @param {string} sourcePath - Path of project to check for a valid structure
 * @returns {<Promise>(resolve, reject)}
 */
function detectInvalidProjectStructure(sourcePath) {
  return new Promise((resolve, reject) => {
    let invalidProjectTypeError = ProjectSelectionHelpers.verifyProjectType(sourcePath);
    if (invalidProjectTypeError) {
      return reject(invalidProjectTypeError);
    } else {
      const projectManifestPath = path.join(sourcePath, "manifest.json");
      const projectTCManifestPath = path.join(sourcePath, "tc-manifest.json");
      const validManifestPath = fs.existsSync(projectManifestPath) ? projectManifestPath
        : fs.existsSync(projectTCManifestPath) ? projectTCManifestPath : null;
      //make sure manifest exists before checking fields
      if (validManifestPath) {
        const projectManifest = fs.readJsonSync(validManifestPath);
        if (projectManifest.project) {
          //Project manifest is valid, not checking for book id because it can be fixed later
          return resolve();
        } else {
          return reject('Project manifest invalid.');
        }
      } else {
        return reject('No valid manifest found in project.');
      }
    }
  });
}
