import consts from './CoreActionConsts';
import Gogs from '../components/core/login/GogsApi';
import * as modalActions from './ModalActions';
import * as recentProjectsActions from './RecentProjectsActions';
import * as getDataActions from './GetDataActions';
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
                })
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
                alert(err);
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
    dispatch({ type: consts.SHOW_LOADING_CIRCLE });
    loadOnline(link, (err, savePath, url) => {
      if (!err) {
        dispatch(getDataActions.openProject(savePath, url));
        dispatch({ type: consts.HIDE_LOADING_CIRCLE });
      } else {
        alert(err);
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
