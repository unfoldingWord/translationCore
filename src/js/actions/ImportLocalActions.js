import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { remote } from 'electron';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as BodyUIActions from './BodyUIActions';
import * as ProjectSelectionActions from './ProjectSelectionActions';
import * as MyProjectsActions from './MyProjectsActions';
import * as ProjectDetailsActions from './ProjectDetailsActions';
//helpers
import * as usfmHelpers from '../helpers/usfmHelpers';
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
  return ((dispatch, getState) => {
    dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] }, (filePaths) => {
      dispatch(AlertModalActions.openAlertDialog(`Importing local project`, true));
      dispatch(BodyUIActions.toggleProjectsFAB());
      //no file path given
      if (!filePaths) dispatch(AlertModalActions.openAlertDialog('Project import cancelled', false));
      if (filePaths === undefined) {
        dispatch(AlertModalActions.openAlertDialog(ALERT_MESSAGE));
      }
      dispatch(verifyAndSelectProject(filePaths[0]));
    });
  });
}

function verifyAndSelectProject(sourcePath, url = '') {
  return ((dispatch) => {
    verifyProject(sourcePath).then(({ newProjectPath, type }) => {
      if (type) dispatch(ProjectDetailsActions.setProjectType(type));
      dispatch(ProjectSelectionActions.selectProject(newProjectPath));
      dispatch(AlertModalActions.openAlertDialog('Project imported successfully.', false));
    }).catch((err) => {
      dispatch(AlertModalActions.openAlertDialog(err));
      dispatch(ProjectSelectionActions.clearLastProject());
      /** Need to re-run projects retreival because a project may have been deleted */
      dispatch(MyProjectsActions.getMyProjects());
    })
  })
}

function verifyProject(sourcePath) {
  return new Promise((resolve, reject) => {
    if (!sourcePath) return reject('Unable to load selected project, please choose another.')
    const fileName = path.parse(sourcePath).base.split('.')[0];

    if (path.extname(sourcePath) === '.tstudio') {
      /** Must unzip before the file before project structure is verified */
      return unzipTStudioProject(sourcePath, fileName)
        .then(resolve)
        .catch(reject);
    }

    let usfmFilePath = usfmHelpers.isUSFMProject(sourcePath)
    if (usfmFilePath) {
      //If the selected project is a USFM file or contains a usfm file in the folder 
      const { homeFolderPath, exists } = usfmHelpers.setUpUSFMFolderPath(usfmFilePath);
      if (!homeFolderPath) console.warn(`Unable to create tC save location for project,
      \ this may be a bad project`);
      if (!exists && homeFolderPath) {
        return resolve({ newProjectPath: homeFolderPath, type: 'usfm' })
      } else if (exists && homeFolderPath) {
        return reject('The project you selected already exists.\
        Reimporting existing projects is not currently supported.')
      }
    }
    let newProjectPath = path.join(DEFAULT_SAVE, fileName);
    detectInvalidProjectStructure(sourcePath).then(() => {
      if (!fs.existsSync(newProjectPath) && !usfmFilePath)
        fs.copySync(sourcePath, newProjectPath)
      return resolve({ newProjectPath })
    }).catch(reject)
  })
}


function unzipTStudioProject(projectSourcePath, fileName) {
  return new Promise((resolve, reject) => {
    const zip = new AdmZip(projectSourcePath);
    const newProjectPath = path.join(DEFAULT_SAVE, fileName);
    if (!fs.existsSync(newProjectPath)) {
      zip.extractAllTo(DEFAULT_SAVE, /*overwrite*/true);
      resolve({ newProjectPath });
    } else {
      reject(`A project with the name ${fileName} already exists. Reimporting
         existing projects is not currently supported.`)
    }
  });
}


function detectInvalidProjectStructure(projectSourcePath) {
  return new Promise((resolve, reject) => {
    let invalidProjectTypeError = ProjectSelectionHelpers.verifyProjectType(projectSourcePath);
    if (invalidProjectTypeError) {
      reject(invalidProjectTypeError)
    } else {
      const projectManifestPath = path.join(projectSourcePath, "manifest.json");
      //make sure manifest exists before checking fields
      if (fs.existsSync(projectManifestPath)) {
        const projectManifest = fs.readJsonSync(projectManifestPath);
        if (projectManifest.target_language && projectManifest.project) {
          //Project manifest is valid
          resolve();
        } else {
          reject('Project manifest invalid.')
        }
      } else {
        reject('No valid manifest found in project.')
      }
    }
  })
}
