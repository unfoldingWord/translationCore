import consts from './CoreActionConsts';
import Gogs from '../components/core/login/GogsApi';
import * as modalActions from './ModalActions';
import * as recentProjectsActions from './RecentProjectsActions';
import * as getDataActions from './GetDataActions';
import { openAlertDialog } from '../actions/AlertModalActions'
// constant declaration
const loadOnline = require('../components/core/LoadOnline');


export function changeShowOnlineView(val) {
    return ((dispatch, getState) => {
        var user = getState().loginReducer.userdata
            dispatch({
                type: consts.CHANGED_IMPORT_VIEW,
                view: val,
                user:user
            });
            dispatch(this.updateRepos());
    });
}

export function updateRepos() {
    return ((dispatch, getState) => {
        var user = getState().loginReducer.userdata;
        if (user) {
            var _this = this;
            Gogs().retrieveRepos(user.username).then((repos) => {
                dispatch({
                    type: consts.RECIEVE_REPOS,
                    repos: repos
                });
                dispatch({type: consts.GOGS_SERVER_ERROR, err: null}); //Equivalent of saying "there is no error, successfull fetch"
            }).catch((e)=>{
              console.log(e)
              dispatch({
                type: consts.GOGS_SERVER_ERROR,
                err: e
              })
            });
        }
    })
}

export function openOnlineProject(projectPath) {
    return ((dispatch) => {
        var link = 'https://git.door43.org/' + projectPath + '.git';
        var _this = this;
        loadOnline(link, function (err, savePath, url) {
            if (err) {
                var errmessage = "Problem occurred during import";
                if (err.syscall === "getaddrinfo") {
                    errmessage = "Unable to connect to the server. Please check your Internet connection.";
                }
                dispatch(openAlertDialog(errmessage));
                dispatch({ type: "LOADED_ONLINE_FAILED" })
            } else {
                dispatch(getDataActions.openProject(savePath, url));
            }
        });
    })
}

export function getLink(e) {
  return {
    type: consts.IMPORT_LINK,
    importLink: e.target.value
  };
}
/**
 * @description loads/doanloads a project repo using a door43 link.
 * @param {string} link - repo link to a door43 project.
 */
export function loadProjectFromLink(link) {
  return (dispatch => {
    if(link) {
      dispatch({ type: consts.SHOW_LOADING_CIRCLE });
    }
    loadOnline(link, (err, savePath, url) => {
      if (!err) {
        dispatch(getDataActions.openProject(savePath, url));
        dispatch({ type: consts.HIDE_LOADING_CIRCLE });
      } else {
        var errmessage = "An unknown problem occurred during import";

        if (err.toString().includes("fatal: unable to access")) {
           errmessage = "Unable to connect to the server. Please check your Internet connection.";
        } else if (err.toString().includes("fatal: repository")) {
            errmessage = "The URL does not reference a valid project";
        }

        dispatch(openAlertDialog(errmessage));
        dispatch({ type: consts.HIDE_LOADING_CIRCLE });
      }
    })
  });
}

// return new Promise(function(resolve, reject) {
//     scripturePaneData(projectDetails, bibles, actions, progress, scripturePaneSettings)
//     .then(() => {
//       tWFetchData(projectDetails, bibles, actions, progress, groupsIndexLoaded, groupsDataLoaded);
//     })
//     .then(resolve).catch(e => {
//       console.warn(e);
//     });
//   });
