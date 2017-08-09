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
  return ((dispatch, getState) => {
    const { licenses } = getState().copyrightCheckReducer;
    const { projectSaveLocation } = getState().projectDetailsReducer;
    const selectedLicense = licenses.filter((license) => {
      return license.id = selectedLicenseId;
    })[0];
    // savie LICENSE.md in project folder.
    console.log(selectedLicense.id)
    CopyrightCheckHelpers.saveProjectLicense(selectedLicense.id, projectSaveLocation);
    // Add license Id to project manifest.
    dispatch(projectDetailsActions.addObjectPropertyToManifest('rights', selectedLicense.id));
    dispatch({
      type: consts.SELECT_PROJECT_LICENSE_ID,
      selectedLicenseId
    })
  });
}

// TODO: determine if this fucntion should be a helper instead.
export function checkProjectCopyrightLicense() {
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

