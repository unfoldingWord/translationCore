/* eslint-disable no-console */
// modules
import fs from 'fs-extra';
import path from 'path-extra';
// constants
import consts from './ActionTypes';
// actions
import * as projectDetailsActions from './projectDetailsActions';
// helpers
import * as CopyrightCheckHelpers from '../helpers/CopyrightCheckHelpers';

/**
 * @description selects a projects license.
 * @param {String} selectedLicenseId 
 */
export function selectProjectLicense(selectedLicenseId) {
  return ((dispatch) => {
    if (selectedLicenseId !== 'none' && selectedLicenseId !== null) {
      dispatch(generateProjectLicense(selectedLicenseId));
    }
    dispatch({
      type: consts.SELECT_PROJECT_LICENSE_ID,
      selectedLicenseId
    })
  });
}

export function loadProjectLicenseMarkdownFile(licenseId) {
  return {
    type: consts.LOAD_PROJECT_LICENSE_MARKDOWN,
    projectLicenseMarkdown: CopyrightCheckHelpers.loadProjectLicenseMarkdownFile(licenseId).toString()
  }
}

export function generateProjectLicense(selectedLicenseId) {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    // savie LICENSE.md in project folder.
    CopyrightCheckHelpers.saveProjectLicense(selectedLicenseId, projectSaveLocation);
    // Add license Id to project manifest.
    dispatch(projectDetailsActions.addObjectPropertyToManifest('license', selectedLicenseId));
  });
}

// TODO: determine if this fucntion should be a helper instead.
export function validate() {
  return((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    const licensePath = path.join(projectSaveLocation, 'LICENSE.md');
    const manifestPath = path.join(projectSaveLocation, 'manifest.json');
    const manifest = fs.readJsonSync(manifestPath);

    if (!fs.existsSync(licensePath) || !manifest.rights) {
      console.log('no license')
    }
  });
}

