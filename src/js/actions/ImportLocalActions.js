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
      if (!filePaths || !filePaths[0]) return dispatch(AlertModalActions.openAlertDialog('Project import cancelled', false));
      const sourcePath = filePaths[0];
      //Setup project based on project type
      dispatch(setUpNewProject(sourcePath));
    });
  });
}

function setUpNewProject(sourcePath) {
  return ((dispatch, getState) => {
    const { projects } = getState().myProjectsReducer;
    let usfmFilePath = usfmHelpers.isUSFMProject(sourcePath)
    if (path.extname(sourcePath) === '.tstudio') {
      //tS project zipped
      dispatch(ProjectDetailsActions.setProjectType('tS'));
      dispatch(setUpTsProject(sourcePath));
    } else if (verifyIsValidProject(sourcePath)) {
      //standard tC project
      const { target_language, project } = fs.readJsonSync(path.join(sourcePath, "manifest.json"));
      const alreadyImported = checkIfAlreadyImportedProject({ target_language, project }, projects);
      if (alreadyImported) return dispatch(AlertModalActions.openAlertDialog(
        <div>
          A project with the name {sourcePath} already exists. <br />
          Reimporting existing projects is not currently supported.
        </div>
      ));
      dispatch(ProjectDetailsActions.setProjectType('tC'));
      dispatch(AlertModalActions.openAlertDialog('Project imported successfully.', false));
      dispatch(ProjectSelectionActions.selectProject(sourcePath));
    } else if (usfmFilePath) {
      //usfm project
      dispatch(ProjectDetailsActions.setProjectType('usfm'));
      dispatch(setUpUSFMProject(usfmFilePath));
    }
    else {
      //Project type not identifiable
      dispatch(
        AlertModalActions.openAlertDialog(
          <div>
            There is something wrong with the project you are trying to load.<br />
            Please verify you are importing a valid project.<br />
            Filename: {sourcePath}
          </div>
        )
      );
    }
  });
}

/**
 * Sets up and returns a tC project folder in ~/translationCore/{languageID_bookName}/{bookName}.usfm
 * @param {string} usfmFilePath - File path to the usfm being selected for the project
 */
export function setUpUSFMProject(usfmFilePath) {
  return ((dispatch, getState) => {
    const { projects } = getState().myProjectsReducer;
    const usfmData = usfmHelpers.loadUSFMFile(usfmFilePath);
    const parsedUSFM = usfmHelpers.getParsedUSFM(usfmData);
    const usfmDetails = usfmHelpers.getUSFMDetails(parsedUSFM);
    /**If there is no identifiable book abbreviation then the usfm import should fail */
    if (!usfmDetails.book.id) return dispatch(
      AlertModalActions.openAlertDialog(
        <div>
          There was an error with loading the project no valid book id found.
        </div>
      )
    );
    let oldFolderName = path.parse(usfmFilePath).name.toLowerCase();
    let newFolderName = usfmDetails.language.id ? `${usfmDetails.language.id}_${usfmDetails.book.id}` : oldFolderName;
    let newUSFMProjectFolder = path.join(DEFAULT_SAVE, newFolderName);
    const newUSFMFilePath = path.join(newUSFMProjectFolder, usfmDetails.book.id) + '.usfm';
    const alreadyImported = checkIfAlreadyImportedProject({ target_language: usfmDetails.language, project: usfmDetails.book }, projects);
    if (alreadyImported)
      return dispatch(AlertModalActions.openAlertDialog(
        `A project with the name ${newUSFMProjectFolder} already exists. Reimporting
         existing projects is not currently supported.`
      ));
    fs.outputFileSync(newUSFMFilePath, usfmData);
    dispatch(ProjectSelectionActions.selectProject(newUSFMProjectFolder));
    dispatch(AlertModalActions.openAlertDialog('Project imported successfully.', false));
  })
}

function setUpTsProject(projectSourcePath) {
  return ((dispatch, getState) => {
    const { projects } = getState().myProjectsReducer;
    //base name of the project path, same as what tC uses as the project name
    const fileName = path.parse(projectSourcePath).base.split('.')[0];
    const zip = new AdmZip(projectSourcePath);
    const newProjectPath = path.join(DEFAULT_SAVE, fileName);
    if (!fs.existsSync(newProjectPath)) {
      zip.extractAllTo(DEFAULT_SAVE, /*overwrite*/true);
      if (verifyIsValidProject(newProjectPath)) {
        const { target_language, project } = fs.readJsonSync(path.join(sourcePath, "manifest.json"));
        const alreadyImported = checkIfAlreadyImportedProject({ target_language, project }, projects);
        if (alreadyImported)
          return dispatch(AlertModalActions.openAlertDialog(
            `A project with the name ${newProjectPath} already exists. Reimporting
             existing projects is not currently supported.`
          ));
        dispatch(ProjectSelectionActions.selectProject(newProjectPath));
        dispatch(AlertModalActions.openAlertDialog('Project imported successfully.', false));
      } else {
        fs.removeSync(newProjectPath);
        dispatch(
          AlertModalActions.openAlertDialog(
            <div>
              There is something wrong with the project you are trying to load.<br />
              Please verify you are importing a valid project.<br />
              Filename: {newProjectPath}
            </div>
          )
        );
      }
    } else {
      dispatch(AlertModalActions.openAlertDialog(
        `A project with the name ${fileName} already exists. Reimporting
         existing projects is not currently supported.`
      ));
    }
  });
}

function verifyIsValidProject(projectSourcePath) {
  try {
    const { target_language, project } = fs.readJsonSync(path.join(projectSourcePath, "manifest.json"));
    return !!target_language && !!project;
  } catch (e) {
    return false;
  }
}

function checkIfAlreadyImportedProject({ target_language, project }, projects) {
  try {
    let projectExists = false;
    for (let projectFromDefaultSaveLocation of projects) {
      const sameBook = projectFromDefaultSaveLocation.bookAbbr === project.id;
      const sameLanguage = projectFromDefaultSaveLocation.target_language.id === target_language.id;
      if (sameBook && sameLanguage) return true;
    }
    return false;
  } catch (e) {
    console.warn(e);
    return false;
  }
}