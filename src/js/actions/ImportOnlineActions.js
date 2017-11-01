/* eslint-disable no-console */
import consts from './ActionTypes';
import Gogs from '../components/login/GogsApi';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as OnlineModeConfirmActions from './OnlineModeConfirmActions';
import * as ImportLocalActions from './ImportLocalActions';
// helpers
import * as loadOnline from '../helpers/LoadOnlineHelpers';

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

export function importOnlineProject() {
  return ((dispatch, getState) => {
    const link = getState().importOnlineReducer.importLink;
    dispatch(confirmOnlineAction(() => {
      dispatch(
        AlertModalActions.openAlertDialog("Importing " + link + " Please wait...", true)
      );

      loadOnline.openManifest(link, function (err, savePath, url) {
        if (err) {
          let errmessage = "An unknown problem occurred during import";

          if (err.toString().includes("fatal: unable to access")) {
              errmessage = "Unable to connect to the server. Please check your Internet connection.";
          } else if (err.toString().includes("fatal: The remote end hung up")) {
              errmessage = "Unable to connect to the server. Please check your Internet connection.";
          } else if (err.toString().includes("Failed to load")) {
              errmessage = "Unable to connect to the server. Please check your Internet connection.";
          } else if (err.toString().includes("fatal: repository")) {
              errmessage = "The URL does not reference a valid project";
          } else if (err.type && err.type === "custom") {
              errmessage = err.text;
          }

          dispatch(AlertModalActions.openAlertDialog(errmessage));
          dispatch({ type: "LOADED_ONLINE_FAILED" });
          dispatch({ type: consts.RESET_IMPORT_ONLINE_REDUCER });
        } else {
          dispatch({ type: consts.RESET_IMPORT_ONLINE_REDUCER });
          dispatch(clearLink());
          dispatch(AlertModalActions.closeAlertDialog());
          dispatch(ImportLocalActions.verifyAndSelectProject(savePath, url));
        }
      });
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

