import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { remote } from 'electron';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as BodyUIActions from './BodyUIActions';
import * as ProjectSelectionActions from './ProjectSelectionActions';
import * as ProjectDetailsActions from './projectDetailsActions';
//helpers
import * as usfmHelpers from '../helpers/usfmHelpers';
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
export function selectLocalProjectToLoad() {
  return ((dispatch) => {
    dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] }, (filePaths) => {
      dispatch(AlertModalActions.openAlertDialog(`Importing local project`, true));
      dispatch(BodyUIActions.toggleProjectsFAB());
      //no file path given
      if (!filePaths || filePaths[0]) dispatch(AlertModalActions.openAlertDialog('Project import cancelled', false));
      const sourcePath = filePaths[0];
      // project path in ~./translationCore.
      //get project type
      dispatch(setUpNewProject(sourcePath));
      //display sucessful project loaded dialog
      dispatch(AlertModalActions.openAlertDialog('Project imported successfully.', false));
    });
  });
}

function setUpNewProject(projectPath) {
  let newProjectPath;
  let usfmFilePath = usfmHelpers.isUSFMProject(sourcePath)
  const fileName = path.parse(sourcePath).base.split('.')[0];
  if (path.extname(sourcePath) === '.tstudio') {
    dispatch(ProjectDetailsActions.setProjectType('tS'));
    newProjectPath = path.join(DEFAULT_SAVE, fileName);
    setUpTsProject(sourcePath, fileName);
  } else if (usfmFilePath) {
    newProjectPath = 
    dispatch(ProjectDetailsActions.setProjectType('usfm'));
    dispatch(usfmHelpers.setUpUSFMProject(usfmFilePath));
  }
  if (!verifyIsValidProject(sourcePath)) {
    return;
  }
  if (fs.existsSync(newProjectPath)) {
    dispatch(AlertModalActions.openAlertDialog(
      `A project with the name ${fileName} already exists. Reimporting
       existing projects is not currently supported.`
    ));
  }
}

function setUpProjectByType() {


}

function setUpTsProject(projectSourcePath, fileName) {
  return ((dispatch) => {
    const zip = new AdmZip(projectSourcePath);
    if (!fs.existsSync(newProjectPath)) {
      zip.extractAllTo(DEFAULT_SAVE, /*overwrite*/true);
    }
  });
}

function verifyIsValidProject(projectSourcePath) {
  const projectManifestPath = path.join(projectSourcePath, "manifest.json");
  if (fs.existsSync(projectManifestPath)) {
    const projectManifest = fs.readJsonSync(projectManifestPath);
    if (projectManifest.target_language && projectManifest.project) {
      return true;
    }
  }
  return false;
}