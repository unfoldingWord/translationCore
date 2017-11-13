/* eslint-disable no-console */
import consts from './ActionTypes';
import Gogs from '../components/login/GogsApi';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as OnlineModeConfirmActions from './OnlineModeConfirmActions';
import * as ImportLocalActions from './ImportLocalActions';
// helpers
import * as loadOnline from '../helpers/LoadOnlineHelpers';
import * as CopyrightCheckHelpers from '../helpers/CopyrightCheckHelpers';

export function updateRepos() {
    return ((dispatch, getState) => {
        let user = getState().loginReducer.userdata;
        dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
            if (user) {
                dispatch(clearLink());
                dispatch(
                    AlertModalActions.openAlertDialog("Retrieving list of projects...", true)
                );

                Gogs().listRepos(user).then((repos) => {
                    dispatch(AlertModalActions.closeAlertDialog());
                    dispatch({
                        type: consts.RECIEVE_REPOS,
                        repos: repos
                    });
                    dispatch({ type: consts.GOGS_SERVER_ERROR, err: null }); //Equivalent of saying "there is no error, successfull fetch"
                }).catch((e) => {
                    console.log(e);
                    dispatch(AlertModalActions.closeAlertDialog());
                    dispatch({
                        type: consts.GOGS_SERVER_ERROR,
                        err: e
                    });
                });
            }
        }));
    });
}

/**
 * @description handles the import results.  If errMessage is not null then displays the error message.  Otherwise
 *                  it verifies and selects the project.
 * @param {function} dispatch
 * @param {string} url - url of project imported
 * @param {string} savePath - destination folder for project
 * @param {string} errMessage - if not null, then error message returned from load
 */
function handleImportResults(dispatch, url, savePath, errMessage) {
  if (errMessage) {
    dispatch(AlertModalActions.openAlertDialog(errMessage));
    dispatch({type: "LOADED_ONLINE_FAILED"});
    dispatch({type: consts.RESET_IMPORT_ONLINE_REDUCER});
  } else {
    dispatch({type: consts.RESET_IMPORT_ONLINE_REDUCER});
    dispatch(clearLink());
    dispatch(AlertModalActions.closeAlertDialog());
    // assign CC BY-SA license to projects imported from door43
    CopyrightCheckHelpers.assignLicenseToOnlineImportedProject(savePath);
    dispatch(ImportLocalActions.verifyAndSelectProject(savePath, url));
  }
}

/**
 * @description import online project
 * @return {function(*=, *)}
 */
export function importOnlineProject() {
  return ((dispatch, getState) => {
    const link = getState().importOnlineReducer.importLink;
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
      dispatch(
        AlertModalActions.openAlertDialog("Importing " + link + " Please wait...", true)
      );
      loadOnline.importOnlineProjectFromUrl(link, dispatch, handleImportResults);
    }));
  });
}

export function getLink(importLink) {
  return {
    type: consts.IMPORT_LINK,
    importLink
  };
}

export function clearLink() {
    return {
        type: consts.IMPORT_LINK,
        importLink: ""
    };
}
