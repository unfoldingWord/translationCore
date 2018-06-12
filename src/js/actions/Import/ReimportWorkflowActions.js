import path from 'path-extra';
import fs from 'fs-extra';
import ospath from 'ospath';
// actions
import * as AlertModalActions from '../AlertModalActions';
// helpers
import {getTranslate, getUsername} from '../../selectors';
import * as ProjectReimportHelpers from '../../helpers/Import/ProjectReimportHelpers';

const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

export const handleProjectReimport = (callback) => {
  return async (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const state = getState();
      const {
        localImportReducer: {
          selectedProjectFilename
        },
        projectDetailsReducer: {
          manifest: {
            project: {
              id
            }
          }
        }
      } = state;
      const projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
      ProjectReimportHelpers.preserveExistingProjectChecks(selectedProjectFilename, getTranslate(state));
      ProjectReimportHelpers.createVerseEditsForAllChangedVerses(selectedProjectFilename, id, getUsername(state));
      ProjectReimportHelpers.createInvalidatedsForAllCheckData(selectedProjectFilename, id, getUsername(state));
      fs.removeSync(projectPath);
      await dispatch(callback());
      resolve();
    });
  };
};

/**
 * Displays a confirmation dialog before users access the internet.
 * @param {string} message - the message in the alert box
 * @param {func} onConfirm - callback when the user allows reimport
 * @param {func} onCancel - callback when the user denies reimport
 * @return {Function} - returns a thunk for redux
 */
export const confirmReimportDialog = (message, onConfirm, onCancel) => {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const confirmText = translate('buttons.overwrite_project');
    const cancelText = translate('buttons.cancel_button');
    dispatch(AlertModalActions.openOptionDialog(message,
      (result) => {
        if (result !== cancelText) {
          dispatch(AlertModalActions.closeAlertDialog());
          onConfirm();
        } else {
          dispatch(AlertModalActions.closeAlertDialog());
          onCancel();
        }
      }, confirmText, cancelText));
  });
};
