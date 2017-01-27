const api = window.ModuleApi;
const consts = require('./CoreActionConsts');
const loadOnline = require('../components/core/LoadOnline');
const Gogs = require('../components/core/login/GogsApi')();
const modalActions = require('./ModalActions');
const recentProjectsActions = require('./RecentProjectsActions');
const Upload = require('../components/core/UploadMethods.js');

module.exports.changeShowOnlineView = function (val) {
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

module.exports.updateRepos = function () {
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

module.exports.openOnlineProject = function (projectPath) {
    return ((dispatch) => {
        var link = 'https://git.door43.org/' + projectPath + '.git';
        var _this = this;
        loadOnline(link, function (err, savePath, url) {
            if (err) {
                alert(err);
                dispatch({ type: "LOADED_ONLINE_FAILED" })
            } else {
                Upload.sendFilePath(savePath, url, (err)=>{
                    if (!err) dispatch(recentProjectsActions.startLoadingNewProject());
                });
            }
        });
    })
}

module.exports.getLink = function (e) {
    return {
        type: consts.IMPORT_LINK,
        importLink: e.target.value
    }
}

module.exports.loadProjectFromLink = function (link) {
    return ((dispatch) => {
        loadOnline(link, function (err, savePath, url) {
            if (!err) {
                Upload.sendFilePath(savePath, url, (err)=>{
                    if (!err) dispatch(recentProjectsActions.startLoadingNewProject());
                });
            } else {
                alert(err);
            }
        });
    })
}  