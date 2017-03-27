const api = window.ModuleApi;
const consts = require('./CoreActionConsts');
const loadOnline = require('../components/core/LoadOnline');
import * as Gogs from '../components/core/login/GogsApi';
import * as modalActions from './ModalActions';
import * as recentProjectsActions from './RecentProjectsActions';
import * as getDataActions from './GetDataActions';

export function changeShowOnlineView (val) {
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

export function updateRepos () {
    return ((dispatch, getState) => {
        var user = getState().loginReducer.userdata;
        if (user) {
            var _this = this;
            Gogs.retrieveRepos(user.username).then((repos) => {
                dispatch({
                    type: consts.RECIEVE_REPOS,
                    repos: repos
                })
            });
        }
    })
}

export function openOnlineProject (projectPath) {
    return ((dispatch) => {
        var link = 'https://git.door43.org/' + projectPath + '.git';
        var _this = this;
        loadOnline(link, function (err, savePath, url) {
            if (err) {
                alert(err);
                dispatch({ type: "LOADED_ONLINE_FAILED" })
            } else {
                getDataActions.openProject(savePath, url, (err)=>{
                    if (!err) dispatch(recentProjectsActions.startLoadingNewProject());
                });
            }
        });
    })
}

export function getLink (e) {
    return {
        type: consts.IMPORT_LINK,
        importLink: e.target.value
    }
}

export function loadProjectFromLink (link) {
    return ((dispatch) => {
        loadOnline(link, function (err, savePath, url) {
            if (!err) {
                getDataActions.openProject(savePath, url, (err)=>{
                    if (!err) dispatch(recentProjectsActions.startLoadingNewProject());
                });
            } else {
                alert(err);
            }
        });
    })
}
