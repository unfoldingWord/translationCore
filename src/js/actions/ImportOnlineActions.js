/* eslint-disable no-console */
import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as OnlineModeConfirmActions from './OnlineModeConfirmActions';
import * as ImportLocalActions from './ImportLocalActions';
// helpers
import * as loadOnline from '../helpers/LoadOnlineHelpers';
import * as GogsApiHelper from '../helpers/GogsApiHelper';

export function updateRepos() {
  return ((dispatch, getState) => {
    let user = getState().loginReducer.userdata;
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
      if (user) {
        dispatch(clearLink());
        dispatch(AlertModalActions.openAlertDialog("Retrieving list of projects...", true));

        GogsApiHelper.listRepos(user).then((repos) => {
          dispatch(AlertModalActions.closeAlertDialog());
          dispatch({
              type: consts.RECIEVE_REPOS,
              repos: repos
          });
          // Equivalent of saying "there is no error, successfull fetch"
          dispatch({ type: consts.GOGS_SERVER_ERROR, err: null });
        }).catch((err) => {
          console.log(err);
          dispatch(AlertModalActions.closeAlertDialog());
          dispatch({
            type: consts.GOGS_SERVER_ERROR,
            err
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
