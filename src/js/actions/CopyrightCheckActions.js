/* eslint-disable no-console */
import consts from './ActionTypes';
// modules
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as CopyrightCheckHelpers from '../helpers/CopyrightCheckHelpers';
// actions
import * as projectDetailsActions from './ProjectDetailsActions';
import * as ProjectValidationActions from './ProjectValidationActions.js';
import * as AlertModalActions from './AlertModalActions';
import * as BodyUIActions from './BodyUIActions';
// constants
const COPYRIGHT_NAMESPACE = 'copyrightCheck';

// TODO: determine if this fucntion should be a helper instead.
export function validate() {
  return((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    const licensePath = path.join(projectSaveLocation, 'LICENSE.md');
    const manifestPath = path.join(projectSaveLocation, 'manifest.json');
    const manifest = fs.readJsonSync(manifestPath);

    if (!fs.existsSync(licensePath) || !manifest.license) {
      // no license was found in the project folder or the project manifest file.
      dispatch(ProjectValidationActions.addProjectValidationStep(COPYRIGHT_NAMESPACE));
    }
  });
}

export function finalize() {
  return((dispatch, getState) => {
    const { selectedLicenseId } = getState().copyrightCheckReducer;
    if (selectedLicenseId !== 'none' && selectedLicenseId !== null) {
      dispatch(generateProjectLicense(selectedLicenseId));
      dispatch({ type: consts.CLEAR_COPYRIGHT_CHECK_REDUCER });
      dispatch(ProjectValidationActions.removeProjectValidationStep(COPYRIGHT_NAMESPACE));
      dispatch(ProjectValidationActions.updateStepperIndex());
    } else {
      // show alert.
      dispatch(
        AlertModalActions.openOptionDialog(
          `translationCore only supports projects that are Public Domain or released under a CC0, CC BY, or CC BY-SA license.\n
          For further questions please contact help@door43.org.`,
          () => {
            // close project validation stepper
            dispatch(ProjectValidationActions.cancelProjectValidationStepper());
            dispatch(AlertModalActions.closeAlertDialog());
            dispatch(BodyUIActions.goToStep(2));
            dispatch({ type: consts.RESET_PROJECT_DETAIL });
          },
          'Cancel Import'
        )
      );
    }
  });
}

/**
 * @description selects a projects license.
 * @param {String} selectedLicenseId 
 */
export function selectProjectLicense(selectedLicenseId) {
  return ((dispatch) => {
    dispatch({
      type: consts.SELECT_PROJECT_LICENSE_ID,
      selectedLicenseId
    });
    dispatch(ProjectValidationActions.toggleNextButton(false));
  });
}

export function generateProjectLicense(selectedLicenseId) {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    // saves LICENSE.md in project folder.
    CopyrightCheckHelpers.saveProjectLicense(selectedLicenseId, projectSaveLocation);
    // Add license Id to project manifest.
    dispatch(projectDetailsActions.addObjectPropertyToManifest('license', selectedLicenseId));
  });
}

export function loadProjectLicenseMarkdownFile(licenseId) {
  return {
    type: consts.LOAD_PROJECT_LICENSE_MARKDOWN,
    projectLicenseMarkdown: CopyrightCheckHelpers.loadProjectLicenseMarkdownFile(licenseId).toString()
  };
}