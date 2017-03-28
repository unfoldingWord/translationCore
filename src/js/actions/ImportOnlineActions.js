import consts from './CoreActionConsts';
import loadOnline from '../components/core/LoadOnline';
import gogs from '../components/core/login/GogsApi';
import recentProjectsActions from './RecentProjectsActions';
import {sendPath} from '../components/core/UploadMethods.js';
const Gogs = gogs();

export const changeShowOnlineView = function(val) {
  return ((dispatch, getState) => {
    var user = getState().loginReducer.userdata;
    dispatch({
      type: consts.CHANGED_IMPORT_VIEW,
      view: val,
      user: user
    });
    dispatch(this.updateRepos());
  });
};

export const updateRepos = function() {
  return ((dispatch, getState) => {
    var user = getState().loginReducer.userdata;
    if (user) {
      Gogs.retrieveRepos(user.username).then((repos) => {
        dispatch({
          type: consts.RECIEVE_REPOS,
          repos: repos
        });
      });
    }
  });
};

export const openOnlineProject = function(projectPath) {
  return ((dispatch) => {
    var link = 'https://git.door43.org/' + projectPath + '.git';
    loadOnline(link, function(err, savePath, url) {
      if (err) {
        alert(err);
        dispatch({type: "LOADED_ONLINE_FAILED"});
      } else {
        sendPath(savePath, url, (err) => {
          if (!err) dispatch(recentProjectsActions.startLoadingNewProject());
        });
      }
    });
  });
};

export const getLink = function(e) {
  return {
    type: consts.IMPORT_LINK,
    importLink: e.target.value
  };
};

export const loadProjectFromLink = function(link) {
  return ((dispatch) => {
    loadOnline(link, function(err, savePath, url) {
      if (!err) {
        sendPath(savePath, url, (err) => {
          if (!err) dispatch(recentProjectsActions.startLoadingNewProject());
        });
      } else {
        alert(err);
      }
    });
  });
};
