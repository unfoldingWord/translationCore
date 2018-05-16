import React from 'react';
import path from 'path-extra';
import ospath from 'ospath';
import {ipcRenderer} from 'electron';
import consts from '../ActionTypes';
// actions
import * as BodyUIActions from '../BodyUIActions';
import * as AlertModalActions from '../AlertModalActions';
import * as ProjectMigrationActions from '../Import/ProjectMigrationActions';
import * as ProjectValidationActions from '../Import/ProjectValidationActions';
import * as ProjectImportFilesystemActions from './ProjectImportFilesystemActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
import * as TargetLanguageHelpers from '../../helpers/TargetLanguageHelpers';
// helpers
import * as FileConversionHelpers from '../../helpers/FileConversionHelpers';
import {getTranslate, getProjectManifest, getProjectSaveLocation} from '../../selectors';
import * as LoadHelpers from '../../helpers/LoadHelpers';
// constants
export const ALERT_MESSAGE = (
  <div>
    No file was selected. Please click on the
    <span style={{color: 'var(--accent-color-dark)', fontWeight: "bold"}}>
      &nbsp;Import Local Project&nbsp;
    </span>
    button again and select the project you want to load.
  </div>
);
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

/**
 * @description Action that dispatches other actions to wrap up local importing
 */
export const localImport = () => {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    // selectedProjectFilename and sourceProjectPath are populated by selectProjectMoveToImports()
    const {
      selectedProjectFilename,
      sourceProjectPath,
      existingProjectPath
    } = getState().localImportReducer;
    const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
    try {
      // convert file to tC acceptable project format
      await FileConversionHelpers.convert(sourceProjectPath, selectedProjectFilename);
      ProjectMigrationActions.migrate(importProjectPath);
      await dispatch(ProjectValidationActions.validate(importProjectPath));
      const manifest = getProjectManifest(getState());
      const updatedImportPath = getProjectSaveLocation(getState());
      if (!TargetLanguageHelpers.targetBibleExists(updatedImportPath, manifest)) {
        TargetLanguageHelpers.generateTargetBibleFromTstudioProjectPath(updatedImportPath, manifest);
        await delay(400);
        await dispatch(ProjectValidationActions.validate(updatedImportPath));
      }
      await dispatch(ProjectImportFilesystemActions.move());
      dispatch(MyProjectsActions.getMyProjects());
      await dispatch(ProjectLoadingActions.displayTools());
    } catch (error) {
      const errorMessage = error || translate('projects.import_error', {fromPath: sourceProjectPath, toPath: importProjectPath}); // default warning if exception is not set
      // Catch all errors in nested functions above
      if (error && (error.type !== 'div')) console.warn(error);
      // clear last project must be called before any other action.
      // to avoid triggering auto-saving.
      dispatch(ProjectLoadingActions.clearLastProject());
      dispatch(AlertModalActions.openAlertDialog(errorMessage));
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      // remove failed project import
      dispatch(ProjectImportFilesystemActions.deleteProjectFromImportsFolder());
    }
  };
};

/**
 * @description Action that dispatches other actions to wrap up local reimporting
 */
export const localReimport = () => {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    // selectedProjectFilename and sourceProjectPath are populated by selectProjectMoveToImports()
    const {
      selectedProjectFilename,
      sourceProjectPath,
      existingProjectPath
    } = getState().localImportReducer;
    const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
    debugger;
    try {
      // convert file to tC acceptable project format
      await FileConversionHelpers.convert(sourceProjectPath, selectedProjectFilename);
      ProjectMigrationActions.migrate(importProjectPath);
      // await dispatch(ProjectValidationActions.validate(importProjectPath));
      const manifest = LoadHelpers.loadFile(existingProjectPath, 'manifest.json');
      const updatedImportPath = getProjectSaveLocation(getState());
      if (!TargetLanguageHelpers.targetBibleExists(updatedImportPath, manifest)) {
        TargetLanguageHelpers.generateTargetBibleFromTstudioProjectPath(updatedImportPath, manifest);
        await delay(400);
        await dispatch(ProjectValidationActions.validate(updatedImportPath));
      }
      await dispatch(ProjectImportFilesystemActions.move());
      dispatch(MyProjectsActions.getMyProjects());
      await dispatch(ProjectLoadingActions.displayTools());
    } catch (error) {
      const errorMessage = error || translate('projects.reimport_error', {fromPath: sourceProjectPath, toPath: importProjectPath}); // default warning if exception is not set
      // Catch all errors in nested functions above
      if (error && (error.type !== 'div')) console.warn(error);
      // clear last project must be called before any other action.
      // to avoid triggering auto-saving.
      dispatch(ProjectLoadingActions.clearLastProject());
      dispatch(AlertModalActions.openAlertDialog(errorMessage));
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      // remove failed project import
      dispatch(ProjectImportFilesystemActions.deleteProjectFromImportsFolder());
    }
  };
};

/**
 * @description selects a project from the filesystem and moves it to tC imports folder.
 * @param sendSync - optional parameter to specify new sendSync function (useful for testing).
 * @param startLocalImport - optional parameter to specify new startLocalImport function (useful for testing).
 * Default is localImport()
 */
export function selectLocalProject(startLocalImport = localImport) {
  return (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const translate = getTranslate(getState());
      dispatch(BodyUIActions.dimScreen(true));
      dispatch(BodyUIActions.toggleProjectsFAB());
      // TODO: the filter name and dialog text should not be set here.
      // we should instead send generic data and load the text in the react component with localization
      // or at least we could insert the locale keys here.
      await delay(500);
      const options = {
        properties: ['openFile'],
        filters: [
          {name: translate('supported_file_types'), extensions: ['usfm', 'sfm', 'txt', 'tstudio', 'tcore']}
        ]
      };
      let filePaths = ipcRenderer.sendSync('load-local', {options: options});
      dispatch(BodyUIActions.dimScreen(false));
      // if import was cancel then show alert indicating that it was cancel
      if (filePaths && filePaths[0]) {
        dispatch(AlertModalActions.openAlertDialog(translate('projects.importing_local_alert'), true));
        const sourceProjectPath = filePaths[0];
        const selectedProjectFilename = path.parse(sourceProjectPath).base.split('.')[0] || '';
        await delay(100);
        dispatch({type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath});
        dispatch({type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename});
        await dispatch(startLocalImport());
        resolve();
      } else {
        dispatch(AlertModalActions.closeAlertDialog());
        resolve();
      }
    });
  };
}

/**
 * @description selects a project from the filesystem and reimports in into an existing project.
 * @param startLocalImport - optional parameter to specify new startLocalImport function (useful for testing).
 * Default is localImport()
 */
export function reimportLocalProject(projectPath, sta*rtLocalReimport = localReimport) {
  return ((dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      const translate = getTranslate(getState());
      const projectName = path.basename(projectPath);
      try {
        //Running migrations before exporting to attempt to fix any invalid alignments/usfm
        ProjectMigrationActions.migrate(projectPath);
        dispatch(BodyUIActions.dimScreen(true));
        await delay(300);

        const options = {
          properties: ['openFile'],
          filters: [
            {name: translate('supported_file_types'), extensions: ['usfm', 'sfm', 'txt']}
          ]
        };

        let filePaths = ipcRenderer.sendSync('load-local', {options: options});

        dispatch(BodyUIActions.dimScreen(false));

        if (filePaths && filePaths[0]) {
          const sourceProjectPath = filePaths[0];
          const selectedProjectFilename = projectName;
          dispatch(AlertModalActions.openAlertDialog(translate('projects.reimporting_project_alert', {file_name: sourceProjectPath, project_name: projectName}), true));
          await delay(100);
          debugger;
          dispatch({type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath});
          dispatch({type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename});
          dispatch({type: consts.UPDATE_EXISTING_PROJECT_PATH, projectPath});
          await dispatch(startLocalReimport());
          resolve();
        } else {``
          dispatch(AlertModalActions.closeAlertDialog());
          resolve();
        }
  

        // let usfmExportFile;
        // /** Name of project i.e. 57-TIT.usfm */
        // let projectName = exportHelpers.getUsfmExportName(manifest);
        // const loadingTitle = translate('projects.exporting_file_alert', {file_name: projectName});
        // dispatch(displayLoadingUSFMAlert(projectName, loadingTitle));
        // setTimeout(async () => {
        //   if (exportType === 'usfm2') {
        //     usfmExportFile = getUsfm2ExportFile(projectPath);
        //   } else if (exportType === 'usfm3') {
        //     /** Exporting to usfm3 also checking for invalidated alignments */
        //     usfmExportFile = await dispatch(WordAlignmentActions.getUsfm3ExportFile(projectPath));
        //   }
        //   dispatch(AlertModalActions.closeAlertDialog());
        //   /** Last place the user saved usfm */
        //   const usfmSaveLocation = getState().settingsReducer.usfmSaveLocation;
        //   /** File path from electron file chooser */
        //   const filePath = await exportHelpers.getFilePath(projectName, usfmSaveLocation, 'usfm');
        //   /** Getting new project name to save in case the user changed the save file name */
        //   projectName = path.parse(filePath).base.replace('.usfm', '');
        //   /** Saving the location for future exports */
        //   dispatch(storeUSFMSaveLocation(filePath, projectName));
        //   fs.writeFileSync(filePath, usfmExportFile);
        //   dispatch(displayUSFMExportFinishedDialog(projectName));
        //   resolve();
        // }, 200);
      } catch (err) {
        if (err) dispatch(AlertModalActions.openAlertDialog(err.message || err, false));
        reject(err);
      }
      dispatch(BodyUIActions.dimScreen(false));
    });
  });
}

function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}